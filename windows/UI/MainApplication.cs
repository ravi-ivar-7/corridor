#nullable enable
using System;
using System.Drawing;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using ClipboardSyncClient.Core;
using Microsoft.Win32;

namespace ClipboardSyncClient.UI
{
    public partial class MainApplication : ApplicationContext
    {
        private NotifyIcon? trayIcon;
        private ContextMenuStrip? trayMenu;
        private ConnectionManager? connectionManager;
        private ConfigManager configManager = null!;
        private NotificationManager notificationManager = null!;
        private HotkeyManager hotkeyManager = null!;
        private AppConfig config = null!;
        private bool isConnected = false;
        private bool isStartupMode = false;
        private bool hasAutoStartFailure = false;
        private string? autoStartErrorMessage = null;
        private System.Threading.Timer? trayHideTimer = null;

        private void LogMessage(string message)
        {
            // Only log to console if in interactive mode
            if (config.Mode == AppMode.Interactive)
            {
                Console.WriteLine(message);
            }
        }

        private Icon CreateColoredTrayIcon(Color backgroundColor)
        {
            // Create a 16x16 bitmap with colored background
            var bitmap = new Bitmap(16, 16);
            using (var g = Graphics.FromImage(bitmap))
            {
                g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;

                // Fill with background color
                using (var brush = new SolidBrush(backgroundColor))
                {
                    g.FillEllipse(brush, 0, 0, 16, 16);
                }

                // Draw white "C" letter in center
                using (var font = new Font("Segoe UI", 9, FontStyle.Bold))
                using (var textBrush = new SolidBrush(Color.White))
                {
                    var text = "C";
                    var textSize = g.MeasureString(text, font);
                    var x = (16 - textSize.Width) / 2;
                    var y = (16 - textSize.Height) / 2;
                    g.DrawString(text, font, textBrush, x, y);
                }
            }

            return Icon.FromHandle(bitmap.GetHicon());
        }

        private void UpdateTrayIconColor(Color color)
        {
            if (trayIcon != null)
            {
                var oldIcon = trayIcon.Icon;
                trayIcon.Icon = CreateColoredTrayIcon(color);
                oldIcon?.Dispose();
            }
        }

