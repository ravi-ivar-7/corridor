package com.corridor.service

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.drawable.Icon
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import android.util.Log
import com.corridor.service.ClipboardSyncService
import com.corridor.util.Preferences

/**
 * Quick Settings Tile Service
 * 
 * WHAT IT DOES:
 * - Adds a "Corridor Sync" tile to Android's Quick Settings panel (swipe down twice from top)
 * - When user taps the tile, it reads the current clipboard content and syncs it
 * - This works even when the app is in background - user just needs to copy text, then tap the tile
 * 
 * HOW TO USE:
 * 1. Swipe down from top of screen twice to open Quick Settings
 * 2. Tap "Edit" (pencil icon) or "+" to add tiles
 * 3. Find "Corridor Sync" tile and add it
 * 4. After copying text, just tap the tile to sync it immediately
 */
class QuickSettingsTileService : TileService() {

    companion object {
        private const val TAG = "QuickSettingsTile"
    }

    override fun onStartListening() {
        super.onStartListening()
        updateTileState()
    }

    override fun onClick() {
        super.onClick()
        Log.d(TAG, "Quick Settings tile tapped")
        syncCurrentClipboard()
        updateTileState()
    }

    private fun updateTileState() {
        val tile = qsTile ?: return
        
        // Check if service is running
        val token = Preferences.loadToken(this)
        val isServiceRunning = isServiceRunning(this)
        
        if (token.length >= 3 && isServiceRunning) {
            tile.state = Tile.STATE_ACTIVE
            tile.label = "Corridor Sync"
            tile.contentDescription = "Tap to sync current clipboard"
            tile.icon = Icon.createWithResource(this, android.R.drawable.ic_menu_share)
        } else {
            tile.state = Tile.STATE_INACTIVE
            tile.label = "Corridor Sync"
            tile.contentDescription = "Service not running - open Corridor app"
            tile.icon = Icon.createWithResource(this, android.R.drawable.ic_menu_info_details)
        }
        tile.updateTile()
    }

    private fun syncCurrentClipboard() {
        try {
            // First, ensure service is running
            val token = Preferences.loadToken(this)
            if (token.length < 3) {
                Log.w(TAG, "Token not set, cannot sync")
                return
            }

            // Start service if not running
            if (!isServiceRunning(this)) {
                Log.d(TAG, "Service not running, starting it...")
                val serviceIntent = Intent(this, ClipboardSyncService::class.java).apply {
                    putExtra("TOKEN", token)
                    putExtra("SILENT", Preferences.loadSilent(this@QuickSettingsTileService))
                    putExtra("NOTIFY_LOCAL", Preferences.loadNotifyLocal(this@QuickSettingsTileService))
                    putExtra("NOTIFY_REMOTE", Preferences.loadNotifyRemote(this@QuickSettingsTileService))
                    putExtra("NOTIFY_ERRORS", Preferences.loadNotifyErrors(this@QuickSettingsTileService))
                }
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    startForegroundService(serviceIntent)
                } else {
                    startService(serviceIntent)
                }
            }

            // On Android 10+, we can't read clipboard from Quick Settings tile directly
            // because the app is not in focus. Solution: Use unlockAndRun to open activity
            // with proper screen unlock, or try to read clipboard directly if unlocked
            Log.d(TAG, "Attempting to read clipboard from Quick Settings tile")
            
            // First try direct clipboard access (might work if screen is unlocked)
            try {
                val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                val clip: ClipData? = clipboard.primaryClip
                
                if (clip != null && clip.itemCount > 0) {
                    val item = clip.getItemAt(0)
                    val text = item.coerceToText(this).toString()
                    
                    if (!text.isBlank()) {
                        Log.d(TAG, "Direct clipboard read succeeded! Syncing ${text.length} chars")
                        sendSyncBroadcast(text)
                        return
                    }
                }
            } catch (e: SecurityException) {
                Log.d(TAG, "Direct clipboard read failed (expected on Android 10+): ${e.message}")
            } catch (e: Exception) {
                Log.d(TAG, "Direct clipboard read error: ${e.message}")
            }
            
            // If direct read fails, open transparent activity to get focus
            // Note: Can't use Intent directly with startActivityAndCollapse from TileService
            // Use PendingIntent instead
            Log.d(TAG, "Opening transparent activity to read clipboard (bypasses Android 10+ restriction)")
            
            val clipboardReadIntent = Intent(this, com.corridor.ClipboardReadActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or 
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS or
                        Intent.FLAG_ACTIVITY_NO_ANIMATION
            }
            
            // Create PendingIntent for use with startActivityAndCollapse
            val pendingIntent = android.app.PendingIntent.getActivity(
                this,
                0,
                clipboardReadIntent,
                android.app.PendingIntent.FLAG_UPDATE_CURRENT or
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    android.app.PendingIntent.FLAG_IMMUTABLE
                } else {
                    0
                }
            )
            
            // Try startActivityAndCollapse with PendingIntent first (works when screen is unlocked)
            // If that fails, use unlockAndRun to unlock and then start
            try {
                startActivityAndCollapse(pendingIntent)
                Log.d(TAG, "Transparent activity opened via startActivityAndCollapse with PendingIntent")
            } catch (e: Exception) {
                Log.d(TAG, "startActivityAndCollapse failed (screen might be locked): ${e.message}")
                // If screen is locked, unlockAndRun will prompt user to unlock
                try {
                    unlockAndRun {
                        try {
                            startActivityAndCollapse(pendingIntent)
                            Log.d(TAG, "Transparent activity opened via unlockAndRun with PendingIntent")
                        } catch (e2: Exception) {
                            Log.e(TAG, "Failed to start activity via unlockAndRun: ${e2.message}", e2)
                            // Final fallback: direct startActivity
                            try {
                                startActivity(clipboardReadIntent)
                                Log.d(TAG, "Transparent activity opened via startActivity (final fallback)")
                            } catch (e3: Exception) {
                                Log.e(TAG, "Failed to start activity: ${e3.message}", e3)
                            }
                        }
                    }
                } catch (e4: Exception) {
                    Log.e(TAG, "unlockAndRun failed: ${e4.message}", e4)
                    // Last resort: try direct startActivity
                    try {
                        startActivity(clipboardReadIntent)
                        Log.d(TAG, "Transparent activity opened via startActivity (last resort)")
                    } catch (e5: Exception) {
                        Log.e(TAG, "All activity start methods failed: ${e5.message}", e5)
                    }
                }
            }

        } catch (e: Exception) {
            Log.e(TAG, "Error in syncCurrentClipboard: ${e.message}", e)
        }
    }

    private fun sendSyncBroadcast(text: String) {
        // Send to sync service via manual sync broadcast
        // Only send broadcast, not both broadcast and direct service call to avoid duplicates
        val intent = Intent(ClipboardSyncService.ACTION_MANUAL_SYNC).apply {
            setPackage(packageName)
            putExtra(ClipboardSyncService.EXTRA_SYNC_TEXT, text)
        }
        sendBroadcast(intent)
        Log.d(TAG, "Broadcast sent with text: ${text.take(50)}...")
    }

    private fun isServiceRunning(context: Context): Boolean {
        val manager = context.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
        @Suppress("DEPRECATION")
        for (service in manager.getRunningServices(Int.MAX_VALUE)) {
            if (ClipboardSyncService::class.java.name == service.service.className) {
                return true
            }
        }
        return false
    }
}
