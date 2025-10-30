package com.corridor.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Menu
import androidx.compose.material.icons.outlined.StopCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.corridor.R
import com.corridor.ui.icons.CustomIcons

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppHeader(
    status: String,
    isAccessibilityEnabled: Boolean,
    onMenuClick: () -> Unit,
    onStopClick: () -> Unit
) {
    TopAppBar(
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.clickable { onMenuClick() }
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_corridor_logo),
                    contentDescription = "Corridor",
                    modifier = Modifier.size(28.dp),
                    tint = MaterialTheme.colorScheme.primary
                )

                // Status and Accessibility stacked vertically beside logo
                Column {
                    Text(
                        text = "Status: ${when (status) {
                            "connected" -> "Connected"
                            "disconnected" -> "Disconnected"
                            "closed" -> "Closed"
                            "connecting" -> "Connecting"
                            "starting" -> "Starting"
                            "", "Not started" -> "Not started"
                            else -> status
                        }}",
                        style = MaterialTheme.typography.labelSmall,
                        color = when (status) {
                            "connected" -> MaterialTheme.colorScheme.primary
                            "disconnected", "closed" -> MaterialTheme.colorScheme.error
                            else -> MaterialTheme.colorScheme.onSurfaceVariant
                        }
                    )

                    Text(
                        text = "Accessibility: ${if (isAccessibilityEnabled) "Granted" else "Denied"}",
                        style = MaterialTheme.typography.labelSmall,
                        color = if (isAccessibilityEnabled)
                            MaterialTheme.colorScheme.primary
                        else
                            MaterialTheme.colorScheme.error
                    )
                }
            }
        },
        actions = {
            TextButton(
                onClick = onStopClick,
                colors = ButtonDefaults.textButtonColors(
                    contentColor = MaterialTheme.colorScheme.error
                )
            ) {
                Icon(
                    Icons.Outlined.StopCircle,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(Modifier.width(4.dp))
                Text("Stop")
            }
            IconButton(onClick = onMenuClick) {
                Icon(
                    Icons.Outlined.Menu,
                    contentDescription = "Menu"
                )
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer,
            titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
        )
    )
}