        public MainApplication(bool startupMode = false)
        {
            try
            {
                isStartupMode = startupMode;
                configManager = new ConfigManager();
                config = configManager.LoadConfig();

                // Initialize notifications based on mode
                notificationManager = new NotificationManager(config.Mode == AppMode.Interactive);

                // Initialize hotkey manager
                hotkeyManager = new HotkeyManager();
                InitializeHotkeys();

                // Initialize tray icon if in interactive mode
                // For startup mode in silent mode, we'll initialize it only when there's an error
                if (config.Mode == AppMode.Interactive)
                {
                    InitializeTrayIcon();
                }

                InitializeConnection();
            }
            catch (Exception ex)
            {
                // In silent mode, don't show GUI dialogs
                if (config.Mode == AppMode.Silent && !isStartupMode)
                {
                    // Just exit silently in silent mode (not startup mode)
                    Application.Exit();
                }
                else
                {
                    MessageBox.Show($"Failed to initialize application: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    Application.Exit();
                }
            }
        }

        private void InitializeHotkeys()
        {
            try
            {
                // Register open hotkey
                if (!string.IsNullOrWhiteSpace(config.OpenHotkey))
                {
                    hotkeyManager.RegisterHotkey(config.OpenHotkey, () => {
                        // Show setup window or bring to front
                        SynchronizationContext.Current?.Post(_ => {
                            var setupWindow = new SetupWindow(configManager);
                            setupWindow.ShowDialog();
                        }, null);
                    });
                }
            }
            catch (Exception ex)
            {
                // Log error but don't crash the app
                LogMessage($"Failed to register hotkeys: {ex.Message}");
            }
        }

        private void InitializeTrayIcon()
        {
            // Try to load custom icon, fallback to system icon if failed
            Icon? customIcon = null;
            try
            {
                // Load the application icon
                customIcon = new Icon("Resources/Icons/app_icon.ico");
            }
            catch
            {
                // Fallback to system icon
                customIcon = SystemIcons.Application;
            }

                trayIcon = new NotifyIcon
                {
                    Icon = customIcon,
                    Text = $"{config.AppName} - Disconnected\nRight-click for menu",
                    Visible = true
                };

            CreateTrayMenu();
            trayIcon.ContextMenuStrip = trayMenu;
            trayIcon.MouseClick += TrayIcon_MouseClick;
            trayIcon.DoubleClick += TrayIcon_DoubleClick;
        }

        private void CreateTrayMenu()
        {
            trayMenu = new ContextMenuStrip();

            // If AutoStart failed, show error banner at top
            if (hasAutoStartFailure)
            {
                var errorItem = new ToolStripMenuItem("⚠️ AutoStart Failed - Click to Retry");
                errorItem.Font = new Font(errorItem.Font, FontStyle.Bold);
                errorItem.ForeColor = Color.FromArgb(220, 53, 69);
                errorItem.Click += (s, e) => ShowAutoStartErrorDialog();
                trayMenu.Items.Add(errorItem);
                trayMenu.Items.Add(new ToolStripSeparator());

                var retryItem = new ToolStripMenuItem("Retry Connection", null, (s, e) => ManualRetryConnection());
                var setupItem = new ToolStripMenuItem("Open Setup", null, (s, e) => OpenSetupWindow());
                trayMenu.Items.Add(retryItem);
                trayMenu.Items.Add(setupItem);
                trayMenu.Items.Add(new ToolStripSeparator());
            }

            // Status item (non-clickable, shows current status)
            var statusItem = new ToolStripMenuItem("Status: Disconnected");
            statusItem.Enabled = false;
            trayMenu.Items.Add(statusItem);
            trayMenu.Items.Add(new ToolStripSeparator());

            // Control items
            var connectItem = new ToolStripMenuItem("Connect", null, Connect_Click);
            var disconnectItem = new ToolStripMenuItem("Disconnect", null, Disconnect_Click);
            var stopItem = new ToolStripMenuItem("Stop", null, Stop_Click);

            trayMenu.Items.Add(connectItem);
            trayMenu.Items.Add(disconnectItem);
            trayMenu.Items.Add(stopItem);
            trayMenu.Items.Add(new ToolStripSeparator());

                // Info and exit
                var aboutItem = new ToolStripMenuItem("About", null, About_Click);
                var exitItem = new ToolStripMenuItem("Exit", null, Exit_Click);

                trayMenu.Items.Add(aboutItem);
                trayMenu.Items.Add(new ToolStripSeparator());
                trayMenu.Items.Add(exitItem);

            UpdateMenuItems();
        }

        private void UpdateMenuItems()
        {
            if (trayMenu != null && trayMenu.Items.Count >= 5)
            {
                // Update status item (index 0)
                string statusText = isConnected ? "Status: Connected" : "Status: Disconnected";
                trayMenu.Items[0].Text = statusText;
                
                // Update control items
                trayMenu.Items[2].Enabled = !isConnected; // Connect (index 2)
                trayMenu.Items[3].Enabled = isConnected;   // Disconnect (index 3)
                trayMenu.Items[4].Enabled = true;          // Stop (always enabled)
            }
        }

        private void InitializeConnection()
        {
            try
            {
                connectionManager = new ConnectionManager(configManager);
                connectionManager.ConnectionStateChanged += OnConnectionStateChanged;
                connectionManager.ClipboardReceived += OnClipboardReceived;

                // Add message filter for hotkey processing
                Application.AddMessageFilter(new HotkeyMessageFilter(hotkeyManager));

                // Subscribe to power management events to handle sleep/wake
                SystemEvents.PowerModeChanged += OnPowerModeChanged;

                // Start connection in background without blocking
                Task.Run(async () =>
                {
                    try
                    {
                        await connectionManager.StartAsync();
                    }
                    catch (Exception ex)
                    {
                        if (isStartupMode)
                        {
                            // AutoStart failure - special handling for both Silent and Interactive modes
                            hasAutoStartFailure = true;
                            autoStartErrorMessage = ex.Message;

                            SynchronizationContext.Current?.Post(_ =>
                            {
                                // Force tray icon creation even in Silent mode
                                if (trayIcon == null)
                                {
                                    InitializeTrayIcon();
                                }

                                if (trayIcon != null)
                                {
                                    // Set red icon to indicate failure
                                    UpdateTrayIconColor(Color.FromArgb(220, 53, 69)); // Red

                                    // Show balloon notification
                                    trayIcon.ShowBalloonTip(10000, "AutoStart Failed",
                                        $"Failed to connect automatically: {ex.Message}\n\nClick to retry or open setup.",
                                        ToolTipIcon.Error);
                                }

                                // Start automatic retry attempts
                                StartAutoRetry();
                            }, null);
                        }
                        else if (config.Mode == AppMode.Interactive)
                        {
                            // Normal failure in Interactive mode (not AutoStart)
                            SynchronizationContext.Current?.Post(_ =>
                            {
                                MessageBox.Show($"Connection failed: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                            }, null);
                        }
                        // In Silent mode without AutoStart, fail silently
                    }
                });
            }
            catch (Exception ex)
            {
                if (isStartupMode)
                {
                    // AutoStart initialization failure
                    hasAutoStartFailure = true;
                    autoStartErrorMessage = $"Initialization error: {ex.Message}";

                    // Force tray icon creation even in Silent mode
                    if (trayIcon == null)
                    {
                        InitializeTrayIcon();
                    }

                    if (trayIcon != null)
                    {
                        // Set red icon to indicate failure
                        UpdateTrayIconColor(Color.FromArgb(220, 53, 69)); // Red

                        trayIcon.ShowBalloonTip(10000, "AutoStart Failed",
                            $"Failed to initialize: {ex.Message}\n\nClick to retry or open setup.",
                            ToolTipIcon.Error);
                    }

                    // Start automatic retry attempts
                    StartAutoRetry();
                }
                else if (config.Mode == AppMode.Interactive)
                {
                    // Normal initialization failure in Interactive mode
                    MessageBox.Show($"Failed to initialize connection: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
                // In Silent mode without AutoStart, fail silently
            }
        }

        private async void StartAutoRetry()
        {
            // Automatic retry: 3 attempts with increasing delays
            int[] retryDelays = { 5000, 10000, 15000 }; // 5s, 10s, 15s

            for (int attempt = 1; attempt <= 3; attempt++)
            {
                LogMessage($"AutoStart retry attempt {attempt}/3 in {retryDelays[attempt - 1] / 1000} seconds...");

                await Task.Delay(retryDelays[attempt - 1]);

                // Update tray to yellow (connecting)
                if (trayIcon != null)
                {
                    UpdateTrayIconColor(Color.FromArgb(255, 193, 7)); // Yellow
                    trayIcon.Text = $"Corridor - Retry attempt {attempt}/3";
                }

                try
                {
                    if (connectionManager != null)
                    {
                        await connectionManager.StartAsync();

                        // Success! Clear error state
                        hasAutoStartFailure = false;
                        autoStartErrorMessage = null;

                        LogMessage($"AutoStart retry successful on attempt {attempt}");

                        // Update tray to green
                        if (trayIcon != null)
                        {
                            UpdateTrayIconColor(Color.FromArgb(40, 167, 69)); // Green
                            trayIcon.Text = "Corridor - Connected";

                            // Show success notification
                            trayIcon.ShowBalloonTip(3000, "Connected",
                                "Successfully connected to server!", ToolTipIcon.Info);
                        }

                        // If in Silent mode, hide tray after 10 seconds
                        if (config.Mode == AppMode.Silent && trayIcon != null)
                        {
                            trayHideTimer = new System.Threading.Timer(_ =>
                            {
                                // Hide tray icon on UI thread
                                if (trayIcon != null && trayIcon.Visible)
                                {
                                    trayIcon.Visible = false;
                                    LogMessage("Auto-hiding tray icon in Silent mode after successful retry");
                                }
                            }, null, 10000, Timeout.Infinite);
                        }

                        return; // Success, stop retrying
                    }
                }
                catch (Exception ex)
                {
                    LogMessage($"AutoStart retry attempt {attempt} failed: {ex.Message}");

                    if (attempt == 3)
                    {
                        // All retries failed
                        if (trayIcon != null)
                        {
                            UpdateTrayIconColor(Color.FromArgb(220, 53, 69)); // Red
                            trayIcon.Text = "Corridor - Connection Failed";
                            trayIcon.ShowBalloonTip(5000, "Retry Failed",
                                "All automatic retry attempts failed. Click to manually retry or open setup.",
                                ToolTipIcon.Error);
                        }
                    }
                }
            }
        }

        private void OnConnectionStateChanged(object? sender, ConnectionState state)
        {
            // Use SynchronizationContext for thread-safe UI updates
            var syncContext = SynchronizationContext.Current;
            if (syncContext != null)
            {
                syncContext.Post(_ => UpdateConnectionState(state), null);
            }
            else
            {
                // Fallback to direct call if no sync context
                UpdateConnectionState(state);
            }
        }

        private void UpdateConnectionState(ConnectionState state)
        {
            isConnected = state == ConnectionState.Connected;

            // Debug output
            LogMessage($"Connection state changed to: {state}");

            // Only update UI if tray icon exists
            if (trayIcon != null)
            {
                switch (state)
                {
                    case ConnectionState.Connected:
                        // Green background - connected
                        UpdateTrayIconColor(Color.FromArgb(40, 167, 69));
                        trayIcon.Text = $"{config.AppName} - Connected\nRight-click for menu";

                        // If in Silent mode and not AutoStart failure, hide tray after 10 seconds
                        if (config.Mode == AppMode.Silent && !hasAutoStartFailure)
                        {
                            trayHideTimer?.Dispose();
                            trayHideTimer = new System.Threading.Timer(_ =>
                            {
                                if (trayIcon != null && trayIcon.Visible)
                                {
                                    trayIcon.Visible = false;
                                    LogMessage("Auto-hiding tray icon in Silent mode");
                                }
                            }, null, 10000, Timeout.Infinite);
                        }
                        break;

                    case ConnectionState.Connecting:
                        // Yellow background - connecting
                        UpdateTrayIconColor(Color.FromArgb(255, 193, 7));
                        trayIcon.Text = $"{config.AppName} - Connecting...\nRight-click for menu";
                        break;

                    case ConnectionState.Disconnected:
                        // Red background - disconnected
                        UpdateTrayIconColor(Color.FromArgb(220, 53, 69));
                        trayIcon.Text = $"{config.AppName} - Disconnected\nRight-click for menu";

                        if (isStartupMode && !hasAutoStartFailure)
                        {
                            trayIcon.ShowBalloonTip(5000, "Connection Lost",
                                "Lost connection", ToolTipIcon.Warning);
                        }
                        break;

                    case ConnectionState.HttpFallback:
                        // Orange background - HTTP fallback
                        UpdateTrayIconColor(Color.FromArgb(255, 152, 0));
                        trayIcon.Text = $"{config.AppName} - HTTP Fallback\nRight-click for menu";
                        break;
                    case ConnectionState.Error:
                        // In startup mode, only show tray icon when there's an error
                        if (isStartupMode)
                        {
                            if (trayIcon == null)
                            {
                                InitializeTrayIcon();
                            }
                            if (trayIcon != null)
                            {
                                trayIcon.Icon = SystemIcons.Error;
                                trayIcon.Text = $"{config.AppName} - Error\nRight-click for menu";
                                trayIcon.ShowBalloonTip(5000, "Connection Error", 
                                    "Error occurred with clipboard sync service", ToolTipIcon.Error);
                            }
                        }
                        else
                        {
                            trayIcon.Icon = SystemIcons.Error;
                            trayIcon.Text = $"{config.AppName} - Error\nRight-click for menu";
                        }
                        break;
                }

                UpdateMenuItems();
            }
            
            // Always update menu items to reflect current status
            UpdateMenuItems();
            
            // No notifications in background mode - completely silent (except in startup mode)
        }

        private void OnClipboardReceived(object? sender, string content)
        {
            // Update clipboard directly - the UpdateClipboard method handles STA thread
            UpdateClipboard(content);
        }

        private void UpdateClipboard(string content)
        {
            try
            {
                // Use STA thread for clipboard operations
                var thread = new Thread(() =>
                {
                    Clipboard.SetText(content);
                });
                thread.SetApartmentState(ApartmentState.STA);
                thread.Start();
                thread.Join();

                // Completely silent - no notifications, no UI updates
            }
            catch (Exception)
            {
                // Silent error handling - no notifications in background mode
            }
        }

        private void TrayIcon_MouseClick(object? sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left && hasAutoStartFailure)
            {
                // Left click when AutoStart failed - show error dialog
                ShowAutoStartErrorDialog();
            }
            else if (e.Button == MouseButtons.Right)
            {
                // Show context menu on right click
                if (trayMenu != null)
                {
                    trayMenu.Show(Cursor.Position);
                }
            }
        }

        private void TrayIcon_DoubleClick(object? sender, EventArgs e)
        {
            if (hasAutoStartFailure)
            {
                // Show error dialog on double click if AutoStart failed
                ShowAutoStartErrorDialog();
            }
            else if (isConnected)
            {
                Disconnect_Click(sender, e);
            }
            else
            {
                Connect_Click(sender, e);
            }
        }

        private void ShowAutoStartErrorDialog()
        {
            var dialog = new Form
            {
                Text = "AutoStart Connection Failed",
                Size = new Size(500, 300),
                StartPosition = FormStartPosition.CenterScreen,
                FormBorderStyle = FormBorderStyle.FixedDialog,
                MaximizeBox = false,
                MinimizeBox = false,
                ShowInTaskbar = false
            };

            var iconLabel = new Label
            {
                Text = "⚠️",
                Location = new Point(20, 20),
                Size = new Size(40, 40),
                Font = new Font("Segoe UI", 24),
                ForeColor = Color.FromArgb(220, 53, 69)
            };
            dialog.Controls.Add(iconLabel);

            var titleLabel = new Label
            {
                Text = "The app started automatically but failed to connect to the server.",
                Location = new Point(70, 20),
                Size = new Size(400, 40),
                Font = new Font("Segoe UI", 10, FontStyle.Bold)
            };
            dialog.Controls.Add(titleLabel);

            var errorLabel = new Label
            {
                Text = $"Error Details:\n{autoStartErrorMessage}",
                Location = new Point(70, 70),
                Size = new Size(400, 80),
                Font = new Font("Segoe UI", 9)
            };
            dialog.Controls.Add(errorLabel);

            var retryButton = new Button
            {
                Text = "Retry Connection",
                Location = new Point(250, 180),
                Size = new Size(120, 35),
                DialogResult = DialogResult.Retry
            };
            dialog.Controls.Add(retryButton);

            var setupButton = new Button
            {
                Text = "Open Setup",
                Location = new Point(380, 180),
                Size = new Size(90, 35),
                DialogResult = DialogResult.OK
            };
            dialog.Controls.Add(setupButton);

            var closeButton = new Button
            {
                Text = "Close",
                Location = new Point(160, 180),
                Size = new Size(80, 35),
                DialogResult = DialogResult.Cancel
            };
            dialog.Controls.Add(closeButton);

            var result = dialog.ShowDialog();

            if (result == DialogResult.Retry)
            {
                // Retry connection
                ManualRetryConnection();
            }
            else if (result == DialogResult.OK)
            {
                // Open setup window
                OpenSetupWindow();
            }
        }

        private async void ManualRetryConnection()
        {
            if (connectionManager != null && trayIcon != null)
            {
                try
                {
                    // Update tray to yellow (connecting)
                    UpdateTrayIconColor(Color.FromArgb(255, 193, 7));
                    trayIcon.Text = "Corridor - Retrying...";

                    await connectionManager.StartAsync();

                    // Success!
                    hasAutoStartFailure = false;
                    autoStartErrorMessage = null;

                    UpdateTrayIconColor(Color.FromArgb(40, 167, 69)); // Green
                    trayIcon.Text = "Corridor - Connected";
                    trayIcon.ShowBalloonTip(3000, "Connected", "Successfully connected!", ToolTipIcon.Info);

                    // Auto-hide in Silent mode
                    if (config.Mode == AppMode.Silent)
                    {
                        trayHideTimer?.Dispose();
                        trayHideTimer = new System.Threading.Timer(_ =>
                        {
                            if (trayIcon != null && trayIcon.Visible)
                            {
                                trayIcon.Visible = false;
                            }
                        }, null, 10000, Timeout.Infinite);
                    }
                }
                catch (Exception ex)
                {
                    UpdateTrayIconColor(Color.FromArgb(220, 53, 69)); // Red
                    trayIcon.Text = "Corridor - Connection Failed";
                    MessageBox.Show($"Retry failed: {ex.Message}\n\nPlease check your configuration.",
                        "Retry Failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }

        private void OpenSetupWindow()
        {
            try
            {
                var setupWindow = new SetupWindow(configManager);
                var result = setupWindow.ShowDialog();

                if (result == DialogResult.OK)
                {
                    // Config was saved, reload and restart connection
                    config = configManager.LoadConfig();
                    hasAutoStartFailure = false;
                    autoStartErrorMessage = null;

                    // Restart connection with new config
                    Task.Run(async () =>
                    {
                        try
                        {
                            if (connectionManager != null)
                            {
                                await connectionManager.StopAsync();
                                await Task.Delay(1000);
                                await connectionManager.StartAsync();
                            }
                        }
                        catch (Exception ex)
                        {
                            LogMessage($"Failed to restart after setup: {ex.Message}");
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to open setup: {ex.Message}", "Error",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private async void Connect_Click(object? sender, EventArgs e)
        {
            if (connectionManager != null)
            {
                try
                {
                    await connectionManager.StartAsync();
                }
                catch (Exception ex)
                {
                    // In silent mode, don't show GUI dialogs
                    if (config.Mode == AppMode.Interactive)
                    {
                        MessageBox.Show($"Failed to connect: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
            }
        }

        private async void Disconnect_Click(object? sender, EventArgs e)
        {
            if (connectionManager != null)
            {
                try
                {
                    await connectionManager.StopAsync();
                }
                catch (Exception ex)
                {
                    // In silent mode, don't show GUI dialogs
                    if (config.Mode == AppMode.Interactive)
                    {
                        MessageBox.Show($"Failed to disconnect: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
            }
        }


            private void About_Click(object? sender, EventArgs e)
            {
                var aboutDialog = new AboutDialog();
                aboutDialog.ShowDialog();
            }

        private async void Stop_Click(object? sender, EventArgs e)
        {
            if (connectionManager != null)
            {
                try
                {
                    await connectionManager.StopAsync();
                    // Update menu to reflect stopped state
                    UpdateMenuItems();
                }
                catch (Exception)
                {
                    // Silent error handling
                }
            }
        }

        private void Exit_Click(object? sender, EventArgs e)
        {
            Application.Exit();
        }

        private void OnPowerModeChanged(object sender, PowerModeChangedEventArgs e)
        {
            try
            {
                switch (e.Mode)
                {
                    case PowerModes.Suspend:
                        // Computer is going to sleep
                        LogMessage("Application: System suspending...");
                        break;

                    case PowerModes.Resume:
                        // Computer woke up from sleep/hibernation
                        LogMessage("Application: System resumed from sleep, restarting connection...");

                        // Restart connection manager after wake
                        Task.Run(async () =>
                        {
                            try
                            {
                                // Wait a bit for network to stabilize
                                await Task.Delay(4000);

                                // Restart connection
                                if (connectionManager != null)
                                {
                                    await connectionManager.StopAsync();
                                    await Task.Delay(1000);
                                    await connectionManager.StartAsync();
                                    LogMessage("Application: Connection restarted after system resume");
                                }
                            }
                            catch (Exception ex)
                            {
                                LogMessage($"Application: Error restarting connection after resume: {ex.Message}");
                            }
                        });
                        break;
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Application: Error handling power mode change: {ex.Message}");
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                // Unsubscribe from power management events
                SystemEvents.PowerModeChanged -= OnPowerModeChanged;

                // Dispose timer
                trayHideTimer?.Dispose();

                connectionManager?.Dispose();
                trayIcon?.Dispose();
                trayMenu?.Dispose();
                notificationManager?.Dispose();
                hotkeyManager?.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}