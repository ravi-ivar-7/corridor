#nullable enable
using System;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Threading;
using System.Windows.Forms;
using ClipboardSyncClient.Core;
using ClipboardSyncClient.Network;

namespace ClipboardSyncClient.UI
{
    public partial class SetupWindow : Form
    {
        private TextBox appNameTextBox = null!;
        private TextBox tokenTextBox = null!;
        private TextBox wsUrlTextBox = null!;
        private TextBox httpUrlTextBox = null!;
        private RadioButton interactiveModeRadio = null!;
        private RadioButton silentModeRadio = null!;
        private RadioButton autoStartEnabledRadio = null!;
        private RadioButton autoStartDisabledRadio = null!;
        private Button saveButton = null!;
        private Button cancelButton = null!;
        private Button testConnectionButton = null!;
        private Button editAboutButton = null!;
        private TextBox openHotkeyTextBox = null!;
        private Label statusLabel = null!;

        private readonly ConfigManager configManager;
        private readonly string baseUrl = "https://corridor-worker.corridor-sync.workers.dev";

        public SetupWindow(ConfigManager? configManager = null)
        {
            this.configManager = configManager ?? new ConfigManager();
            InitializeComponent();
            LoadExistingConfig();
        }

        private void InitializeComponent()
        {
                this.Text = $"{configManager.LoadConfig().AppName} - Setup";
            this.Size = new Size(700, 700);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.ShowInTaskbar = true;

            // App Name
            var appNameLabel = new Label
            {
                Text = "App Name:",
                Location = new Point(20, 20),
                Size = new Size(100, 23)
            };
            this.Controls.Add(appNameLabel);

            appNameTextBox = new TextBox
            {
                Location = new Point(130, 20),
                Size = new Size(520, 23),
                PlaceholderText = "Enter your app name (appears in tray, task manager, etc.)"
            };
            this.Controls.Add(appNameTextBox);

            // Token
            var tokenLabel = new Label
            {
                Text = "Token:",
                Location = new Point(20, 60),
                Size = new Size(100, 23)
            };
            this.Controls.Add(tokenLabel);

            tokenTextBox = new TextBox
            {
                Location = new Point(130, 60),
                Size = new Size(455, 23),
                PlaceholderText = "Enter your clipboard sync token"
            };
            this.Controls.Add(tokenTextBox);

            var tokenRequiredLabel = new Label
            {
                Text = "* Required",
                Location = new Point(595, 63),
                Size = new Size(80, 20),
                ForeColor = Color.Red,
                Font = new Font("Segoe UI", 8, FontStyle.Bold)
            };
            this.Controls.Add(tokenRequiredLabel);

            // WebSocket URL
            var wsUrlLabel = new Label
            {
                Text = "WebSocket URL:",
                Location = new Point(20, 100),
                Size = new Size(100, 23)
            };
            this.Controls.Add(wsUrlLabel);

            wsUrlTextBox = new TextBox
            {
                Location = new Point(130, 100),
                Size = new Size(395, 23)
            };
            this.Controls.Add(wsUrlTextBox);

            var wsClearButton = new Button
            {
                Text = "Clear",
                Location = new Point(535, 99),
                Size = new Size(60, 28),
                FlatStyle = FlatStyle.Standard
            };
            wsClearButton.Click += (s, e) => wsUrlTextBox.Clear();
            this.Controls.Add(wsClearButton);

            var wsResetButton = new Button
            {
                Text = "Default",
                Location = new Point(605, 99),
                Size = new Size(65, 25),
                FlatStyle = FlatStyle.Standard
            };
            wsResetButton.Click += (s, e) => wsUrlTextBox.Text = "wss://corridor-worker.corridor-sync.workers.dev/ws";
            this.Controls.Add(wsResetButton);

            // HTTP URL
            var httpUrlLabel = new Label
            {
                Text = "HTTP URL:",
                Location = new Point(20, 140),
                Size = new Size(100, 23)
            };
            this.Controls.Add(httpUrlLabel);

            httpUrlTextBox = new TextBox
            {
                Location = new Point(130, 140),
                Size = new Size(395, 23)
            };
            this.Controls.Add(httpUrlTextBox);

            var httpClearButton = new Button
            {
                Text = "Clear",
                Location = new Point(535, 139),
                Size = new Size(60, 28),
                FlatStyle = FlatStyle.Standard
            };
            httpClearButton.Click += (s, e) => httpUrlTextBox.Clear();
            this.Controls.Add(httpClearButton);

            var httpResetButton = new Button
            {
                Text = "Default",
                Location = new Point(605, 139),
                Size = new Size(65, 28),
                FlatStyle = FlatStyle.Standard
            };
            httpResetButton.Click += (s, e) => httpUrlTextBox.Text = "https://corridor-worker.corridor-sync.workers.dev/api";
            this.Controls.Add(httpResetButton);

            // Test Connection Button
            testConnectionButton = new Button
            {
                Text = "Test Connection",
                Location = new Point(130, 180),
                Size = new Size(130, 32),
                FlatStyle = FlatStyle.Standard,
                Font = new Font("Segoe UI", 9)
            };
            testConnectionButton.Click += TestConnection_Click;
            this.Controls.Add(testConnectionButton);

            // Mode Section
            var modeGroupBox = new GroupBox
            {
                Text = "Mode:",
                Location = new Point(20, 230),
                Size = new Size(640, 80),
                Font = new Font("Segoe UI", 9, FontStyle.Bold)
            };
            this.Controls.Add(modeGroupBox);

            // Interactive Mode Radio
            interactiveModeRadio = new RadioButton
            {
                Text = "Interactive Mode (Shows tray icon, notifications, interactive)",
                Location = new Point(20, 25),
                Size = new Size(600, 25),
                Checked = true,
                Font = new Font("Segoe UI", 9)
            };
            modeGroupBox.Controls.Add(interactiveModeRadio);

            // Silent Mode Radio
            silentModeRadio = new RadioButton
            {
                Text = "Silent Mode (Completely silent, no tray icon, no disturbance)",
                Location = new Point(20, 50),
                Size = new Size(600, 25),
                Font = new Font("Segoe UI", 9)
            };
            modeGroupBox.Controls.Add(silentModeRadio);

            // AutoStart Section
            var autoStartGroupBox = new GroupBox
            {
                Text = "AutoStart:",
                Location = new Point(20, 320),
                Size = new Size(640, 80),
                Font = new Font("Segoe UI", 9, FontStyle.Bold)
            };
            this.Controls.Add(autoStartGroupBox);

            // AutoStart Enabled Radio
            autoStartEnabledRadio = new RadioButton
            {
                Text = "Enabled (Launch on boot, wake from sleep, and user login)",
                Location = new Point(20, 25),
                Size = new Size(600, 25),
                Checked = false,
                Font = new Font("Segoe UI", 9)
            };
            autoStartGroupBox.Controls.Add(autoStartEnabledRadio);

            // AutoStart Disabled Radio
            autoStartDisabledRadio = new RadioButton
            {
                Text = "Disabled (Manual launch only)",
                Location = new Point(20, 50),
                Size = new Size(600, 25),
                Checked = true,
                Font = new Font("Segoe UI", 9)
            };
            autoStartGroupBox.Controls.Add(autoStartDisabledRadio);

            // Hotkey Configuration
            var hotkeyLabel = new Label
            {
                Text = "Hotkey to Open App:",
                Location = new Point(20, 420),
                Size = new Size(150, 25),
                Font = new Font("Segoe UI", 9, FontStyle.Bold)
            };
            this.Controls.Add(hotkeyLabel);

            openHotkeyTextBox = new TextBox
            {
                Location = new Point(180, 420),
                Size = new Size(160, 25),
                PlaceholderText = "Ctrl+Alt+O",
                Font = new Font("Segoe UI", 9)
            };
            this.Controls.Add(openHotkeyTextBox);

            var testHotkeyButton = new Button
            {
                Text = "Suggestions",
                Location = new Point(350, 419),
                Size = new Size(100, 28),
                FlatStyle = FlatStyle.Standard,
                Font = new Font("Segoe UI", 9)
            };
            testHotkeyButton.Click += TestHotkey_Click;
            this.Controls.Add(testHotkeyButton);

            var hotkeyInfoLabel = new Label
            {
                Text = "Use this hotkey to quickly open the app window when it's running in silent mode",
                Location = new Point(20, 453),
                Size = new Size(650, 35),
                Font = new Font("Segoe UI", 8),
                ForeColor = Color.Gray
            };
            this.Controls.Add(hotkeyInfoLabel);

            // Status Label
            statusLabel = new Label
            {
                Text = "",
                Location = new Point(20, 500),
                Size = new Size(650, 45),
                ForeColor = Color.Red,
                Font = new Font("Segoe UI", 9)
            };
            this.Controls.Add(statusLabel);

            // Cancel Button (right-aligned)
            cancelButton = new Button
            {
                Text = "Cancel / Stop",
                Location = new Point(435, 560),
                Size = new Size(110, 40),
                FlatStyle = FlatStyle.Standard,
                Font = new Font("Segoe UI", 9)
            };
            cancelButton.Click += CancelButton_Click;
            this.Controls.Add(cancelButton);

            // Save Button (right-aligned)
            saveButton = new Button
            {
                Text = "Save and Start",
                Location = new Point(555, 560),
                Size = new Size(120, 40),
                FlatStyle = FlatStyle.Standard,
                Font = new Font("Segoe UI", 9, FontStyle.Bold)
            };
            saveButton.Click += SaveButton_Click;
            this.Controls.Add(saveButton);

            // Help buttons
            var howToSetupButton = new Button
            {
                Text = "How to Setup",
                Location = new Point(20, 615),
                Size = new Size(105, 32),
                Font = new Font("Segoe UI", 9)
            };
            howToSetupButton.Click += HowToSetup_Click;
            this.Controls.Add(howToSetupButton);

            var howToGetTokenButton = new Button
            {
                Text = "How to Get Token",
                Location = new Point(135, 615),
                Size = new Size(125, 32),
                Font = new Font("Segoe UI", 9)
            };
            howToGetTokenButton.Click += HowToGetToken_Click;
            this.Controls.Add(howToGetTokenButton);

            var faqButton = new Button
            {
                Text = "FAQs",
                Location = new Point(270, 615),
                Size = new Size(70, 32),
                Font = new Font("Segoe UI", 9)
            };
            faqButton.Click += FAQ_Click;
            this.Controls.Add(faqButton);

            // Edit About Button (moved to same row as help buttons)
            editAboutButton = new Button
            {
                Text = "Edit About",
                Location = new Point(350, 615),
                Size = new Size(95, 32),
                FlatStyle = FlatStyle.Standard,
                Font = new Font("Segoe UI", 9)
            };
            editAboutButton.Click += EditAbout_Click;
            this.Controls.Add(editAboutButton);

            // Set Cancel button only (no Accept button to prevent X button from triggering save)
            this.CancelButton = cancelButton;
            
            // Handle form closing - X button just closes dialog without any action
            this.FormClosing += (s, e) => {
                if (e.CloseReason == CloseReason.UserClosing)
                {
                    // User clicked X button - just close the dialog
                    // Don't exit application, just close the setup window
                    e.Cancel = false; // Allow the dialog to close
                }
            };
        }

