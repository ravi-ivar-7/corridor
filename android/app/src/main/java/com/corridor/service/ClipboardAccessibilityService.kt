package com.corridor.service

import android.accessibilityservice.AccessibilityService
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.corridor.util.Preferences

/**
 * Accessibility Service that enables background clipboard monitoring.
 * This is required for Android 10+ to read clipboard when the app is not in focus.
 */
class ClipboardAccessibilityService : AccessibilityService() {
    private var clipboard: ClipboardManager? = null
    private var clipboardListener: ClipboardManager.OnPrimaryClipChangedListener? = null
    private var lastClipboard: String = ""

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "Accessibility Service Connected - SDK: ${android.os.Build.VERSION.SDK_INT}")
        clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager

        // Monitor clipboard changes
        try {
            clipboardListener = ClipboardManager.OnPrimaryClipChangedListener {
                handleClipboardChange()
            }
            clipboard?.addPrimaryClipChangedListener(clipboardListener!!)
            Log.d(TAG, "Clipboard listener registered successfully")

            // Try initial read to verify permissions
            try {
                val testClip = clipboard?.primaryClip
                Log.d(TAG, "Initial clipboard read test: ${if (testClip != null) "SUCCESS" else "NULL"}")
            } catch (e: Exception) {
                Log.e(TAG, "Initial clipboard read test FAILED: ${e.message}", e)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to register clipboard listener: ${e.message}", e)
        }
    }

    private fun handleClipboardChange() {
        try {
            Log.d(TAG, "Clipboard change detected - attempting to read")

            // Try to read clipboard - on Android 10+ this might fail even with accessibility enabled
            val clip = try {
                clipboard?.primaryClip
            } catch (e: SecurityException) {
                Log.e(TAG, "SecurityException reading clipboard: ${e.message}")
                Log.e(TAG, "This is an Android 10+ restriction. Clipboard access requires:")
                Log.e(TAG, "1. App must be in foreground OR")
                Log.e(TAG, "2. Accessibility service with proper capabilities")
                return
            }

            if (clip == null) {
                Log.w(TAG, "Clipboard is null - no content or access denied")
                return
            }

            val item = clip.takeIf { it.itemCount > 0 }?.getItemAt(0)
            if (item == null) {
                Log.d(TAG, "Clipboard is empty")
                return
            }

            val text = item.coerceToText(this).toString()

            if (text.isBlank()) {
                Log.d(TAG, "Clipboard text is blank, ignoring")
                return
            }
            if (text == lastClipboard) {
                Log.d(TAG, "Clipboard text unchanged, ignoring")
                return
            }

            lastClipboard = text
            Log.d(TAG, "Clipboard updated: ${text.take(20)}...")

            // Notify the sync service about the clipboard change
            val intent = Intent(ACTION_CLIPBOARD_CHANGED).apply {
                setPackage(packageName)
                putExtra(EXTRA_CLIPBOARD_TEXT, text)
            }
            sendBroadcast(intent)
            Log.d(TAG, "Broadcast sent to sync service")
        } catch (e: SecurityException) {
            Log.e(TAG, "Security error reading clipboard - make sure accessibility service is enabled: ${e.message}")
        } catch (e: Exception) {
            Log.e(TAG, "Error handling clipboard change: ${e.message}", e)
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // We don't need to handle accessibility events, we only use this service
        // for clipboard monitoring in the background
    }

    override fun onInterrupt() {
        // Called when the system wants to interrupt the feedback
    }

    override fun onDestroy() {
        Log.d(TAG, "Accessibility Service Destroyed")
        clipboardListener?.let { clipboard?.removePrimaryClipChangedListener(it) }
        super.onDestroy()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Handle requests to write to clipboard from the sync service
        if (intent?.action == ACTION_WRITE_CLIPBOARD) {
            val text = intent.getStringExtra(EXTRA_CLIPBOARD_TEXT)
            if (!text.isNullOrBlank()) {
                try {
                    val clip = ClipData.newPlainText("Corridor Clipboard", text)
                    clipboard?.setPrimaryClip(clip)
                    lastClipboard = text  // Update to prevent loop
                    Log.d(TAG, "Wrote to clipboard: ${text.take(20)}...")
                } catch (e: Exception) {
                    Log.e(TAG, "Error writing to clipboard: ${e.message}", e)
                }
            }
        }
        return super.onStartCommand(intent, flags, startId)
    }

    companion object {
        private const val TAG = "ClipboardAccessibility"
        const val ACTION_CLIPBOARD_CHANGED = "com.corridor.CLIPBOARD_CHANGED"
        const val ACTION_WRITE_CLIPBOARD = "com.corridor.WRITE_CLIPBOARD"
        const val EXTRA_CLIPBOARD_TEXT = "clipboard_text"

        /**
         * Check if the accessibility service is enabled
         */
        fun isEnabled(context: Context): Boolean {
            val service = "${context.packageName}/${ClipboardAccessibilityService::class.java.name}"
            var enabled = false
            try {
                val accessibilityEnabled = android.provider.Settings.Secure.getInt(
                    context.contentResolver,
                    android.provider.Settings.Secure.ACCESSIBILITY_ENABLED
                )
                if (accessibilityEnabled == 1) {
                    val settingValue = android.provider.Settings.Secure.getString(
                        context.contentResolver,
                        android.provider.Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
                    )
                    settingValue?.let {
                        enabled = it.contains(service)
                    }
                }
            } catch (e: Exception) {
                // Settings not found or permission denied
            }
            return enabled
        }
    }
}

