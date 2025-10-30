package com.corridor.ui.components

import android.content.Context
import android.content.Intent
import android.provider.Settings
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.corridor.R
import com.corridor.service.ClipboardAccessibilityService
import com.corridor.ui.icons.CustomIcons
import com.corridor.util.Preferences
import kotlinx.coroutines.launch

@Composable
fun AppNavigationDrawer(
    token: String,
    status: String,
    error: String,
    isAccessibilityEnabled: Boolean,
    drawerState: DrawerState,
    onStopService: () -> Unit
) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()

    val silentMode = Preferences.loadSilent(ctx)
    val notifyLocal = Preferences.loadNotifyLocal(ctx)
    val notifyRemote = Preferences.loadNotifyRemote(ctx)
    val notifyErrors = Preferences.loadNotifyErrors(ctx)
    var accessibilityCheck by remember { mutableStateOf(isAccessibilityEnabled) }

    LaunchedEffect(drawerState.isOpen) {
        if (drawerState.isOpen) {
            accessibilityCheck = ClipboardAccessibilityService.isEnabled(ctx)
        }
    }

    ModalDrawerSheet(modifier = Modifier.width(320.dp)) {
        Column(
            modifier = Modifier
                .fillMaxHeight()
                .verticalScroll(rememberScrollState())
        ) {
            // Header
            DrawerHeader(drawerState)
            HorizontalDivider()

            // Token Section
            NavigationSection(title = "Token") {
                Text(
                    token,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }

            HorizontalDivider()

            // Status Section
            NavigationSection(title = "Status") {
                StatusItem(
                    icon = when (status) {
                        "connected" -> CustomIcons.CircleCheck
                        "disconnected", "closed" -> CustomIcons.CircleX
                        else -> CustomIcons.CircleDot
                    },
                    label = "Connection",
                    value = when (status) {
                        "connected" -> "Connected"
                        "disconnected" -> "Disconnected"
                        "closed" -> "Closed"
                        "connecting" -> "Connecting..."
                        "starting" -> "Starting..."
                        else -> status
                    },
                    isError = status in listOf("disconnected", "closed")
                )

                StatusItem(
                    icon = if (accessibilityCheck) CustomIcons.Eye else CustomIcons.EyeOff,
                    label = "Accessibility",
                    value = if (accessibilityCheck) "Enabled" else "Disabled",
                    isError = !accessibilityCheck,
                    action = if (!accessibilityCheck) {
                        {
                            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                            ctx.startActivity(intent)
                        }
                    } else null
                )

                if (error.isNotBlank()) {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    StatusItem(
                        icon = Icons.Outlined.Warning,
                        label = "Error",
                        value = error,
                        isError = true
                    )
                }
            }

            HorizontalDivider()

            // Notifications Section
            NavigationSection(title = "Notifications") {
                NotificationItem("Silent Mode", silentMode)
                NotificationItem("Local Copy", notifyLocal)
                NotificationItem("Remote Update", notifyRemote)
                NotificationItem("Errors", notifyErrors)

                Text(
                    text = "To change notification settings: Stop the service, make the required notification changes, and start service again",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }

            HorizontalDivider()

            // About Section
            NavigationSection(title = "About") {
                Text(
                    "Corridor Clipboard Sync\nVersion 1.0",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }

            Spacer(Modifier.weight(1f))

            HorizontalDivider()

            // Stop Service Button
            Button(
                onClick = {
                    scope.launch { drawerState.close() }
                    onStopService()
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Text("Stop Service")
            }
        }
    }
}

@Composable
private fun DrawerHeader(drawerState: DrawerState) {
    val scope = rememberCoroutineScope()

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_corridor_logo),
                contentDescription = null,
                modifier = Modifier.size(24.dp),
                tint = MaterialTheme.colorScheme.primary
            )
            Text(
                "Corridor",
                style = MaterialTheme.typography.headlineSmall
            )
        }
        IconButton(onClick = { scope.launch { drawerState.close() } }) {
            Text("✕", style = MaterialTheme.typography.headlineMedium)
        }
    }
}

@Composable
private fun NavigationSection(
    title: String,
    content: @Composable ColumnScope.() -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            title,
            style = MaterialTheme.typography.titleSmall,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)
        )
        content()
    }
}

@Composable
private fun StatusItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String,
    isError: Boolean = false,
    action: (() -> Unit)? = null
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "$label: $value",
            style = MaterialTheme.typography.bodySmall,
            color = if (isError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.weight(1f)
        )

        if (action != null) {
            Button(
                onClick = action,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF4CAF50).copy(alpha = 0.2f),
                    contentColor = Color(0xFF2E7D32)
                ),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
            ) {
                Text("Enable", style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}

@Composable
private fun NotificationItem(label: String, isActive: Boolean) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = if (isActive) Icons.Outlined.CheckCircle else Icons.Outlined.Circle,
            contentDescription = null,
            modifier = Modifier.size(18.dp),
            tint = if (isActive) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            label,
            style = MaterialTheme.typography.bodySmall,
            color = if (isActive) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
