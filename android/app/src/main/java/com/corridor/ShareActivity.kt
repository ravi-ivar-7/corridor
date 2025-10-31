package com.corridor

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import com.corridor.service.ClipboardSyncService
import com.corridor.util.Preferences

/**
 * Share Activity - Android Sharesheet Integration
 * 
 * WHAT IT DOES:
 * - Makes Corridor appear as an option when you use "Share" from any app
 * - When you select "Corridor" from the share menu, this activity receives the text/image
 * - The received content is immediately synced to your other devices
 * 
 * HOW TO USE:
 * 1. In any app (browser, notes, messages, etc.), select some text
 * 2. Tap "Share" button/menu option
 * 3. Scroll through the share options and find "Corridor"
 * 4. Tap "Corridor" - the text will be synced immediately
 * 
 * This works great for:
 * - Sharing URLs from your browser
 * - Sharing text from notes or messages
 * - Sharing any text content without needing to copy-paste manually
 */
class ShareActivity : ComponentActivity() {

    companion object {
        private const val TAG = "ShareActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Log.d(TAG, "ShareActivity started with action: ${intent?.action}")

        // Check token first
        val token = Preferences.loadToken(this)
        if (token.length < 3) {
            Log.w(TAG, "Token not set, cannot sync shared content")
            finish()
            return
        }

        // Ensure service is running before processing share
        if (!isServiceRunning(this)) {
            Log.d(TAG, "ClipboardSyncService is not running, starting it...")
            val serviceIntent = Intent(this, ClipboardSyncService::class.java).apply {
                putExtra("TOKEN", token)
                putExtra("SILENT", Preferences.loadSilent(this@ShareActivity))
                putExtra("NOTIFY_LOCAL", Preferences.loadNotifyLocal(this@ShareActivity))
                putExtra("NOTIFY_REMOTE", Preferences.loadNotifyRemote(this@ShareActivity))
                putExtra("NOTIFY_ERRORS", Preferences.loadNotifyErrors(this@ShareActivity))
            }
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent)
            } else {
                startService(serviceIntent)
            }
            
            // Wait a bit for service to register receivers, then send the content
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                processSharedContent()
            }, 800)
        } else {
            processSharedContent()
        }
    }

    private fun processSharedContent() {
        // Handle the shared content
        when (intent?.action) {
            Intent.ACTION_SEND -> {
                // Single item shared
                handleSharedContent(intent)
            }
            Intent.ACTION_SEND_MULTIPLE -> {
                // Multiple items shared (less common, but handle first item)
                handleSharedMultiple(intent)
            }
            else -> {
                Log.w(TAG, "Unknown action: ${intent?.action}")
                finish()
            }
        }
    }

    private fun handleSharedContent(intent: Intent) {
        val text = intent.getStringExtra(Intent.EXTRA_TEXT)
        val subject = intent.getStringExtra(Intent.EXTRA_SUBJECT)

        // Prefer EXTRA_TEXT, fallback to EXTRA_SUBJECT, or empty string
        val contentToSync = when {
            !text.isNullOrBlank() -> text
            !subject.isNullOrBlank() -> subject
            else -> {
                Log.w(TAG, "No text content found in share intent")
                finish()
                return
            }
        }

        Log.d(TAG, "Received shared content via Sharesheet: ${contentToSync.take(50)}...")

        // Send to sync service via manual sync broadcast
        val syncIntent = Intent(ClipboardSyncService.ACTION_MANUAL_SYNC).apply {
            setPackage(packageName)
            putExtra(ClipboardSyncService.EXTRA_SYNC_TEXT, contentToSync)
            setComponent(android.content.ComponentName(packageName, ClipboardSyncService::class.java.name))
        }
        sendBroadcast(syncIntent)
        
        // Also try direct service call as fallback
        try {
            val serviceIntent = Intent(this, ClipboardSyncService::class.java).apply {
                action = ClipboardSyncService.ACTION_MANUAL_SYNC
                putExtra(ClipboardSyncService.EXTRA_SYNC_TEXT, contentToSync)
            }
            startService(serviceIntent)
        } catch (e: Exception) {
            Log.d(TAG, "Direct service call failed, broadcast should work: ${e.message}")
        }
        
        Log.d(TAG, "Manual sync broadcast sent from ShareActivity")

        // Close immediately (user doesn't need to see UI)
        finish()
    }

    private fun handleSharedMultiple(intent: Intent) {
        val items = intent.getParcelableArrayListExtra<android.content.Intent>(Intent.EXTRA_STREAM)
        if (items.isNullOrEmpty()) {
            Log.w(TAG, "No items found in multiple share")
            finish()
            return
        }

        // For now, just handle the first item
        // In the future, could concatenate multiple items
        val firstItem = items[0]
        handleSharedContent(firstItem)
    }

    private fun isServiceRunning(context: android.content.Context): Boolean {
        val manager = context.getSystemService(android.content.Context.ACTIVITY_SERVICE) as android.app.ActivityManager
        @Suppress("DEPRECATION")
        for (service in manager.getRunningServices(Int.MAX_VALUE)) {
            if (ClipboardSyncService::class.java.name == service.service.className) {
                return true
            }
        }
        return false
    }
}
