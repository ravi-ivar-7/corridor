package com.corridor.ui.screens

import android.content.Context
import android.content.Intent
import android.provider.Settings
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.corridor.ui.components.AppHeader

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SetupView(
    status: String,
    error: String,
    isAccessibilityEnabled: Boolean,
    token: String,
    silentMode: Boolean,
    notifyLocal: Boolean,
    notifyRemote: Boolean,
    notifyErrors: Boolean,
    autoStart: Boolean,
    onTokenChange: (String) -> Unit,
    onSilentModeChange: (Boolean) -> Unit,
    onNotifyLocalChange: (Boolean) -> Unit,
    onNotifyRemoteChange: (Boolean) -> Unit,
    onNotifyErrorsChange: (Boolean) -> Unit,
    onAutoStartChange: (Boolean) -> Unit,
    onRequestPermissions: () -> Unit,
    onRequestBatteryOptimization: () -> Unit,
    onStartService: () -> Unit
) {
    val ctx = LocalContext.current

    Scaffold(
        topBar = {
            AppHeader(
                status = if (status.isBlank()) "Not started" else status,
                isAccessibilityEnabled = isAccessibilityEnabled,
                onMenuClick = { },
                onStopClick = { }
            )
        }
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize()) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 12.dp)
                    .padding(bottom = 80.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    Spacer(Modifier.height(4.dp))
                    WelcomeMessage()
                }
                if (error.isNotBlank()) {
                    item { ErrorCard(error) }
                }
                if (!isAccessibilityEnabled) {
                    item { AccessibilityWarning(ctx) }
                }
                item { ConfigurationSection(token, onTokenChange) }
                item {
                    NotificationSettings(
                        silentMode = silentMode,
                        notifyLocal = notifyLocal,
                        notifyRemote = notifyRemote,
                        notifyErrors = notifyErrors,
                        onSilentModeChange = onSilentModeChange,
                        onNotifyLocalChange = onNotifyLocalChange,
                        onNotifyRemoteChange = onNotifyRemoteChange,
                        onNotifyErrorsChange = onNotifyErrorsChange
                    )
                }
                item { GeneralSettings(autoStart, onAutoStartChange) }
            }

            Surface(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth(),
                shadowElevation = 8.dp,
                tonalElevation = 3.dp
            ) {
                Button(
                    onClick = onStartService,
                    enabled = token.length >= 3,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF009688),
                        contentColor = Color.White
                    ),
                    contentPadding = PaddingValues(vertical = 12.dp)
                ) {
                    Text("Start Service", style = MaterialTheme.typography.labelMedium)
                }
            }
        }
    }
}

@Composable
private fun WelcomeMessage() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
        )
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = "Welcome to Corridor",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text = "Seamlessly sync your clipboard across all devices. Configure your settings below and start the service to begin.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ErrorCard(error: String) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.8f)
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = "⚠️", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.width(8.dp))
            Text(
                text = error,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onErrorContainer
            )
        }
    }
}

@Composable
private fun AccessibilityWarning(ctx: Context) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.7f)
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = "⚠️ Background Access Required",
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.onErrorContainer
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text = "Enable accessibility service for background clipboard monitoring. The app only reads clipboard content and doesn't interact with your screen.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onErrorContainer
            )
            Spacer(Modifier.height(8.dp))
            Button(
                onClick = {
                    val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                    ctx.startActivity(intent)
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error,
                    contentColor = MaterialTheme.colorScheme.onError
                ),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Text("Open Accessibility Settings", style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}

@Composable
private fun ConfigurationSection(token: String, onTokenChange: (String) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.4f)
        )
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = "Configuration",
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = token,
                onValueChange = onTokenChange,
                label = { Text("Sync Token", style = MaterialTheme.typography.bodySmall) },
                placeholder = { Text("Enter your sync token") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                textStyle = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
private fun NotificationSettings(
    silentMode: Boolean,
    notifyLocal: Boolean,
    notifyRemote: Boolean,
    notifyErrors: Boolean,
    onSilentModeChange: (Boolean) -> Unit,
    onNotifyLocalChange: (Boolean) -> Unit,
    onNotifyRemoteChange: (Boolean) -> Unit,
    onNotifyErrorsChange: (Boolean) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.4f)
        )
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = "Notifications",
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(Modifier.height(6.dp))

            NotificationCheckbox(
                checked = silentMode,
                onCheckedChange = onSilentModeChange,
                title = "Silent Mode",
                description = "Disable all notifications",
                enabled = true
            )

            HorizontalDivider(modifier = Modifier.padding(vertical = 6.dp))

            NotificationCheckbox(
                checked = notifyLocal,
                onCheckedChange = onNotifyLocalChange,
                title = "Local Copy",
                description = "Notify when you copy on this device",
                enabled = !silentMode
            )

            NotificationCheckbox(
                checked = notifyRemote,
                onCheckedChange = onNotifyRemoteChange,
                title = "Remote Update",
                description = "Notify when clipboard syncs from other devices",
                enabled = !silentMode
            )

            NotificationCheckbox(
                checked = notifyErrors,
                onCheckedChange = onNotifyErrorsChange,
                title = "Errors",
                description = "Notify on sync errors or issues",
                enabled = !silentMode
            )
        }
    }
}

@Composable
private fun NotificationCheckbox(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    title: String,
    description: String,
    enabled: Boolean
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
    ) {
        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange,
            enabled = enabled
        )
        Column(modifier = Modifier.weight(1f)) {
            Text(
                title,
                style = MaterialTheme.typography.bodyMedium,
                color = if (enabled) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun GeneralSettings(autoStart: Boolean, onAutoStartChange: (Boolean) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
        )
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = "General",
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(Modifier.height(6.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Checkbox(
                    checked = autoStart,
                    onCheckedChange = onAutoStartChange
                )
                Column(modifier = Modifier.weight(1f)) {
                    Text("Auto-start on Boot", style = MaterialTheme.typography.bodyMedium)
                    Text(
                        "Automatically start sync service when device boots",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
