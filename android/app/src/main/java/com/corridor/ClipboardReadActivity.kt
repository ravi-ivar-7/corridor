package com.corridor

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import com.corridor.service.ClipboardSyncService

/**
 * Transparent activity to read clipboard when app is not in focus.
 * This is used by Quick Settings tile to bypass Android 10+ clipboard restrictions.
 * 
 * When this activity is opened, it has focus, so clipboard access is allowed.
 * It reads the clipboard, sends it to the sync service, then closes immediately.
 */
class ClipboardReadActivity : ComponentActivity() {

    companion object {
        private const val TAG = "ClipboardReadActivity"
    }

    private var shouldReadClipboard = false

    override fun onCreate(savedInstanceState: Bundle?) {
        try {
            Log.d(TAG, "ClipboardReadActivity onCreate STARTED")
            super.onCreate(savedInstanceState)
            Log.d(TAG, "ClipboardReadActivity super.onCreate completed")

            // Make activity completely invisible
            window.setBackgroundDrawableResource(android.R.color.transparent)
            window.decorView.setBackgroundColor(android.graphics.Color.TRANSPARENT)
            
            // Make it finish as quickly as possible
            window.setFlags(
                android.view.WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
                android.view.WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
            )
            
            Log.d(TAG, "ClipboardReadActivity onCreate - window configured")

            // Mark that we should read clipboard after activity gains focus
            shouldReadClipboard = true
            
            Log.d(TAG, "ClipboardReadActivity onCreate COMPLETED - waiting for onResume")
        } catch (e: Exception) {
            Log.e(TAG, "ERROR in ClipboardReadActivity.onCreate: ${e.message}", e)
            try {
                finish()
            } catch (_: Exception) {}
        }
    }

    override fun onResume() {
        super.onResume()
        Log.d(TAG, "ClipboardReadActivity onResume called - activity should have focus now")
        
        if (shouldReadClipboard) {
            shouldReadClipboard = false
            // Wait a tiny bit more to ensure focus is fully established
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                Log.d(TAG, "Activity should have focus now, reading clipboard")
                ensureServiceThen {
                    readAndSyncClipboard()
                }
            }, 100) // Small delay to ensure focus is fully established
        }
    }
    
    private fun closeActivity() {
        Log.d(TAG, "Closing transparent activity")
        finish()
        overridePendingTransition(0, 0)
    }

    private fun readAndSyncClipboard() {
        Log.d(TAG, "readAndSyncClipboard called")
        try {
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip: ClipData? = clipboard.primaryClip

            if (clip == null || clip.itemCount == 0) {
                Log.w(TAG, "Clipboard is empty")
                closeActivity()
                return
            }

            val item = clip.getItemAt(0)
            val text = item.coerceToText(this).toString()

            if (text.isBlank()) {
                Log.w(TAG, "Clipboard text is blank")
                closeActivity()
                return
            }

            Log.d(TAG, "Read clipboard text (${text.length} chars), syncing...")
            // Slight delay to ensure receivers are registered if we just started the service
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                // Send to sync service via manual sync broadcast
                // Only send broadcast, not both broadcast and direct service call to avoid duplicates
                val intent = Intent(ClipboardSyncService.ACTION_MANUAL_SYNC).apply {
                    setPackage(packageName)
                    putExtra(ClipboardSyncService.EXTRA_SYNC_TEXT, text)
                }
                sendBroadcast(intent)
                Log.d(TAG, "Broadcast sent with text: ${text.take(50)}...")
                Log.d(TAG, "Clipboard synced successfully from transparent activity")
                
                // Close activity after syncing
                closeActivity()
            }, 400)

        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException reading clipboard (should not happen in foreground): ${e.message}", e)
            closeActivity()
        } catch (e: Exception) {
            Log.e(TAG, "Error reading clipboard: ${e.message}", e)
            closeActivity()
        }
    }

    private fun ensureServiceThen(then: () -> Unit) {
        Log.d(TAG, "ensureServiceThen called, checking if service is running...")
        if (isServiceRunning()) {
            Log.d(TAG, "Service is already running")
            then()
            return
        }
        Log.d(TAG, "ClipboardSyncService not running, starting before sync")
        val token = com.corridor.util.Preferences.loadToken(this)
        if (token.length < 3) {
            Log.w(TAG, "Token not set, cannot start service")
            closeActivity()
            return
        }
        val serviceIntent = Intent(this, ClipboardSyncService::class.java).apply {
            putExtra("TOKEN", token)
            putExtra("SILENT", com.corridor.util.Preferences.loadSilent(this@ClipboardReadActivity))
            putExtra("NOTIFY_LOCAL", com.corridor.util.Preferences.loadNotifyLocal(this@ClipboardReadActivity))
            putExtra("NOTIFY_REMOTE", com.corridor.util.Preferences.loadNotifyRemote(this@ClipboardReadActivity))
            putExtra("NOTIFY_ERRORS", com.corridor.util.Preferences.loadNotifyErrors(this@ClipboardReadActivity))
        }
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent)
                Log.d(TAG, "Foreground service started")
            } else {
                startService(serviceIntent)
                Log.d(TAG, "Service started")
            }
        } catch (e: Throwable) {
            Log.e(TAG, "Failed to start service: ${e.message}", e)
            closeActivity()
            return
        }
        // Wait for service to register receivers
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({ 
            Log.d(TAG, "Delayed callback after service start")
            then() 
        }, 800)
    }

    private fun isServiceRunning(): Boolean {
        val manager = getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
        @Suppress("DEPRECATION")
        for (service in manager.getRunningServices(Int.MAX_VALUE)) {
            if (ClipboardSyncService::class.java.name == service.service.className) return true
        }
        return false
    }
}
