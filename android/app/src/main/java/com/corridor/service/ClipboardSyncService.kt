package com.corridor.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.BroadcastReceiver
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.corridor.util.HistoryStore
import com.corridor.ws.ClipboardWebSocketClient
import com.corridor.ws.HistoryItem
import kotlinx.coroutines.*

class ClipboardSyncService : Service() {
    companion object {
        const val TAG = "ClipboardSyncService"
        const val ACTION_STATUS = "com.corridor.STATUS"
        const val EXTRA_STATUS = "status"
        const val EXTRA_ERROR = "error"
        const val ACTION_HISTORY_UPDATE = "com.corridor.HISTORY_UPDATE"
        const val ACTION_MANUAL_SYNC = "com.corridor.MANUAL_SYNC"
        const val EXTRA_SYNC_TEXT = "sync_text"
        const val ACTION_CLEAR_HISTORY = "com.corridor.CLEAR_HISTORY"
        const val ACTION_REQUEST_STATUS = "com.corridor.REQUEST_STATUS"
    }

    private val CHANNEL_ID = "CorridorClipboardSync"
    private val NOTIF_ID = 1001
    private val CLIPBOARD_NOTIF_ID = 1002 // Single ID for all clipboard notifications
    private var token: String = ""
    private var silentMode: Boolean = false
    private var notifyLocal: Boolean = true
    private var notifyRemote: Boolean = true
    private var notifyErrors: Boolean = true
    private var wsClient: ClipboardWebSocketClient? = null
    private var lastClipboard: String = ""
    private var manualSyncReceiver: BroadcastReceiver? = null
    private var clearHistoryReceiver: BroadcastReceiver? = null
    private var statusRequestReceiver: BroadcastReceiver? = null
    private var serviceScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private var debounceJob: Job? = null
    private var reconnectAttempts: Int = 0
    private var reconnectJob: Job? = null
    private var currentStatus: String = "starting"
    private var currentError: String? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()

