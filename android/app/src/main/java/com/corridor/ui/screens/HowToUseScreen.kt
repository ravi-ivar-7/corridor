package com.corridor.ui.screens

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HowToUseScreen(onBack: () -> Unit) {
    val ctx = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("How to Use Corridor") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Outlined.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Important Notice Card
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFF2196F3).copy(alpha = 0.08f)
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Outlined.Info,
                            contentDescription = null,
                            tint = Color(0xFF1976D2),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(Modifier.width(8.dp))
                        Text(
                            "Important Information",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color(0xFF1565C0),
                            fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                        )
                    }
                    Spacer(Modifier.height(10.dp))
                    Text(
                        "Due to Android restrictions, automatic clipboard monitoring in the background is not possible without accessibility service. However, Corridor provides two easy methods to sync your clipboard.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }

            // How It Works Section
            Text(
                "How Corridor Works",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.primary
            )

            InfoCard(
                icon = Icons.Outlined.Download,
                title = "Receiving (Automatic)",
                description = "Updates from other devices are automatically copied to your clipboard. No action needed!",
                color = Color(0xFF4CAF50)
            )

            InfoCard(
                icon = Icons.Outlined.Upload,
                title = "Sending (Manual)",
                description = "Due to Android restrictions, you need to manually trigger clipboard sync using one of the two methods below.",
                color = Color(0xFFFF9800)
            )

            Spacer(Modifier.height(8.dp))

            // Methods Section
            Text(
                "Two Ways to Send Clipboard",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.primary
            )

            // Method 1: Quick Settings Tile
            MethodCard(
                number = "1",
                title = "Quick Settings Tile (Recommended)",
                steps = listOf(
                    "First time only: Add the tile to Quick Settings",
                    "  → Open Settings → Quick Settings",
                    "  → Tap Edit → Find \"Corridor Sync\" → Drag to top",
                    "",
                    "To sync clipboard:",
                    "Select/copy any text in any app",
                    "Swipe down from top to open Quick Settings",
                    "Tap the \"Corridor Sync\" tile",
                    "Done! Your clipboard is synced"
                ),
                icon = Icons.Outlined.GridView
            )

            // Method 2: Share Menu
            MethodCard(
                number = "2",
                title = "Share Menu",
                steps = listOf(
                    "Select any text in any app",
                    "Tap \"Share\" or the share icon",
                    "Choose \"Corridor\" from the share menu",
                    "Your text is instantly synced!"
                ),
                icon = Icons.Outlined.Share
            )

            Spacer(Modifier.height(8.dp))

            // Tips Card
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFFFFC107).copy(alpha = 0.08f)
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = MaterialTheme.shapes.small,
                            color = Color(0xFFFFC107).copy(alpha = 0.15f)
                        ) {
                            Icon(
                                Icons.Outlined.Lightbulb,
                                contentDescription = null,
                                tint = Color(0xFFF57C00),
                                modifier = Modifier
                                    .size(40.dp)
                                    .padding(8.dp)
                            )
                        }
                        Spacer(Modifier.width(12.dp))
                        Text(
                            "Pro Tips",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color(0xFFF57C00),
                            fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                        )
                    }
                    Spacer(Modifier.height(14.dp))

                    TipItem("Quick Settings Tile is fastest - just one swipe and tap!")
                    Spacer(Modifier.height(8.dp))
                    TipItem("Share menu works great for long text selections")
                    Spacer(Modifier.height(8.dp))
                    TipItem("Both methods work in ALL apps without restrictions")
                }
            }

            Spacer(Modifier.height(32.dp))
        }
    }
}

@Composable
private fun InfoCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    description: String,
    color: Color
) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = color.copy(alpha = 0.08f)
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.Top
        ) {
            Surface(
                shape = MaterialTheme.shapes.small,
                color = color.copy(alpha = 0.15f)
            ) {
                Icon(
                    icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier
                        .size(40.dp)
                        .padding(8.dp)
                )
            }
            Spacer(Modifier.width(12.dp))
            Column {
                Text(
                    title,
                    style = MaterialTheme.typography.titleMedium,
                    color = color,
                    fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }
    }
}

@Composable
private fun MethodCard(
    number: String,
    title: String,
    steps: List<String>,
    icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    val isQuickSettingsTile = number == "1"
    val bgColor = if (isQuickSettingsTile) Color(0xFF2196F3) else Color(0xFF4CAF50)

    Card(
        colors = CardDefaults.cardColors(
            containerColor = bgColor.copy(alpha = 0.08f)
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Surface(
                    shape = MaterialTheme.shapes.small,
                    color = bgColor.copy(alpha = 0.2f)
                ) {
                    Text(
                        number,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.titleMedium,
                        color = bgColor,
                        fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                    )
                }
                Icon(
                    icon,
                    contentDescription = null,
                    tint = bgColor,
                    modifier = Modifier.size(24.dp)
                )
                Text(
                    title,
                    style = MaterialTheme.typography.titleMedium,
                    color = bgColor,
                    fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                )
            }

            Spacer(Modifier.height(14.dp))

            steps.forEachIndexed { index, step ->
                if (step.isEmpty()) {
                    Spacer(Modifier.height(4.dp))
                } else if (step.startsWith("  → ") || step.startsWith("First time only:")) {
                    // Setup instructions with yellow background
                    if (step.startsWith("First time only:")) {
                        Spacer(Modifier.height(8.dp))
                        Surface(
                            color = Color(0xFFFFF59D).copy(alpha = 0.3f),
                            shape = MaterialTheme.shapes.small,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(verticalAlignment = Alignment.Top) {
                                    Text(
                                        "⚙️",
                                        style = MaterialTheme.typography.bodyMedium,
                                        modifier = Modifier.padding(end = 8.dp)
                                    )
                                    Column {
                                        Text(
                                            step,
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = Color(0xFFF57F17),
                                            fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }
                        Spacer(Modifier.height(4.dp))
                    } else {
                        Surface(
                            color = Color(0xFFFFF59D).copy(alpha = 0.3f),
                            shape = MaterialTheme.shapes.extraSmall,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                step.trim(),
                                style = MaterialTheme.typography.bodySmall,
                                color = Color(0xFF827717),
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }
                        Spacer(Modifier.height(4.dp))
                    }
                } else if (step.startsWith("To sync clipboard:")) {
                    Spacer(Modifier.height(4.dp))
                    Text(
                        step,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold
                    )
                    Spacer(Modifier.height(4.dp))
                } else {
                    Row(
                        modifier = Modifier.padding(vertical = 3.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Text(
                            "•",
                            style = MaterialTheme.typography.bodyMedium,
                            color = bgColor,
                            modifier = Modifier.width(20.dp)
                        )
                        Text(
                            step,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun TipItem(text: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top
    ) {
        Text(
            "💡",
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.width(28.dp)
        )
        Text(
            text,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}
