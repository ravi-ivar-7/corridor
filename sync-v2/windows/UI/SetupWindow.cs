#nullable enable
using System;
using System.Diagnostics;
using System.Drawing;
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
        private CheckBox backgroundModeCheckBox = null!;
        private CheckBox autoStartCheckBox = null!;
        private Button saveButton = null!;
        private Button cancelButton = null!;
        private Button testConnectionButton = null!;
        private Button editAboutButton = null!;
        private Label statusLabel = null!;

        private readonly ConfigManager configManager;
        private readonly string baseUrl = "https://clipboard-sync-worker.ravi404606.workers.dev";

        public SetupWindow(ConfigManager? configManager = null)
        {
            this.configManager = configManager ?? new ConfigManager();
            InitializeComponent();
            LoadExistingConfig();
        }

        private void InitializeComponent()
        {
                this.Text = $"{configManager.LoadConfig().AppName} - Setup";
            this.Size = new Size(580, 480);
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
                Size = new Size(300, 23),
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
                Size = new Size(300, 23),
                PlaceholderText = "Enter your clipboard sync token"
            };
            this.Controls.Add(tokenTextBox);

            var tokenRequiredLabel = new Label
            {
                Text = "Required",
                Location = new Point(450, 63),
                Size = new Size(50, 15),
                ForeColor = Color.Red
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
                Size = new Size(300, 23)
            };
            this.Controls.Add(wsUrlTextBox);

            var wsClearButton = new Button
            {
                Text = "Clear",
                Location = new Point(450, 100),
                Size = new Size(50, 23),
                FlatStyle = FlatStyle.Standard
            };
            wsClearButton.Click += (s, e) => wsUrlTextBox.Clear();
            this.Controls.Add(wsClearButton);

            var wsResetButton = new Button
            {
                Text = "Default",
                Location = new Point(510, 100),
                Size = new Size(50, 23),
                FlatStyle = FlatStyle.Standard
            };
            wsResetButton.Click += (s, e) => wsUrlTextBox.Text = "wss://clipboard-sync-worker.ravi404606.workers.dev/ws";
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
                Size = new Size(300, 23)
            };
            this.Controls.Add(httpUrlTextBox);

            var httpClearButton = new Button
            {
                Text = "Clear",
                Location = new Point(450, 140),
                Size = new Size(50, 23),
                FlatStyle = FlatStyle.Standard
            };
            httpClearButton.Click += (s, e) => httpUrlTextBox.Clear();
            this.Controls.Add(httpClearButton);

            var httpResetButton = new Button
            {
                Text = "Default",
                Location = new Point(510, 140),
                Size = new Size(50, 23),
                FlatStyle = FlatStyle.Standard
            };
            httpResetButton.Click += (s, e) => httpUrlTextBox.Text = "https://clipboard-sync-worker.ravi404606.workers.dev/api";
            this.Controls.Add(httpResetButton);

            // Test Connection Button
            testConnectionButton = new Button
            {
                Text = "Test Connection",
                Location = new Point(130, 180),
                Size = new Size(120, 30),
                FlatStyle = FlatStyle.Standard
            };
            testConnectionButton.Click += TestConnection_Click;
            this.Controls.Add(testConnectionButton);

            // Background Mode
            backgroundModeCheckBox = new CheckBox
            {
                Text = "Run in Background (No Disturbance, No Tray Icon, Silent Mode)",
                Location = new Point(20, 230),
                Size = new Size(400, 23)
            };
            this.Controls.Add(backgroundModeCheckBox);

            // Auto Start
            autoStartCheckBox = new CheckBox
            {
                Text = "Start with Windows (Launch automatically on system startup)",
                Location = new Point(20, 260),
                Size = new Size(350, 23)
            };
            this.Controls.Add(autoStartCheckBox);

            // Status Label
            statusLabel = new Label
            {
                Text = "",
                Location = new Point(20, 300),
                Size = new Size(400, 23),
                ForeColor = Color.Red
            };
            this.Controls.Add(statusLabel);

            // Cancel Button (left side)
            cancelButton = new Button
            {
                Text = "Cancel",
                Location = new Point(360, 340),
                Size = new Size(80, 30),
                FlatStyle = FlatStyle.Standard
            };
            cancelButton.Click += CancelButton_Click;
            this.Controls.Add(cancelButton);

            // Save Button (right side)
            saveButton = new Button
            {
                Text = "Save and Start",
                Location = new Point(460, 340),
                Size = new Size(100, 30),
                FlatStyle = FlatStyle.Standard
            };
            saveButton.Click += SaveButton_Click;
            this.Controls.Add(saveButton);

            // Help buttons
            var howToSetupButton = new Button
            {
                Text = "How to Setup",
                Location = new Point(20, 390),
                Size = new Size(90, 25)
            };
            howToSetupButton.Click += HowToSetup_Click;
            this.Controls.Add(howToSetupButton);

            var howToGetTokenButton = new Button
            {
                Text = "How to Get Token",
                Location = new Point(120, 390),
                Size = new Size(110, 25)
            };
            howToGetTokenButton.Click += HowToGetToken_Click;
            this.Controls.Add(howToGetTokenButton);

            var faqButton = new Button
            {
                Text = "FAQs",
                Location = new Point(240, 390),
                Size = new Size(60, 25)
            };
            faqButton.Click += FAQ_Click;
            this.Controls.Add(faqButton);

            // Edit About Button (moved to same row as help buttons)
            editAboutButton = new Button
            {
                Text = "Edit About",
                Location = new Point(310, 390),
                Size = new Size(80, 25),
                FlatStyle = FlatStyle.Standard
            };
            editAboutButton.Click += EditAbout_Click;
            this.Controls.Add(editAboutButton);

            // Set Cancel button only (no Accept button to prevent X button from triggering save)
            this.CancelButton = cancelButton;
            
            // Handle form closing to ensure X button behaves like Cancel
            this.FormClosing += (s, e) => {
                if (e.CloseReason == CloseReason.UserClosing)
                {
                    // User clicked X button - exit application like Cancel button
                    // But don't exit if this is being closed by Save and Start
                    if (this.DialogResult != DialogResult.OK)
                    {
                        Application.Exit();
                    }
                }
            };
        }

        private void LoadExistingConfig()
        {
            var config = configManager.LoadConfig();
            
            // Set values from config, or use defaults if empty
            appNameTextBox.Text = string.IsNullOrWhiteSpace(config.AppName) ? "Corridor" : config.AppName;
            tokenTextBox.Text = string.IsNullOrWhiteSpace(config.Token) ? "" : config.Token;
            wsUrlTextBox.Text = string.IsNullOrWhiteSpace(config.WebSocketUrl) ? "wss://clipboard-sync-worker.ravi404606.workers.dev/ws" : config.WebSocketUrl;
            httpUrlTextBox.Text = string.IsNullOrWhiteSpace(config.HttpUrl) ? "https://clipboard-sync-worker.ravi404606.workers.dev/api" : config.HttpUrl;
            backgroundModeCheckBox.Checked = config.RunInBackground;
            autoStartCheckBox.Checked = config.AutoStart;
        }

        private void SaveButton_Click(object? sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(tokenTextBox.Text))
            {
                MessageBox.Show("Please enter a token.", "Validation Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            try
            {
                // Load existing config to preserve AboutText
                var existingConfig = configManager.LoadConfig();
                var config = new AppConfig
                {
                    AppName = string.IsNullOrWhiteSpace(appNameTextBox.Text) ? "Corridor" : appNameTextBox.Text.Trim(),
                    AboutText = existingConfig.AboutText, // Preserve existing AboutText
                    Token = tokenTextBox.Text.Trim(),
                    WebSocketUrl = wsUrlTextBox.Text.Trim(),
                    HttpUrl = httpUrlTextBox.Text.Trim(),
                    RunInBackground = backgroundModeCheckBox.Checked,
                    AutoStart = autoStartCheckBox.Checked
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
                MessageBox.Show($"Failed to save configuration: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
                    MessageBox.Show($"Failed to open setup guide: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
                    MessageBox.Show($"Failed to open token guide: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
                    MessageBox.Show($"Failed to open FAQs: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
    }
}
