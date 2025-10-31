package com.corridor.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
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
    onMenuClick: () -> Unit,
    onStopClick: () -> Unit,
    onReconnectClick: () -> Unit,
    onShowHowToUse: () -> Unit = {}
) {
    var showHelpMenu by remember { mutableStateOf(false) }
    Surface(
        color = MaterialTheme.colorScheme.primaryContainer,
        modifier = Modifier.fillMaxWidth()
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .padding(horizontal = 16.dp)
        ) {
            // Logo - LEFT (clickable)
            Icon(
                painter = painterResource(id = R.drawable.ic_corridor_logo),
                contentDescription = "Corridor",
                modifier = Modifier
                    .size(32.dp)
                    .align(Alignment.CenterStart)
                    .clickable(onClick = onMenuClick),
                tint = MaterialTheme.colorScheme.primary
            )

            // Center - Two compact rows (TRULY CENTERED)
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
                modifier = Modifier.align(Alignment.Center)
            ) {
                // First row: Status (clickable)
                Text(
                    text = when (status) {
                        "connected" -> "Connected"
                        "disconnected" -> "Disconnected"
                        "closed" -> "Closed"
                        "connecting" -> "Connecting..."
                        "starting" -> "Starting..."
                        "", "Not started" -> "Not Started"
                        else -> status
                    },
                    style = MaterialTheme.typography.labelMedium,
                    color = when (status) {
                        "connected" -> MaterialTheme.colorScheme.primary
                        "disconnected", "closed" -> MaterialTheme.colorScheme.error
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    },
                    modifier = Modifier.clickable(onClick = onMenuClick)
                )

                Spacer(Modifier.height(2.dp))

                // Second row: Action
                when (status) {
                    "connected" -> {
                        TextButton(
                            onClick = onStopClick,
                            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 0.dp),
                            modifier = Modifier.height(20.dp)
                        ) {
                            Icon(
                                Icons.Outlined.StopCircle,
                                contentDescription = null,
                                modifier = Modifier.size(12.dp),
                                tint = MaterialTheme.colorScheme.error
                            )
                            Spacer(Modifier.width(3.dp))
                            Text(
                                "Stop",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.error
                            )
                        }
                    }
                    "disconnected", "closed" -> {
                        TextButton(
                            onClick = onReconnectClick,
                            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 0.dp),
                            modifier = Modifier.height(20.dp)
                        ) {
                            Icon(
                                Icons.Outlined.Refresh,
                                contentDescription = null,
                                modifier = Modifier.size(12.dp),
                                tint = MaterialTheme.colorScheme.error
                            )
                            Spacer(Modifier.width(3.dp))
                            Text(
                                "Retry",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.error
                            )
                        }
                    }
                    "connecting", "starting" -> {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center,
                            modifier = Modifier.height(20.dp)
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(10.dp),
                                strokeWidth = 1.5.dp,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Spacer(Modifier.width(4.dp))
                            Text(
                                "Wait...",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            // Help and Menu - RIGHT (between center and edge)
            Row(
                modifier = Modifier.align(Alignment.CenterEnd),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Help icon with dropdown
                Box {
                    IconButton(onClick = { showHelpMenu = true }) {
                        Icon(
                            Icons.Outlined.HelpOutline,
                            contentDescription = "Help",
                            tint = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                    DropdownMenu(
                        expanded = showHelpMenu,
                        onDismissRequest = { showHelpMenu = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("How to Use Corridor") },
                            onClick = {
                                showHelpMenu = false
                                onShowHowToUse()
                            },
                            leadingIcon = {
                                Icon(Icons.Outlined.Info, contentDescription = null)
                            }
                        )
                    }
                }

                // Menu icon
                IconButton(onClick = onMenuClick) {
                    Icon(
                        Icons.Outlined.Menu,
                        contentDescription = "Menu",
                        tint = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
        }
    }
}
