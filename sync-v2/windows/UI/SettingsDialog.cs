using System;
using System.Drawing;
using System.Windows.Forms;
using ClipboardSyncClient.Core;
using ClipboardSyncClient.Network;

namespace ClipboardSyncClient.UI
{
    public partial class SettingsDialog : Form
    {
        private TextBox tokenTextBox;
        private TextBox wsUrlTextBox;
        private TextBox httpUrlTextBox;
        private CheckBox notificationsCheckBox;
        private CheckBox autoStartCheckBox;
        private Button saveButton;
        private Button cancelButton;
        private Button testConnectionButton;

        private readonly ConfigManager configManager;

        public SettingsDialog(ConfigManager configManager)
        {
            this.configManager = configManager;
            InitializeComponent();
            LoadConfig();
        }

        private void InitializeComponent()
        {
            this.Text = "Clipboard Sync - Settings";
            this.Size = new Size(500, 450);
            this.StartPosition = FormStartPosition.CenterParent;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;

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

            // Test Connection Button
            testConnectionButton = new Button
            {
                Text = "Test Connection",
                Location = new Point(130, 140),
                Size = new Size(120, 30)
            };
            testConnectionButton.Click += TestConnection_Click;
            this.Controls.Add(testConnectionButton);

            // Notifications
            notificationsCheckBox = new CheckBox
            {
                Text = "Run in Background (No Tray Icon)",
                Location = new Point(20, 190),
                Size = new Size(200, 23)
            };
            this.Controls.Add(notificationsCheckBox);

            // Auto Start
            autoStartCheckBox = new CheckBox
            {
                Text = "Start with Windows",
                Location = new Point(20, 220),
                Size = new Size(200, 23)
            };
            this.Controls.Add(autoStartCheckBox);

            // Buttons
            saveButton = new Button
            {
                Text = "Save",
                Location = new Point(200, 280),
                Size = new Size(80, 30)
            };
            saveButton.Click += SaveButton_Click;
            this.Controls.Add(saveButton);

            cancelButton = new Button
            {
                Text = "Cancel",
                Location = new Point(300, 280),
                Size = new Size(80, 30)
            };
            cancelButton.Click += CancelButton_Click;
            this.Controls.Add(cancelButton);

            // Set Accept and Cancel buttons
            this.AcceptButton = saveButton;
            this.CancelButton = cancelButton;
        }

        private void LoadConfig()
        {
            var config = configManager.LoadConfig();
            tokenTextBox.Text = config.Token;
            wsUrlTextBox.Text = config.WebSocketUrl;
            httpUrlTextBox.Text = config.HttpUrl;
            notificationsCheckBox.Checked = config.RunInBackground;
            autoStartCheckBox.Checked = config.AutoStart;
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
                var httpClient = new ClipboardHttpClient(httpUrlTextBox.Text.Trim());
                string? result = await httpClient.GetClipboardAsync(tokenTextBox.Text.Trim());
                
                if (result != null)
                {
                    MessageBox.Show("Connection test successful!", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                else
                {
                    MessageBox.Show("Connection test failed. Please check your token and URLs.", "Test Failed", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Connection test failed: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                testConnectionButton.Enabled = true;
                testConnectionButton.Text = "Test Connection";
            }
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
                    RunInBackground = notificationsCheckBox.Checked,
                    AutoStart = autoStartCheckBox.Checked
                };

                configManager.SaveConfig(config);
                configManager.SetAutoStart(config.AutoStart);

                MessageBox.Show("Settings saved successfully!", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
                this.DialogResult = DialogResult.OK;
                this.Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to save settings: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void CancelButton_Click(object? sender, EventArgs e)
        {
            this.DialogResult = DialogResult.Cancel;
            this.Close();
        }
    }
}
