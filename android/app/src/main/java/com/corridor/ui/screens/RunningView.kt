package com.corridor.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.corridor.service.ClipboardSyncService
import com.corridor.ui.components.AppHeader
import com.corridor.ui.components.AppNavigationDrawer
import com.corridor.util.HistoryStore
import com.corridor.util.Preferences
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private fun formatTimestamp(timestamp: Long): String {
    val sdf = SimpleDateFormat("MM/dd/yyyy, hh:mm:ss a", Locale.getDefault())
    return sdf.format(Date(timestamp))
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RunningView(
    status: String,
    error: String,
    token: String,
    history: List<HistoryStore.Entry>,
    historyRefreshTrigger: Int,
    drawerState: DrawerState,
    onStopService: () -> Unit,
    onOpenDrawer: () -> Unit,
    onRefreshHistory: () -> Unit
) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    var localHistoryRefreshTrigger by remember { mutableIntStateOf(historyRefreshTrigger) }
    var showStopDialog by remember { mutableStateOf(false) }
    var showClearHistoryDialog by remember { mutableStateOf(false) }
    var inputText by remember { mutableStateOf("") }
    var isHistoryCollapsed by remember { mutableStateOf(false) }

    // Stop confirmation dialog
    if (showStopDialog) {
        AlertDialog(
            onDismissRequest = { showStopDialog = false },
            title = { Text("Stop Service?") },
            text = { Text("Are you sure you want to stop the clipboard sync service?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showStopDialog = false
                        scope.launch { drawerState.close() }
                        onStopService()
                    },
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Stop")
                }
            },
            dismissButton = {
                TextButton(onClick = { showStopDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Clear history confirmation dialog
    if (showClearHistoryDialog) {
        AlertDialog(
            onDismissRequest = { showClearHistoryDialog = false },
            title = { Text("Clear History?") },
            text = { Text("Are you sure you want to clear all clipboard history? This cannot be undone.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showClearHistoryDialog = false
                        val intent = Intent(ClipboardSyncService.ACTION_CLEAR_HISTORY).apply {
                            setPackage(ctx.packageName)
                        }
                        ctx.sendBroadcast(intent)
                        Toast.makeText(ctx, "Clearing history...", Toast.LENGTH_SHORT).show()
                    },
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Clear")
                }
            },
            dismissButton = {
                TextButton(onClick = { showClearHistoryDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            AppNavigationDrawer(
                token = token,
                status = status,
                error = error,
                drawerState = drawerState,
                onStopService = { showStopDialog = true },
                onShowHowToUse = {
                    // Navigate to how to use screen
                    val intent = Intent(ctx, com.corridor.MainActivity::class.java).apply {
                        putExtra("SHOW_HOW_TO_USE", true)
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    }
                    ctx.startActivity(intent)
                }
            )
        },
        gesturesEnabled = true
    ) {
        Scaffold(
            topBar = {
                AppHeader(
                    status = status,
                    onMenuClick = onOpenDrawer,
                    onStopClick = { showStopDialog = true },
                    onReconnectClick = {
                        // Trigger service restart to reconnect
                        val token = Preferences.loadToken(ctx)
                        val intent = android.content.Intent(ctx, ClipboardSyncService::class.java).apply {
                            putExtra("TOKEN", token)
                            putExtra("SILENT", Preferences.loadSilent(ctx))
                            putExtra("NOTIFY_LOCAL", Preferences.loadNotifyLocal(ctx))
                            putExtra("NOTIFY_REMOTE", Preferences.loadNotifyRemote(ctx))
                            putExtra("NOTIFY_ERRORS", Preferences.loadNotifyErrors(ctx))
                        }
                        ctx.startForegroundService(intent)
                    },
                    onShowHowToUse = {
                        // Navigate to how to use screen
                        val intent = Intent(ctx, com.corridor.MainActivity::class.java).apply {
                            putExtra("SHOW_HOW_TO_USE", true)
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                        }
                        ctx.startActivity(intent)
                    }
                )
            }
        ) { paddingValues ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    Spacer(Modifier.height(4.dp))
                    if (error.isNotBlank()) {
                        ErrorCard(error)
                    }
                }

                item {
                    ManualSyncCard(
                        inputText = inputText,
                        onInputChange = { inputText = it }
                    )
                }

                item {
                    HistoryHeader(
                        itemCount = history.size,
                        isCollapsed = isHistoryCollapsed,
                        onCollapseClick = { isHistoryCollapsed = !isHistoryCollapsed },
                        onClearClick = { showClearHistoryDialog = true }
                    )
                }

                if (!isHistoryCollapsed) {
                    items(history) { entry ->
                        HistoryItem(
                            entry = entry,
                            index = history.indexOf(entry),
                            onUse = {
                                inputText = entry.content
                                Toast.makeText(ctx, "Text loaded to input", Toast.LENGTH_SHORT).show()
                            },
                            onCopy = {
                                val clipboard = ctx.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                clipboard.setPrimaryClip(ClipData.newPlainText("Corridor", entry.content))
                                // Also sync to server
                                val intent = Intent(ClipboardSyncService.ACTION_MANUAL_SYNC).apply {
                                    setPackage(ctx.packageName)
                                    putExtra(ClipboardSyncService.EXTRA_SYNC_TEXT, entry.content)
                                }
                                ctx.sendBroadcast(intent)
                                Toast.makeText(ctx, "Copied and synced to server", Toast.LENGTH_SHORT).show()
                            }
                        )
                    }
                }

                item {
                    Spacer(Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
private fun ErrorCard(error: String) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(8.dp),
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
private fun ManualSyncCard(inputText: String, onInputChange: (String) -> Unit) {
    val ctx = LocalContext.current
    val configuration = LocalConfiguration.current
    val maxHeight = (configuration.screenHeightDp * 0.5f).dp

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF4CAF50).copy(alpha = 0.15f)
        )
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = "Add to Clipboard",
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(Modifier.height(6.dp))
            OutlinedTextField(
                value = inputText,
                onValueChange = onInputChange,
                placeholder = { Text("Type something to sync...") },
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 80.dp, max = maxHeight),
                textStyle = MaterialTheme.typography.bodySmall,
                minLines = 2,
                maxLines = Int.MAX_VALUE
            )
            Spacer(Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Button(
                    onClick = {
                        val textToCopy = inputText
                        if (textToCopy.isNotBlank()) {
                            val clipboard = ctx.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("Corridor", textToCopy))
                            Toast.makeText(ctx, "Copied to clipboard", Toast.LENGTH_SHORT).show()
                        }
                    },
                    enabled = inputText.isNotBlank(),
                    modifier = Modifier.weight(0.7f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.tertiaryContainer,
                        contentColor = MaterialTheme.colorScheme.onTertiaryContainer
                    ),
                    contentPadding = PaddingValues(6.dp)
                ) {
                    Icon(
                        Icons.Outlined.ContentCopy,
                        contentDescription = "Copy",
                        modifier = Modifier.size(16.dp)
                    )
                }
                Button(
                    onClick = { onInputChange("") },
                    enabled = inputText.isNotBlank(),
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer,
                        contentColor = MaterialTheme.colorScheme.onErrorContainer
                    ),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Icon(
                        Icons.Outlined.Delete,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(Modifier.width(4.dp))
                    Text("Clear", style = MaterialTheme.typography.labelSmall)
                }
                Button(
                    onClick = {
                        if (inputText.isNotBlank()) {
                            val intent = Intent(ClipboardSyncService.ACTION_MANUAL_SYNC).apply {
                                setPackage(ctx.packageName)
                                putExtra(ClipboardSyncService.EXTRA_SYNC_TEXT, inputText)
                            }
                            ctx.sendBroadcast(intent)
                            Toast.makeText(ctx, "Text synced to server", Toast.LENGTH_SHORT).show()
                            onInputChange("")
                        }
                    },
                    enabled = inputText.isNotBlank(),
                    modifier = Modifier.weight(2.3f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                        contentColor = MaterialTheme.colorScheme.onPrimaryContainer
                    ),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Icon(
                        Icons.Outlined.Send,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(Modifier.width(4.dp))
                    Text("Sync", style = MaterialTheme.typography.labelSmall)
                }
            }
        }
    }
}

@Composable
private fun HistoryHeader(
    itemCount: Int,
    isCollapsed: Boolean,
    onCollapseClick: () -> Unit,
    onClearClick: () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Clipboard History",
                    style = MaterialTheme.typography.titleSmall,
                    color = MaterialTheme.colorScheme.onSurface
                )
                TextButton(
                    onClick = onCollapseClick,
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Icon(
                        if (isCollapsed) Icons.Outlined.ExpandMore else Icons.Outlined.ExpandLess,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        if (isCollapsed) "Expand" else "Collapse",
                        style = MaterialTheme.typography.labelMedium
                    )
                }
            }

            Spacer(Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Total Items ($itemCount)",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface
                )
                TextButton(
                    onClick = onClearClick,
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = MaterialTheme.colorScheme.error
                    ),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Icon(
                        Icons.Outlined.Delete,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(Modifier.width(4.dp))
                    Text("Clear", style = MaterialTheme.typography.labelMedium)
                }
            }
        }
    }
}

