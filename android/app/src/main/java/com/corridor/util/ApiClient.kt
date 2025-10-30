package com.corridor.util

import com.corridor.BuildConfig

/**
 * Helper object for API and WebSocket URL construction
 */
object ApiClient {
    /**
     * Base worker URL
     * Example: https://corridor-worker.corridor-sync.workers.dev
     */
    val workerUrl: String
        get() = BuildConfig.WORKER_URL

    /**
     * WebSocket URL with token
     * Example: wss://corridor-worker.corridor-sync.workers.dev/ws?token=abc123
     */
    fun getWebSocketUrl(token: String): String {
        return "${BuildConfig.WEBSOCKET_URL}?token=$token"
    }

    /**
     * API endpoint URL
     * Example: https://corridor-worker.corridor-sync.workers.dev/api/clipboard/abc123
     */
    fun getApiUrl(endpoint: String): String {
        val cleanEndpoint = endpoint.trimStart('/')
        return "${BuildConfig.WORKER_URL}/api/$cleanEndpoint"
    }

    /**
     * Get clipboard history for a token
     */
    fun getClipboardHistoryUrl(token: String): String {
        return getApiUrl("clipboard/$token")
    }

    /**
     * Post clipboard update for a token
     */
    fun postClipboardUrl(token: String): String {
        return getApiUrl("clipboard/$token")
    }

    /**
     * Clear clipboard history for a token
     */
    fun deleteClipboardUrl(token: String): String {
        return getApiUrl("clipboard/$token")
    }
}

