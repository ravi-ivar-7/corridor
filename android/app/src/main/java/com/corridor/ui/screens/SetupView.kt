package com.corridor.ui.screens

import android.content.Context
import android.content.Intent
import android.provider.Settings
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.corridor.ui.components.AppHeader

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SetupView(
    status: String,
    error: String,
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
    onStartService: () -> Unit,
    onShowHowToUse: () -> Unit = {}
) {
    val ctx = LocalContext.current

    Scaffold(
        topBar = {
            AppHeader(
                status = if (status.isBlank()) "Not started" else status,
                onMenuClick = { },
                onStopClick = { },
                onReconnectClick = { },
                onShowHowToUse = onShowHowToUse
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
                item { HowToUseInfoCard() }
                if (error.isNotBlank()) {
                    item { ErrorCard(error) }
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
private fun HowToUseInfoCard() {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Outlined.Info,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    "How Corridor Works",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            Spacer(Modifier.height(16.dp))

            // Receiving - Automatic
            Surface(
                color = Color(0xFF4CAF50).copy(alpha = 0.08f),
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Icon(
                        Icons.Outlined.Download,
                        contentDescription = null,
                        tint = Color(0xFF4CAF50),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            "Receiving (Automatic)",
                            style = MaterialTheme.typography.titleSmall,
                            color = Color(0xFF2E7D32)
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            "Updates from other devices are automatically copied to your clipboard.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            Spacer(Modifier.height(12.dp))

            // Sending - Manual
            Surface(
                color = Color(0xFFFF9800).copy(alpha = 0.08f),
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(verticalAlignment = Alignment.Top) {
                        Icon(
                            Icons.Outlined.Upload,
                            contentDescription = null,
                            tint = Color(0xFFFF9800),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "Sending (Manual)",
                                style = MaterialTheme.typography.titleSmall,
                                color = Color(0xFFE65100)
                            )
                            Spacer(Modifier.height(4.dp))
                            Text(
                                "Due to Android restrictions, use one of these methods:",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }

                    Spacer(Modifier.height(12.dp))

                    // Method 1: Quick Settings Tile
                    Surface(
                        color = Color(0xFF2196F3).copy(alpha = 0.1f),
                        shape = MaterialTheme.shapes.small,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    shape = MaterialTheme.shapes.small,
                                    color = Color(0xFF2196F3).copy(alpha = 0.2f)
                                ) {
                                    Text(
                                        "1",
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                                        style = MaterialTheme.typography.labelMedium,
                                        color = Color(0xFF1976D2),
                                        fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                                    )
                                }
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    "Quick Settings Tile",
                                    style = MaterialTheme.typography.titleSmall,
                                    color = Color(0xFF1565C0),
                                    fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                                )
                            }
                            Spacer(Modifier.height(8.dp))
                            Text(
                                "Select text → Swipe down from top → Tap \"Corridor Sync\"",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(Modifier.height(8.dp))

                            // Setup instruction with subtle yellow background
                            Surface(
                                color = Color(0xFFFFF59D).copy(alpha = 0.3f),
                                shape = MaterialTheme.shapes.extraSmall,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(8.dp),
                                    verticalAlignment = Alignment.Top
                                ) {
                                    Text(
                                        "⚙️",
                                        style = MaterialTheme.typography.bodySmall,
                                        modifier = Modifier.padding(end = 6.dp)
                                    )
                                    Column {
                                        Text(
                                            "First time setup:",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = Color(0xFFF57F17),
                                            fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                                        )
                                        Spacer(Modifier.height(2.dp))
                                        Text(
                                            "Settings → Quick Settings → Edit → Drag \"Corridor Sync\" to top",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = Color(0xFF827717)
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Spacer(Modifier.height(10.dp))

                    // Method 2: Share Menu
                    Surface(
                        color = Color(0xFF4CAF50).copy(alpha = 0.1f),
                        shape = MaterialTheme.shapes.small,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    shape = MaterialTheme.shapes.small,
                                    color = Color(0xFF4CAF50).copy(alpha = 0.2f)
                                ) {
                                    Text(
                                        "2",
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                                        style = MaterialTheme.typography.labelMedium,
                                        color = Color(0xFF388E3C),
                                        fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                                    )
                                }
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    "Share Menu",
                                    style = MaterialTheme.typography.titleSmall,
                                    color = Color(0xFF2E7D32),
                                    fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                                )
                            }
                            Spacer(Modifier.height(8.dp))
                            Text(
                                "Select text → Click Share → Choose \"Corridor\"",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
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
                title = "Corridor Notifications",
                description = "Status, errors, connection updates, and system messages",
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