        private void LoadExistingConfig()
        {
            var config = configManager.LoadConfig();

            // Set values from config, or use defaults if empty
            appNameTextBox.Text = string.IsNullOrWhiteSpace(config.AppName) ? "Corridor" : config.AppName;
            tokenTextBox.Text = string.IsNullOrWhiteSpace(config.Token) ? "" : config.Token;
            wsUrlTextBox.Text = string.IsNullOrWhiteSpace(config.WebSocketUrl) ? "wss://corridor-worker.corridor-sync.workers.dev/ws" : config.WebSocketUrl;
            httpUrlTextBox.Text = string.IsNullOrWhiteSpace(config.HttpUrl) ? "https://corridor-worker.corridor-sync.workers.dev/api" : config.HttpUrl;

            // Set mode radio buttons
            if (config.Mode == AppMode.Silent)
            {
                silentModeRadio.Checked = true;
            }
            else
            {
                interactiveModeRadio.Checked = true;
            }

            if (config.AutoStart)
            {
                autoStartEnabledRadio.Checked = true;
            }
            else
            {
                autoStartDisabledRadio.Checked = true;
            }

            openHotkeyTextBox.Text = string.IsNullOrWhiteSpace(config.OpenHotkey) ? "Ctrl+Alt+O" : config.OpenHotkey;
        }

