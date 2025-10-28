using System;
using System.Drawing;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using ClipboardSyncClient.Core;

namespace ClipboardSyncClient.UI
{
    public partial class MainApplication : ApplicationContext
    {
        private NotifyIcon trayIcon;
        private ContextMenuStrip trayMenu;
        private ConnectionManager? connectionManager;
        private ConfigManager configManager;
        private NotificationManager notificationManager;
        private bool isConnected = false;

        public MainApplication()
        {
            try
            {
                configManager = new ConfigManager();
                var config = configManager.LoadConfig();
                
                // No notifications in background mode
                notificationManager = new NotificationManager(false);
                
                // Only initialize tray icon if not running in background
                if (!config.RunInBackground)
                {
                    InitializeTrayIcon();
                }
                
                InitializeConnection();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize application: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                Application.Exit();
            }
        }

        private void InitializeTrayIcon()
        {
            trayIcon = new NotifyIcon
            {
                Icon = SystemIcons.Application,
                Text = "Clipboard Sync - Disconnected",
                Visible = true
            };

            CreateTrayMenu();
            trayIcon.ContextMenuStrip = trayMenu;
            trayIcon.DoubleClick += TrayIcon_DoubleClick;
        }

        private void CreateTrayMenu()
        {
            trayMenu = new ContextMenuStrip();

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

            // Settings and info
            var settingsItem = new ToolStripMenuItem("Settings", null, Settings_Click);
            var aboutItem = new ToolStripMenuItem("About", null, About_Click);
            var exitItem = new ToolStripMenuItem("Exit", null, Exit_Click);

            trayMenu.Items.Add(settingsItem);
            trayMenu.Items.Add(aboutItem);
            trayMenu.Items.Add(new ToolStripSeparator());
            trayMenu.Items.Add(exitItem);

            UpdateMenuItems();
        }

        private void UpdateMenuItems()
        {
            if (trayMenu != null && trayMenu.Items.Count >= 6)
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

                // Start connection in background without blocking
                Task.Run(async () =>
                {
                    try
                    {
                        await connectionManager.StartAsync();
                    }
                    catch (Exception ex)
                    {
                        SynchronizationContext.Current?.Post(_ => 
                        {
                            MessageBox.Show($"Connection failed: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        }, null);
                    }
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize connection: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void OnConnectionStateChanged(object? sender, ConnectionState state)
        {
            // Use SynchronizationContext for thread-safe UI updates
            SynchronizationContext.Current?.Post(_ => UpdateConnectionState(state), null);
        }

        private void UpdateConnectionState(ConnectionState state)
        {
            isConnected = state == ConnectionState.Connected;
            
            // Only update UI if not in background mode
            if (trayIcon != null)
            {
                switch (state)
                {
                    case ConnectionState.Connected:
                        trayIcon.Icon = SystemIcons.Shield;
                        trayIcon.Text = "Clipboard Sync - Connected";
                        break;
                    case ConnectionState.Connecting:
                        trayIcon.Icon = SystemIcons.Warning;
                        trayIcon.Text = "Clipboard Sync - Connecting...";
                        break;
                    case ConnectionState.Disconnected:
                        trayIcon.Icon = SystemIcons.Error;
                        trayIcon.Text = "Clipboard Sync - Disconnected";
                        break;
                    case ConnectionState.HttpFallback:
                        trayIcon.Icon = SystemIcons.Information;
                        trayIcon.Text = "Clipboard Sync - HTTP Fallback";
                        break;
                    case ConnectionState.Error:
                        trayIcon.Icon = SystemIcons.Error;
                        trayIcon.Text = "Clipboard Sync - Error";
                        break;
                }

                UpdateMenuItems();
            }
            
            // Always update menu items to reflect current status
            UpdateMenuItems();
            
            // No notifications in background mode - completely silent
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
            catch (Exception ex)
            {
                // Silent error handling - no notifications in background mode
            }
        }

        private void TrayIcon_DoubleClick(object? sender, EventArgs e)
        {
            if (isConnected)
            {
                Disconnect_Click(sender, e);
            }
            else
            {
                Connect_Click(sender, e);
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
                    MessageBox.Show($"Failed to connect: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
                    MessageBox.Show($"Failed to disconnect: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }

        private void Settings_Click(object? sender, EventArgs e)
        {
            var settingsDialog = new SettingsDialog(configManager);
            if (settingsDialog.ShowDialog() == DialogResult.OK)
            {
                // Restart connection with new settings
                connectionManager?.Dispose();
                InitializeConnection();
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
                catch (Exception ex)
                {
                    // Silent error handling
                }
            }
        }

        private void Exit_Click(object? sender, EventArgs e)
        {
            Application.Exit();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                connectionManager?.Dispose();
                trayIcon?.Dispose();
                trayMenu?.Dispose();
                notificationManager?.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}