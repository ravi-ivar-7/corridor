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
        private TextBox tokenTextBox = null!;
        private TextBox wsUrlTextBox = null!;
        private TextBox httpUrlTextBox = null!;
        private CheckBox backgroundModeCheckBox = null!;
        private CheckBox autoStartCheckBox = null!;
        private Button saveButton = null!;
        private Button cancelButton = null!;
        private Button testConnectionButton = null!;
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
            this.Text = "Clipboard Sync - Setup";
            this.Size = new Size(580, 440);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.ShowInTaskbar = true;
            // Token
            var tokenLabel = new Label
            {
                Text = "Token:",
                Location = new Point(20, 20),
                Size = new Size(100, 23)
            };
            this.Controls.Add(tokenLabel);

            tokenTextBox = new TextBox
            {
                Location = new Point(130, 20),
                Size = new Size(300, 23),
                PlaceholderText = "Enter your clipboard sync token"
            };
            this.Controls.Add(tokenTextBox);

            var tokenRequiredLabel = new Label
            {
                Text = "Required",
                Location = new Point(450, 23),
                Size = new Size(50, 15),
                ForeColor = Color.Red
            };
            this.Controls.Add(tokenRequiredLabel);

            // WebSocket URL
            var wsUrlLabel = new Label
            {
                Text = "WebSocket URL:",
                Location = new Point(20, 60),
                Size = new Size(100, 23)
            };
            this.Controls.Add(wsUrlLabel);

            wsUrlTextBox = new TextBox
            {
                Location = new Point(130, 60),
                Size = new Size(300, 23)
            };
            this.Controls.Add(wsUrlTextBox);

            var wsClearButton = new Button
            {
                Text = "Clear",
                Location = new Point(450, 60),
                Size = new Size(50, 23),
                FlatStyle = FlatStyle.Standard
            };
            wsClearButton.Click += (s, e) => wsUrlTextBox.Clear();
            this.Controls.Add(wsClearButton);

            var wsResetButton = new Button
            {
                Text = "Default",
                Location = new Point(510, 60),
                Size = new Size(50, 23),
                FlatStyle = FlatStyle.Standard
            };
            wsResetButton.Click += (s, e) => wsUrlTextBox.Text = "wss://clipboard-sync-worker.ravi404606.workers.dev/ws";
            this.Controls.Add(wsResetButton);

            // HTTP URL
            var httpUrlLabel = new Label
            {
                Text = "HTTP URL:",
                Location = new Point(20, 100),
                Size = new Size(100, 23)
            };
            this.Controls.Add(httpUrlLabel);

            httpUrlTextBox = new TextBox
            {
                Location = new Point(130, 100),
                Size = new Size(300, 23)
            };
            this.Controls.Add(httpUrlTextBox);

            var httpClearButton = new Button
            {
                Text = "Clear",
                Location = new Point(450, 100),
                Size = new Size(50, 23),
                FlatStyle = FlatStyle.Standard
            };
            httpClearButton.Click += (s, e) => httpUrlTextBox.Clear();
            this.Controls.Add(httpClearButton);

            var httpResetButton = new Button
            {
                Text = "Default",
                Location = new Point(510, 100),
                Size = new Size(50, 23),
                FlatStyle = FlatStyle.Standard
            };
            httpResetButton.Click += (s, e) => httpUrlTextBox.Text = "https://clipboard-sync-worker.ravi404606.workers.dev/api";
            this.Controls.Add(httpResetButton);

            // Test Connection Button
            testConnectionButton = new Button
            {
                Text = "Test Connection",
                Location = new Point(130, 140),
                Size = new Size(120, 30),
                FlatStyle = FlatStyle.Standard
            };
            testConnectionButton.Click += TestConnection_Click;
            this.Controls.Add(testConnectionButton);

            // Background Mode
            backgroundModeCheckBox = new CheckBox
            {
                Text = "Run in Background (No Disturbance, No Tray Icon, Silent Mode)",
                Location = new Point(20, 190),
                Size = new Size(400, 23)
            };
            this.Controls.Add(backgroundModeCheckBox);

            // Auto Start
            autoStartCheckBox = new CheckBox
            {
                Text = "Start with Windows (Launch automatically on system startup)",
                Location = new Point(20, 220),
                Size = new Size(350, 23)
            };
            this.Controls.Add(autoStartCheckBox);

            // Status Label
            statusLabel = new Label
            {
                Text = "",
                Location = new Point(20, 260),
                Size = new Size(400, 23),
                ForeColor = Color.Red
            };
            this.Controls.Add(statusLabel);

            // Cancel Button (left side)
            cancelButton = new Button
            {
                Text = "Cancel",
                Location = new Point(360, 300),
                Size = new Size(80, 30),
                FlatStyle = FlatStyle.Standard
            };
            cancelButton.Click += CancelButton_Click;
            this.Controls.Add(cancelButton);

            // Save Button (right side)
            saveButton = new Button
            {
                Text = "Save and Start",
                Location = new Point(460, 300),
                Size = new Size(100, 30),
                FlatStyle = FlatStyle.Standard
            };
            saveButton.Click += SaveButton_Click;
            this.Controls.Add(saveButton);

            // Help buttons
            var howToSetupButton = new Button
            {
                Text = "How to Setup",
                Location = new Point(20, 350),
                Size = new Size(90, 25)
            };
            howToSetupButton.Click += HowToSetup_Click;
            this.Controls.Add(howToSetupButton);

            var howToGetTokenButton = new Button
            {
                Text = "How to Get Token",
                Location = new Point(120, 350),
                Size = new Size(110, 25)
            };
            howToGetTokenButton.Click += HowToGetToken_Click;
            this.Controls.Add(howToGetTokenButton);

            var faqButton = new Button
            {
                Text = "FAQs",
                Location = new Point(240, 350),
                Size = new Size(60, 25)
            };
            faqButton.Click += FAQ_Click;
            this.Controls.Add(faqButton);

            // Set Accept and Cancel buttons
            this.AcceptButton = saveButton;
            this.CancelButton = cancelButton;
        }

        private void LoadExistingConfig()
        {
            var config = configManager.LoadConfig();
            
            // Set values from config, or use defaults if empty
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
                var config = new AppConfig
                {
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
    }
}
