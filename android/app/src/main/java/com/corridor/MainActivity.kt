package com.corridor

import android.content.*
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import com.corridor.service.ClipboardSyncService
import com.corridor.ui.screens.MainScreen
import com.corridor.util.Preferences
import androidx.compose.runtime.*

class MainActivity : ComponentActivity() {
    private val requestNotificationPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { _ -> }

    private val statusReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            android.util.Log.d("MainActivity", "Broadcast received: ${intent?.action}")
            when (intent?.action) {
                ClipboardSyncService.ACTION_STATUS -> {
                    val status = intent.getStringExtra(ClipboardSyncService.EXTRA_STATUS)
                    val error = intent.getStringExtra(ClipboardSyncService.EXTRA_ERROR)
                    android.util.Log.d("MainActivity", "Status update: status='$status', error='$error'")

                    // Update status if provided
                    if (status != null) {
                        android.util.Log.d("MainActivity", "Updating _status from '${_status.value}' to '$status'")
                        _status.value = status
                        _isServiceRunning.value = status != "stopped"
                    }

                    // Update error if provided
                    if (error != null) {
                        android.util.Log.d("MainActivity", "Updating _error to '$error'")
                        _error.value = error
                    } else {
                        // Clear error when status updates without error
                        if (status != null && _error.value.isNotBlank()) {
                            android.util.Log.d("MainActivity", "Clearing error")
                            _error.value = ""
                        }
                    }
                }
                ClipboardSyncService.ACTION_HISTORY_UPDATE -> {
                    android.util.Log.d("MainActivity", "Received ACTION_HISTORY_UPDATE, incrementing version from ${_historyVersion.value} to ${_historyVersion.value + 1}")
                    _historyVersion.value += 1
                }
            }
        }
    }

    private val _status = mutableStateOf("")
    private val _error = mutableStateOf("")
    private val _historyVersion = mutableStateOf(0)
    private val _isServiceRunning = mutableStateOf(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val filter = IntentFilter().apply {
            addAction(ClipboardSyncService.ACTION_STATUS)
            addAction(ClipboardSyncService.ACTION_HISTORY_UPDATE)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(statusReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(statusReceiver, filter)
        }

        // Check if service is already running
        _isServiceRunning.value = isServiceRunning(this)

        val savedToken = Preferences.loadToken(this)
        if (Preferences.loadAutostart(this) && savedToken.length >= 3 && !_isServiceRunning.value) {
            val svc = Intent(this, ClipboardSyncService::class.java).apply {
                putExtra("TOKEN", savedToken)
                putExtra("SILENT", Preferences.loadSilent(this@MainActivity))
                putExtra("NOTIFY_LOCAL", Preferences.loadNotifyLocal(this@MainActivity))
                putExtra("NOTIFY_REMOTE", Preferences.loadNotifyRemote(this@MainActivity))
                putExtra("NOTIFY_ERRORS", Preferences.loadNotifyErrors(this@MainActivity))
            }
            startForegroundService(svc)
            _isServiceRunning.value = true
        }

        setContent {
            val status by _status
            val error by _error
            val historyVersion by _historyVersion
            val isServiceRunning by _isServiceRunning

            MainScreen(
                status = status,
                error = error,
                historyVersion = historyVersion,
                isServiceRunning = isServiceRunning,
                onRequestPermissions = {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        requestNotificationPermission.launch(android.Manifest.permission.POST_NOTIFICATIONS)
                    }
                },
                onRequestBatteryOptimization = {
                    val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
                    val pkg = packageName
                    val ignoring = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) pm.isIgnoringBatteryOptimizations(pkg) else true
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !ignoring) {
                        val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                            data = android.net.Uri.parse("package:$pkg")
                        }
                        startActivity(intent)
                    }
                },
                onStartService = { token, silent, nLocal, nRemote, nErrors ->
                    val svc = Intent(this, ClipboardSyncService::class.java).apply {
                        putExtra("TOKEN", token)
                        putExtra("SILENT", silent)
                        putExtra("NOTIFY_LOCAL", nLocal)
                        putExtra("NOTIFY_REMOTE", nRemote)
                        putExtra("NOTIFY_ERRORS", nErrors)
                    }
                    startForegroundService(svc)
                    _isServiceRunning.value = true
                    _status.value = "starting"
                },
                onStopService = {
                    stopService(Intent(this, ClipboardSyncService::class.java))
                    _isServiceRunning.value = false
                    _status.value = "stopped"
                }
            )
        }
    }

    override fun onDestroy() {
        unregisterReceiver(statusReceiver)
        super.onDestroy()
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
