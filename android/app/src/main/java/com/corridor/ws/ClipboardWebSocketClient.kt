package com.corridor.ws

import android.content.Context
import android.util.Log
import com.corridor.util.ApiClient
import com.corridor.util.PendingSyncQueue
import kotlinx.coroutines.*
import okhttp3.*
import org.json.JSONObject

data class HistoryItem(
    val id: String,
    val content: String,
    val timestamp: Long
)

class ClipboardWebSocketClient(
    private val context: Context,
    private val token: String,
    private val onRemoteClipboard: (String) -> Unit,
    private val onStatus: (String) -> Unit = {},
    private val onError: (String) -> Unit = {},
    private val onHistory: (List<HistoryItem>) -> Unit = {},
    private val onHistoryItemReceived: (HistoryItem) -> Unit = {}
) {
    private var ws: WebSocket? = null
    private val client = OkHttpClient()
    private var isConnected = false
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var pingJob: Job? = null
    private var lastPongTime = System.currentTimeMillis()
    private var pongTimeoutJob: Job? = null

    companion object {
        private const val TAG = "ClipboardWebSocket"
        private const val PING_INTERVAL = 30000L // 30 seconds
        private const val PONG_TIMEOUT = 60000L // 60 seconds without pong = disconnect
    }

    fun connect() {
        val url = ApiClient.getWebSocketUrl(token)
        Log.d(TAG, "Connecting to WebSocket: $url")
        onStatus("connecting")
        val request = Request.Builder()
            .url(url)
            .build()
        ws = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                isConnected = true
                lastPongTime = System.currentTimeMillis()
                onStatus("connected")
                Log.d(TAG, "WebSocket connected")

                // Server automatically sends clipboard_history on connection
                // No need to request it manually

                // Flush pending queue
                flushPendingQueue()

                startPing()
                startPongTimeout()
            }
            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    Log.d(TAG, "Received message: ${text.take(100)}...")
                    val obj = JSONObject(text)
                    when (obj.optString("type")) {
                        "clipboard_update" -> {
                            val data = obj.optJSONObject("data")
                            val content = data?.optString("content") ?: ""
                            val timestamp = data?.optLong("timestamp") ?: System.currentTimeMillis()
                            val id = data?.optString("id") ?: ""
                            Log.d(TAG, "Received clipboard_update: id=$id, timestamp=$timestamp, content=${content.take(50)}...")

                            // Pass full item to callback for immediate history update
                            if (id.isNotEmpty()) {
                                onHistoryItemReceived(HistoryItem(id, content, timestamp))
                            }

                            // Also write to clipboard
                            onRemoteClipboard(content)
                        }
                        "error" -> {
                            val msg = obj.optString("error", "Unknown error")
                            Log.e(TAG, "Received error: $msg")
                            onError(msg)
                        }
                        "pong" -> {
                            lastPongTime = System.currentTimeMillis()
                            Log.d(TAG, "Received pong, last pong time updated")
                        }
                        "clipboard_history" -> {
                            Log.d(TAG, "Received clipboard_history")
                            val historyArray = obj.optJSONArray("history")
                            if (historyArray != null) {
                                val items = mutableListOf<HistoryItem>()
                                for (i in 0 until historyArray.length()) {
                                    val item = historyArray.getJSONObject(i)
                                    items.add(HistoryItem(
                                        id = item.optString("id", ""),
                                        content = item.optString("content", ""),
                                        timestamp = item.optLong("timestamp", 0)
                                    ))
                                }
                                Log.d(TAG, "Parsed ${items.size} history items")
                                onHistory(items)
                            }
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error parsing message", e)
                    onError("Invalid message: ${e.message}")
                }
            }
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                isConnected = false
                stopPing()
                stopPongTimeout()
                Log.e(TAG, "WebSocket failure: ${t.message}", t)
                onStatus("disconnected")
                onError(t.message ?: "connection_failed")
            }
            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                isConnected = false
                stopPing()
                stopPongTimeout()
                Log.d(TAG, "WebSocket closed: code=$code, reason=$reason")
                onStatus("closed")
            }
        })
    }

    private fun startPing() {
        stopPing()
        pingJob = scope.launch {
            while (isActive && isConnected) {
                delay(PING_INTERVAL)
                try {
                    val pingMsg = JSONObject()
                    pingMsg.put("type", "ping")
                    ws?.send(pingMsg.toString())
                    Log.d(TAG, "Ping sent")
                } catch (e: Exception) {
                    Log.e(TAG, "Error sending ping: ${e.message}")
                }
            }
        }
    }

    private fun startPongTimeout() {
        stopPongTimeout()
        pongTimeoutJob = scope.launch {
            while (isActive && isConnected) {
                delay(10000) // Check every 10 seconds
                val timeSinceLastPong = System.currentTimeMillis() - lastPongTime
                if (timeSinceLastPong > PONG_TIMEOUT) {
                    Log.e(TAG, "Pong timeout! No pong received for ${timeSinceLastPong}ms")
                    onError("Connection timeout - no pong received")
                    ws?.close(1001, "Pong timeout")
                    break
                }
            }
        }
    }

    private fun stopPing() {
        pingJob?.cancel()
        pingJob = null
    }

    private fun stopPongTimeout() {
        pongTimeoutJob?.cancel()
        pongTimeoutJob = null
    }

    fun disconnect() {
        stopPing()
        stopPongTimeout()
        scope.cancel()
        ws?.close(1000, "Service stopped")
        ws = null
    }
    fun sendClipboardUpdate(content: String) {
        Log.d(TAG, "sendClipboardUpdate called, isConnected=$isConnected, content length=${content.length}")
        if (isConnected) {
            try {
                val obj = JSONObject()
                obj.put("type", "clipboard_update")
                val data = JSONObject()
                data.put("content", content)
                data.put("timestamp", System.currentTimeMillis())
                data.put("id", java.util.UUID.randomUUID().toString())
                obj.put("data", data)
                val message = obj.toString()
                Log.d(TAG, "Sending WebSocket message: ${message.take(100)}...")
                val sent = ws?.send(message) ?: false
                Log.d(TAG, "WebSocket send result: $sent")
            } catch (e: Exception) {
                Log.e(TAG, "Error sending clipboard update", e)
                onError("Failed to send: ${e.message}")
            }
        } else {
            Log.w(TAG, "Cannot send - WebSocket not connected, adding to pending queue")
            PendingSyncQueue.add(context, content)
            val queueSize = PendingSyncQueue.size(context)
            Log.d(TAG, "Added to pending queue, queue size: $queueSize")
        }
    }

    fun sendClearHistory() {
        Log.d(TAG, "sendClearHistory called, isConnected=$isConnected")
        if (isConnected) {
            try {
                val obj = JSONObject()
                obj.put("type", "clear_history")
                val message = obj.toString()
                Log.d(TAG, "Sending clear_history message")
                val sent = ws?.send(message) ?: false
                Log.d(TAG, "WebSocket send result: $sent")
            } catch (e: Exception) {
                Log.e(TAG, "Error sending clear history", e)
                onError("Failed to clear history: ${e.message}")
            }
        } else {
            Log.w(TAG, "Cannot send clear history - WebSocket not connected")
            onError("WebSocket not connected")
        }
    }

    private fun flushPendingQueue() {
        try {
            val pendingItems = PendingSyncQueue.getAll(context)
            if (pendingItems.isEmpty()) {
                Log.d(TAG, "No pending items to sync")
                return
            }

            Log.d(TAG, "Flushing ${pendingItems.size} pending items from queue")
            var successCount = 0

            for (item in pendingItems) {
                if (isConnected) {
                    try {
                        val obj = JSONObject()
                        obj.put("type", "clipboard_update")
                        val data = JSONObject()
                        data.put("content", item.content)
                        data.put("timestamp", item.timestamp)
                        data.put("id", java.util.UUID.randomUUID().toString())
                        obj.put("data", data)
                        val message = obj.toString()
                        val sent = ws?.send(message) ?: false
                        if (sent) {
                            successCount++
                            Log.d(TAG, "Sent pending item: ${item.content.take(50)}...")
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Error sending pending item", e)
                    }
                } else {
                    Log.w(TAG, "Connection lost during queue flush")
                    break
                }
            }

            // Clear queue only if we successfully sent all items
            if (successCount == pendingItems.size) {
                PendingSyncQueue.clear(context)
                Log.d(TAG, "Successfully flushed all $successCount pending items")
            } else {
                Log.w(TAG, "Only flushed $successCount of ${pendingItems.size} items")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error flushing pending queue", e)
        }
    }
}