        // Listen for manual sync requests
        manualSyncReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                Log.d(TAG, "Manual sync broadcast received: ${intent?.action}")
                if (intent?.action == ACTION_MANUAL_SYNC) {
                    val text = intent.getStringExtra(EXTRA_SYNC_TEXT) ?: ""
                    Log.d(TAG, "Manual sync text: ${text.take(20)}...")
                    handleManualSync(text)
                }
            }
        }
        val manualSyncFilter = IntentFilter(ACTION_MANUAL_SYNC)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(manualSyncReceiver, manualSyncFilter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(manualSyncReceiver, manualSyncFilter)
        }
        Log.d(TAG, "Manual sync receiver registered")

        // Listen for clear history requests
        clearHistoryReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                Log.d(TAG, "Clear history broadcast received: ${intent?.action}")
                if (intent?.action == ACTION_CLEAR_HISTORY) {
                    handleClearHistory()
                }
            }
        }
        val clearHistoryFilter = IntentFilter(ACTION_CLEAR_HISTORY)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(clearHistoryReceiver, clearHistoryFilter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(clearHistoryReceiver, clearHistoryFilter)
        }
        Log.d(TAG, "Clear history receiver registered")

        // Listen for status requests
        statusRequestReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                Log.d(TAG, "Status request broadcast received: ${intent?.action}")
                if (intent?.action == ACTION_REQUEST_STATUS) {
                    Log.d(TAG, "Sending current status: $currentStatus, error: $currentError")
                    sendStatusBroadcast(currentStatus, currentError)
                }
            }
        }
        val statusRequestFilter = IntentFilter(ACTION_REQUEST_STATUS)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(statusRequestReceiver, statusRequestFilter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(statusRequestReceiver, statusRequestFilter)
        }
        Log.d(TAG, "Status request receiver registered")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Check if this is a manual sync request
        if (intent?.action == ACTION_MANUAL_SYNC) {
            val text = intent.getStringExtra(EXTRA_SYNC_TEXT)
            if (!text.isNullOrBlank()) {
                Log.d(TAG, "Manual sync received via onStartCommand: ${text.take(20)}...")
                handleManualSync(text)
                return START_NOT_STICKY
            }
        }

        token = intent?.getStringExtra("TOKEN") ?: ""
        silentMode = intent?.getBooleanExtra("SILENT", false) ?: false
        notifyLocal = intent?.getBooleanExtra("NOTIFY_LOCAL", true) ?: true
        notifyRemote = intent?.getBooleanExtra("NOTIFY_REMOTE", true) ?: true
        notifyErrors = intent?.getBooleanExtra("NOTIFY_ERRORS", true) ?: true
        
        Log.d(TAG, "Service starting with token: ${token.take(5)}...")
        startForeground(NOTIF_ID, buildNotification("Corridor Clipboard Sync", "Service running"))

        // Send initial status
        sendStatusBroadcast("starting", null)
        
        if (token.length < 3) {
            Log.e(TAG, "Invalid token length: ${token.length}")
            sendStatusBroadcast("stopped", "Token too short")
            stopSelf()
            return START_NOT_STICKY
        }

        startWebSocket()

        // NOTE: Clipboard syncing is now fully manual via:
        // 1. Quick Settings Tile (user taps tile after copying)
        // 2. Share menu (user shares text to Corridor)
        // This avoids Android 10+ restrictions without needing accessibility service

        return START_STICKY
    }


    private fun handleManualSync(text: String) {
        Log.d(TAG, "handleManualSync called with text length: ${text.length}")

        if (text.isBlank()) {
            Log.d(TAG, "Manual sync text is blank, ignoring")
            return
        }

        if (text == lastClipboard) {
            Log.d(TAG, "Text unchanged, ignoring manual sync")
            return
        }

        if (text.length > 10000) {
            Log.w(TAG, "Manual sync text too large (${text.length} chars), not syncing")
            if (!silentMode && notifyErrors) showClipboardNotification("Sync Failed", "Text too large; not synced")
            return
        }

        Log.d(TAG, "Processing manual sync: ${text.take(50)}...")
        serviceScope.launch {
            // Send to server AND add to local history immediately
            lastClipboard = text
            Log.d(TAG, "Sending manual sync to WebSocket...")
            wsClient?.sendClipboardUpdate(text)
            Log.d(TAG, "Adding to local history...")
            HistoryStore.add(this@ClipboardSyncService, "local", text)
            sendBroadcast(Intent(ACTION_HISTORY_UPDATE).apply { setPackage(packageName) })
            if (!silentMode && notifyLocal) {
                Log.d(TAG, "Showing manual sync notification")
                showClipboardNotification("Pushed to Corridor", text.take(50) + if (text.length > 50) "..." else "")
            }
            Log.d(TAG, "Manual sync completed")
        }
    }

    private fun handleClearHistory() {
        Log.d(TAG, "handleClearHistory called")
        serviceScope.launch {
            // Send clear history to server
            Log.d(TAG, "Sending clear_history to WebSocket...")
            wsClient?.sendClearHistory()
            // Clear local history
            HistoryStore.clear(this@ClipboardSyncService)
            sendBroadcast(Intent(ACTION_HISTORY_UPDATE).apply { setPackage(packageName) })
            Log.d(TAG, "History cleared successfully")
        }
    }

    private fun startWebSocket() {
        wsClient?.disconnect()
        wsClient = ClipboardWebSocketClient(
            this,
            token,
            onRemoteClipboard = ::onRemoteClipboard,
            onStatus = { s ->
                Log.d(TAG, "WebSocket status: $s")
                if (s == "connected") reconnectAttempts = 0
                sendStatusBroadcast(s, null)
                if (s == "disconnected" || s == "closed") scheduleReconnect()
            },
            onError = { e ->
                Log.e(TAG, "WebSocket error: $e")
                sendStatusBroadcast(null, e)
                if (!silentMode && notifyErrors) showClipboardNotification("Connection Failed", e)
                scheduleReconnect()
            },
            onHistory = ::onHistoryReceived,
            onHistoryItemReceived = ::onHistoryItemReceived
        )
        Log.d(TAG, "Connecting WebSocket to token: ${token.take(5)}...")
        wsClient?.connect()
    }

    private fun scheduleReconnect() {
        if (token.length < 3) return
        reconnectJob?.cancel()
        val delayMs = (1000L * (1 shl reconnectAttempts)).coerceAtMost(60_000L)
        reconnectAttempts = (reconnectAttempts + 1).coerceAtMost(10)
        reconnectJob = serviceScope.launch {
            delay(delayMs)
            startWebSocket()
        }
    }

    override fun onDestroy() {
        Log.d(TAG, "Service onDestroy called")
        reconnectJob?.cancel()
        wsClient?.disconnect()
        manualSyncReceiver?.let { unregisterReceiver(it) }
        clearHistoryReceiver?.let { unregisterReceiver(it) }
        statusRequestReceiver?.let { unregisterReceiver(it) }
        serviceScope.cancel()
        sendStatusBroadcast("stopped", null)
        super.onDestroy()
    }

    private fun onRemoteClipboard(text: String) {
        if (text.isBlank()) return
        if (text == lastClipboard) return
        lastClipboard = text

        // Write to clipboard (direct write - works when app has focus or user interacts with notification)
        try {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            clipboard.setPrimaryClip(ClipData.newPlainText("Corridor Clipboard", text))
            Log.d(TAG, "Clipboard updated from remote")
        } catch (e: Exception) {
            Log.e(TAG, "Error writing to clipboard: ${e.message}", e)
            if (!silentMode && notifyErrors) showClipboardNotification("Update Failed", "Could not update clipboard")
            return
        }

        // Note: History is added by onHistoryItemReceived callback which receives the full item with timestamp
        // This function only writes to clipboard

        if (!silentMode && notifyRemote) showClipboardNotification("Pulled from Corridor", text.take(50) + if (text.length > 50) "..." else "")
    }

    private fun onHistoryReceived(items: List<HistoryItem>) {
        Log.d(TAG, "Received ${items.size} history items from server")

        // Sync server history with local HistoryStore
        // Clear local history and replace with server history
        HistoryStore.clear(this)

        // Add items in reverse order (newest first in the list, but add oldest first to maintain order)
        items.reversed().forEach { item ->
            HistoryStore.add(this, "remote", item.content, item.timestamp)
        }

        Log.d(TAG, "History synced with server")
        sendBroadcast(Intent(ACTION_HISTORY_UPDATE).apply { setPackage(packageName) })
    }

    private fun onHistoryItemReceived(item: HistoryItem) {
        Log.d(TAG, "Received single history item from clipboard_update: id=${item.id}, timestamp=${item.timestamp}, content=${item.content.take(50)}...")

        // Immediately add to history with server's timestamp
        HistoryStore.add(this, "remote", item.content, item.timestamp)

        // Broadcast update to UI
        Log.d(TAG, "Broadcasting ACTION_HISTORY_UPDATE for new clipboard_update item")
        sendBroadcast(Intent(ACTION_HISTORY_UPDATE).apply { setPackage(packageName) })
    }

    private fun sendStatusBroadcast(status: String?, error: String?) {
        Log.d(TAG, "sendStatusBroadcast: status='$status', error='$error', package='$packageName'")

        // Update current status
        status?.let { currentStatus = it }
        currentError = error

        val i = Intent(ACTION_STATUS).apply {
            setPackage(packageName)
            status?.let { putExtra(EXTRA_STATUS, it) }
            error?.let { putExtra(EXTRA_ERROR, it) }
        }
        sendBroadcast(i)
        Log.d(TAG, "Status broadcast sent")
    }

    private fun buildNotification(title: String, content: String): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setSound(null)
            .setVibrate(null)
            .setSilent(true)
            .build()
    }

    private fun showClipboardNotification(title: String, content: String) {
        val notif = buildNotification(title, content)
        val notifManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        // Use single notification ID - replaces previous notification
        notifManager.notify(CLIPBOARD_NOTIF_ID, notif)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val chan = NotificationChannel(CHANNEL_ID, "Corridor Clipboard", NotificationManager.IMPORTANCE_LOW)
            chan.setShowBadge(false)
            chan.enableVibration(false)
            chan.setSound(null, null)
            val notifManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notifManager.createNotificationChannel(chan)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