        private void SaveButton_Click(object? sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(tokenTextBox.Text))
            {
                MessageBox.Show("Please enter a token.", "Validation Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            // Validate hotkey
            string openHotkey = string.IsNullOrWhiteSpace(openHotkeyTextBox.Text) ? "Ctrl+Alt+O" : openHotkeyTextBox.Text.Trim();

            if (!HotkeyManager.IsValidHotkey(openHotkey))
            {
                MessageBox.Show($"Invalid hotkey format: {openHotkey}\n\nPlease use format like: Ctrl+Alt+O, Ctrl+Shift+K, etc.", "Invalid Hotkey", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            try
            {
                // Load existing config to preserve AboutText
                var existingConfig = configManager.LoadConfig();

                // Determine selected mode
                AppMode selectedMode = silentModeRadio.Checked ? AppMode.Silent : AppMode.Interactive;

                var config = new AppConfig
                {
                    AppName = string.IsNullOrWhiteSpace(appNameTextBox.Text) ? "Corridor" : appNameTextBox.Text.Trim(),
                    AboutText = existingConfig.AboutText,
                    Token = tokenTextBox.Text.Trim(),
                    WebSocketUrl = wsUrlTextBox.Text.Trim(),
                    HttpUrl = httpUrlTextBox.Text.Trim(),
                    Mode = selectedMode,
                    AutoStart = autoStartEnabledRadio.Checked,
                    OpenHotkey = openHotkey,
                    CloseHotkey = ""
                };

                configManager.SaveConfig(config);
                configManager.SetAutoStart(config.AutoStart);

                statusLabel.Text = "Configuration saved successfully!";
                statusLabel.ForeColor = Color.Green;

                // Set DialogResult to indicate successful save
                this.DialogResult = DialogResult.OK;
                
                // Close this window - Program.cs will handle starting the main application
                this.Close();
            }
            catch (Exception ex)
            {
                ShowErrorDialog("Configuration Error", $"Failed to save configuration:\n\n{ex.Message}");
            }
        }

        private async void TestConnection_Click(object? sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(tokenTextBox.Text))
            {
                MessageBox.Show("Please enter a token first.", "Validation Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            testConnectionButton.Enabled = false;
            testConnectionButton.Text = "Testing...";

            try
            {
                // Test HTTP connection first
                var httpClient = new ClipboardHttpClient(httpUrlTextBox.Text.Trim());
                bool httpSuccess = await httpClient.SendClipboardAsync(tokenTextBox.Text.Trim(), "test_connection");
                
                if (httpSuccess)
                {
                    // Test WebSocket connection
                    var wsClient = new WebSocketClient();
                    string wsUrl = $"{wsUrlTextBox.Text.Trim()}?token={tokenTextBox.Text.Trim()}";
                    bool wsSuccess = await wsClient.ConnectAsync(wsUrl, CancellationToken.None);
                    wsClient.Dispose();
                    
                    if (wsSuccess)
                    {
                        statusLabel.Text = "Both HTTP and WebSocket connections successful!";
                        statusLabel.ForeColor = Color.Green;
                    }
                    else
                    {
                        statusLabel.Text = "HTTP connection successful, but WebSocket failed. App will use HTTP fallback.";
                        statusLabel.ForeColor = Color.Orange;
                    }
                }
                else
                {
                    statusLabel.Text = "Connection test failed. Please check your token and URLs.";
                    statusLabel.ForeColor = Color.Red;
                }
            }
            catch (Exception ex)
            {
                statusLabel.Text = $"Connection test failed: {ex.Message}";
                statusLabel.ForeColor = Color.Red;
            }
            finally
            {
                testConnectionButton.Enabled = true;
                testConnectionButton.Text = "Test Connection";
            }
        }

        private void CancelButton_Click(object? sender, EventArgs e)
        {
            Application.Exit();
        }

        private void TestHotkey_Click(object? sender, EventArgs e)
        {
            string openHotkey = string.IsNullOrWhiteSpace(openHotkeyTextBox.Text) ? "Ctrl+Alt+O" : openHotkeyTextBox.Text.Trim();

            var suggestions = HotkeyManager.GetSuggestedHotkeys();
            var availableHotkeys = suggestions.Where(h => !h.Equals(openHotkey, StringComparison.OrdinalIgnoreCase)).ToList();

            var dialog = new Form
            {
                Text = "Hotkey Suggestions",
                Size = new Size(450, 360),
                StartPosition = FormStartPosition.CenterParent,
                FormBorderStyle = FormBorderStyle.FixedDialog,
                MaximizeBox = false,
                MinimizeBox = false
            };

            var label = new Label
            {
                Text = "Available hotkey suggestions to avoid conflicts with system shortcuts:",
                Location = new Point(20, 20),
                Size = new Size(400, 40),
                Font = new Font("Segoe UI", 9, FontStyle.Bold)
            };
            dialog.Controls.Add(label);

            var listBox = new ListBox
            {
                Location = new Point(20, 70),
                Size = new Size(400, 200),
                Font = new Font("Consolas", 9)
            };
            listBox.Items.AddRange(availableHotkeys.ToArray());
            dialog.Controls.Add(listBox);

            var okButton = new Button
            {
                Text = "OK",
                Location = new Point(340, 280),
                Size = new Size(80, 30),
                FlatStyle = FlatStyle.Standard,
                DialogResult = DialogResult.OK
            };
            dialog.Controls.Add(okButton);

            dialog.AcceptButton = okButton;
            dialog.ShowDialog();
        }

        private void HowToSetup_Click(object? sender, EventArgs e)
        {
            var dialog = new Form
            {
                Text = "How to Setup",
                Size = new Size(500, 400),
                StartPosition = FormStartPosition.CenterParent,
                FormBorderStyle = FormBorderStyle.FixedDialog,
                MaximizeBox = false,
                MinimizeBox = false
            };

            var label = new Label
            {
                Text = "How to Setup Clipboard Sync:\n\n" +
                       "1. Get your token from the clipboard sync service\n" +
                       "2. Enter the token in the Token field\n" +
                       "3. Optionally configure WebSocket and HTTP URLs\n" +
                       "4. Choose your preferences (Background mode, Auto-start)\n" +
                       "5. Click 'Test Connection' to verify settings\n" +
                       "6. Click 'Save and Start' to start syncing\n\n" +
                       "The app will run in the system tray and sync your clipboard across devices.",
                Location = new Point(20, 20),
                Size = new Size(450, 280),
                Font = new Font("Segoe UI", 9)
            };
            dialog.Controls.Add(label);

            var openButton = new Button
            {
                Text = "More",
                Location = new Point(300, 320),
                Size = new Size(80, 30),
                DialogResult = DialogResult.OK
            };
            dialog.Controls.Add(openButton);

            var okButton = new Button
            {
                Text = "OK",
                Location = new Point(390, 320),
                Size = new Size(60, 30),
                DialogResult = DialogResult.Cancel
            };
            dialog.Controls.Add(okButton);

            var result = dialog.ShowDialog();

            if (result == DialogResult.OK)
            {
                try
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = $"{baseUrl}/blogs/how-to-setup",
                        UseShellExecute = true
                    });
                }
                catch (Exception ex)
                {
                    ShowErrorDialog("Failed to open setup guide", ex.Message);
                }
            }
        }

        private void HowToGetToken_Click(object? sender, EventArgs e)
        {
            var dialog = new Form
            {
                Text = "How to Get Token",
                Size = new Size(500, 350),
                StartPosition = FormStartPosition.CenterParent,
                FormBorderStyle = FormBorderStyle.FixedDialog,
                MaximizeBox = false,
                MinimizeBox = false
            };

            var label = new Label
            {
                Text = "How to Get Your Token:\n\n" +
                       "1. Visit the clipboard sync service website\n" +
                       "2. Sign up for an account or log in\n" +
                       "3. Go to your account settings or dashboard\n" +
                       "4. Look for 'API Token' or 'Access Token' section\n" +
                       "5. Copy the token and paste it here\n\n" +
                       "The token is required to authenticate your device with the sync service.",
                Location = new Point(20, 20),
                Size = new Size(450, 230),
                Font = new Font("Segoe UI", 9)
            };
            dialog.Controls.Add(label);

            var openButton = new Button
            {
                Text = "More",
                Location = new Point(300, 270),
                Size = new Size(80, 30),
                DialogResult = DialogResult.OK
            };
            dialog.Controls.Add(openButton);

            var okButton = new Button
            {
                Text = "OK",
                Location = new Point(390, 270),
                Size = new Size(60, 30),
                DialogResult = DialogResult.Cancel
            };
            dialog.Controls.Add(okButton);

            var result = dialog.ShowDialog();

            if (result == DialogResult.OK)
            {
                try
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = $"{baseUrl}/blogs/how-to-get-token",
                        UseShellExecute = true
                    });
                }
                catch (Exception ex)
                {
                    ShowErrorDialog("Failed to open token guide", ex.Message);
                }
            }
        }

        private void FAQ_Click(object? sender, EventArgs e)
        {
            var dialog = new Form
            {
                Text = "FAQs",
                Size = new Size(500, 400),
                StartPosition = FormStartPosition.CenterParent,
                FormBorderStyle = FormBorderStyle.FixedDialog,
                MaximizeBox = false,
                MinimizeBox = false
            };

            var label = new Label
            {
                Text = "Frequently Asked Questions:\n\n" +
                       "Q: What is clipboard sync?\n" +
                       "A: It syncs your clipboard content across all your devices in real-time.\n\n" +
                       "Q: Is my data secure?\n" +
                       "A: Yes, all data is encrypted and transmitted securely.\n\n" +
                       "Q: Can I use it without internet?\n" +
                       "A: No, internet connection is required for syncing.\n\n" +
                       "Q: What happens in background mode?\n" +
                       "A: The app runs silently without showing in the system tray.\n\n" +
                       "Q: How do I stop the app?\n" +
                       "A: Right-click the tray icon and select 'Exit' or use Task Manager.",
                Location = new Point(20, 20),
                Size = new Size(450, 280),
                Font = new Font("Segoe UI", 9)
            };
            dialog.Controls.Add(label);

            var openButton = new Button
            {
                Text = "More",
                Location = new Point(300, 320),
                Size = new Size(80, 30),
                DialogResult = DialogResult.OK
            };
            dialog.Controls.Add(openButton);

            var okButton = new Button
            {
                Text = "OK",
                Location = new Point(390, 320),
                Size = new Size(60, 30),
                DialogResult = DialogResult.Cancel
            };
            dialog.Controls.Add(okButton);

            var result = dialog.ShowDialog();

            if (result == DialogResult.OK)
            {
                try
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = $"{baseUrl}/blogs/faqs",
                        UseShellExecute = true
                    });
                }
                catch (Exception ex)
                {
                    ShowErrorDialog("Failed to open FAQs", ex.Message);
                }
            }
        }

        private void EditAbout_Click(object? sender, EventArgs e)
        {
            var config = configManager.LoadConfig();
            
            var dialog = new Form
            {
                Text = "Edit About Text",
                Size = new Size(620, 500),
                StartPosition = FormStartPosition.CenterParent,
                FormBorderStyle = FormBorderStyle.FixedDialog,
                MaximizeBox = false,
                MinimizeBox = false
            };

            var label = new Label
            {
                Text = "Customize the about text that appears in the About dialog:",
                Location = new Point(20, 20),
                Size = new Size(550, 23),
                Font = new Font("Segoe UI", 9, FontStyle.Bold)
            };
            dialog.Controls.Add(label);

            var textBox = new TextBox
            {
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                Location = new Point(20, 50),
                Size = new Size(540, 300),
                Text = config.AboutText,
                Font = new Font("Consolas", 9),
                AcceptsReturn = true, // Allow Enter key to create new lines
                AcceptsTab = true    // Allow Tab key for indentation
            };
            dialog.Controls.Add(textBox);

            // Template buttons
            var templateLabel = new Label
            {
                Text = "Templates:",
                Location = new Point(20, 360),
                Size = new Size(100, 23),
                Font = new Font("Segoe UI", 9, FontStyle.Bold)
            };
            dialog.Controls.Add(templateLabel);

            var template1Button = new Button
            {
                Text = "Default",
                Location = new Point(20, 385),
                Size = new Size(80, 25),
                FlatStyle = FlatStyle.Standard
            };
            template1Button.Click += (s, e) => textBox.Text = "Real-time clipboard synchronization across devices using WebSockets.\n\n" +
                                                              "Features:\n" +
                                                              "• Real-time sync\n" +
                                                              "• Auto-reconnect\n" +
                                                              "• HTTP fallback\n" +
                                                              "• System tray integration\n" +
                                                              "• Background mode\n" +
                                                              "• Auto-start with Windows";
            dialog.Controls.Add(template1Button);

            var template2Button = new Button
            {
                Text = "Security",
                Location = new Point(110, 385),
                Size = new Size(80, 25),
                FlatStyle = FlatStyle.Standard
            };
            template2Button.Click += (s, e) => textBox.Text = "Enterprise-grade security solution for secure data transmission.\n\n" +
                                                              "Security Features:\n" +
                                                              "• End-to-end encryption\n" +
                                                              "• Zero-knowledge architecture\n" +
                                                              "• Secure key exchange\n" +
                                                              "• Audit logging\n" +
                                                              "• Multi-factor authentication\n" +
                                                              "• Compliance ready";
            dialog.Controls.Add(template2Button);

            var template3Button = new Button
            {
                Text = "Minimalist",
                Location = new Point(200, 385),
                Size = new Size(80, 25),
                FlatStyle = FlatStyle.Standard
            };
            template3Button.Click += (s, e) => textBox.Text = "Minimalist design philosophy for a distraction-free experience.\n\n" +
                                                              "Principles:\n" +
                                                              "• Lightweight and efficient\n" +
                                                              "• Clean and modern UI\n" +
                                                              "• Zero unnecessary features\n" +
                                                              "• Fast startup and low memory use\n" +
                                                              "• Focused on pure functionality";
            dialog.Controls.Add(template3Button);

            var template4Button = new Button
            {
                Text = "Experimental",
                Location = new Point(290, 385),
                Size = new Size(90, 25),
                FlatStyle = FlatStyle.Standard
            };
            template4Button.Click += (s, e) => textBox.Text = "Experimental build with cutting-edge features.\n\n" +
                                                              "Included experiments:\n" +
                                                              "• Predictive clipboard AI\n" +
                                                              "• Local caching & delta updates\n" +
                                                              "• Multi-protocol communication (HTTP/WS/UDP)\n" +
                                                              "• Background sync scheduler\n" +
                                                              "• Adaptive performance tuning";
            dialog.Controls.Add(template4Button);

            var clearButton = new Button
            {
                Text = "Clear",
                Location = new Point(390, 385),
                Size = new Size(60, 25),
                FlatStyle = FlatStyle.Standard
            };
            clearButton.Click += (s, e) => textBox.Text = "";
            dialog.Controls.Add(clearButton);

            // Action buttons
            var cancelButton = new Button
            {
                Text = "Cancel",
                Location = new Point(420, 420),
                Size = new Size(80, 30),
                FlatStyle = FlatStyle.Standard,
                DialogResult = DialogResult.Cancel
            };
            dialog.Controls.Add(cancelButton);

            var saveButton = new Button
            {
                Text = "Save",
                Location = new Point(510, 420),
                Size = new Size(80, 30),
                FlatStyle = FlatStyle.Standard,
                DialogResult = DialogResult.OK
            };
            dialog.Controls.Add(saveButton);

            dialog.AcceptButton = saveButton;
            dialog.CancelButton = cancelButton;

            var result = dialog.ShowDialog();

            if (result == DialogResult.OK)
            {
                // Update the config with the new about text
                var updatedConfig = configManager.LoadConfig();
                updatedConfig.AboutText = textBox.Text.Trim();
                configManager.SaveConfig(updatedConfig);
                
                statusLabel.Text = "About text updated successfully!";
                statusLabel.ForeColor = Color.Green;
            }
        }

        private void ShowErrorDialog(string title, string message)
        {
            var errorDialog = new Form
            {
                Text = title,
                Size = new Size(600, 250),
                StartPosition = FormStartPosition.CenterParent,
                FormBorderStyle = FormBorderStyle.FixedDialog,
                MaximizeBox = false,
                MinimizeBox = false
            };

            var errorLabel = new Label
            {
                Text = message,
                Location = new Point(20, 20),
                Size = new Size(550, 140),
                Font = new Font("Segoe UI", 9),
                AutoSize = false
            };
            errorDialog.Controls.Add(errorLabel);

            var okButton = new Button
            {
                Text = "OK",
                Location = new Point(490, 170),
                Size = new Size(80, 30),
                DialogResult = DialogResult.OK
            };
            errorDialog.Controls.Add(okButton);
            errorDialog.AcceptButton = okButton;

            errorDialog.ShowDialog();
        }
    }
}
