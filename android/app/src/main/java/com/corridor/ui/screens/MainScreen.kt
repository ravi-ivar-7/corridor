package com.corridor.ui.screens

import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.corridor.service.ClipboardAccessibilityService
import com.corridor.util.HistoryStore
import com.corridor.util.Preferences
import kotlinx.coroutines.launch

@Composable
fun MainScreen(
    status: String,
    error: String,
    historyVersion: Int,
    isServiceRunning: Boolean,
    onRequestPermissions: () -> Unit,
    onRequestBatteryOptimization: () -> Unit,
    onStartService: (String, Boolean, Boolean, Boolean, Boolean) -> Unit,
    onStopService: () -> Unit
) {
    val ctx = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var token by remember { mutableStateOf(Preferences.loadToken(ctx)) }
    var silentMode by remember { mutableStateOf(Preferences.loadSilent(ctx)) }
    var notifyLocal by remember { mutableStateOf(Preferences.loadNotifyLocal(ctx)) }
    var notifyRemote by remember { mutableStateOf(Preferences.loadNotifyRemote(ctx)) }
    var notifyErrors by remember { mutableStateOf(Preferences.loadNotifyErrors(ctx)) }
    var autoStart by remember { mutableStateOf(Preferences.loadAutostart(ctx)) }

    var isAccessibilityEnabled by remember { mutableStateOf(ClipboardAccessibilityService.isEnabled(ctx)) }
    var historyRefreshTrigger by remember { mutableIntStateOf(0) }

    // Update accessibility status when app comes back to foreground
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                isAccessibilityEnabled = ClipboardAccessibilityService.isEnabled(ctx)
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    val history = remember(historyVersion, historyRefreshTrigger) {
        android.util.Log.d("MainScreen", "Reloading history: historyVersion=$historyVersion, historyRefreshTrigger=$historyRefreshTrigger")
        val items = HistoryStore.getAll(ctx)
        android.util.Log.d("MainScreen", "Loaded ${items.size} history items")
        items
    }
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    if (isServiceRunning) {
        RunningView(
            status = status,
            error = error,
            token = token,
            history = history,
            historyRefreshTrigger = historyRefreshTrigger,
            isAccessibilityEnabled = isAccessibilityEnabled,
            drawerState = drawerState,
            onStopService = onStopService,
            onOpenDrawer = { scope.launch { drawerState.open() } },
            onRefreshHistory = { historyRefreshTrigger++ }
        )
    } else {
        SetupView(
            status = status,
            error = error,
            isAccessibilityEnabled = isAccessibilityEnabled,
            token = token,
            silentMode = silentMode,
            notifyLocal = notifyLocal,
            notifyRemote = notifyRemote,
            notifyErrors = notifyErrors,
            autoStart = autoStart,
            onTokenChange = { token = it },
            onSilentModeChange = {
                silentMode = it
                if (it) {
                    notifyLocal = false
                    notifyRemote = false
                    notifyErrors = false
                }
            },
            onNotifyLocalChange = { notifyLocal = it },
            onNotifyRemoteChange = { notifyRemote = it },
            onNotifyErrorsChange = { notifyErrors = it },
            onAutoStartChange = { autoStart = it },
            onRequestPermissions = onRequestPermissions,
            onRequestBatteryOptimization = onRequestBatteryOptimization,
            onStartService = {
                Preferences.save(ctx, token, silentMode, notifyLocal, notifyRemote, notifyErrors, autoStart)
                onRequestPermissions()
                onRequestBatteryOptimization()
                onStartService(token, silentMode, notifyLocal, notifyRemote, notifyErrors)
            }
        )
    }
}