@Composable
private fun HistoryItem(
    entry: HistoryStore.Entry,
    index: Int,
    onUse: () -> Unit,
    onCopy: () -> Unit
) {
    val configuration = LocalConfiguration.current
    val maxContentHeight = (configuration.screenHeightDp * 0.5f).dp
    val scrollState = rememberScrollState()

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = when (index % 2) {
                0 -> MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                else -> MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.3f)
            }
        )
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Outlined.Schedule,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = formatTimestamp(entry.ts),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Button(
                        onClick = onUse,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.secondaryContainer,
                            contentColor = MaterialTheme.colorScheme.onSecondaryContainer
                        ),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Icon(
                            Icons.Outlined.Edit,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(Modifier.width(4.dp))
                        Text("Use", style = MaterialTheme.typography.labelSmall)
                    }
                    Button(
                        onClick = onCopy,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.tertiaryContainer,
                            contentColor = MaterialTheme.colorScheme.onTertiaryContainer
                        ),
                        contentPadding = PaddingValues(8.dp)
                    ) {
                        Icon(
                            Icons.Outlined.ContentCopy,
                            contentDescription = "Copy",
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            Spacer(Modifier.height(6.dp))
            HorizontalDivider()
            Spacer(Modifier.height(6.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = maxContentHeight)
            ) {
                Text(
                    text = entry.content,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(scrollState),
                    maxLines = Int.MAX_VALUE
                )
            }
        }
    }
}

