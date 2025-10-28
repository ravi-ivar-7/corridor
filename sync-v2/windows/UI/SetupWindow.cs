using System;
using System.Drawing;
using System.Windows.Forms;
using ClipboardSyncClient.Core;

namespace ClipboardSyncClient.UI
{
    public partial class SetupWindow : Form
    {
        private TextBox tokenTextBox;
        private TextBox wsUrlTextBox;
        private TextBox httpUrlTextBox;
            private CheckBox backgroundModeCheckBox;
        private CheckBox autoStartCheckBox;
        private Button saveButton;
        private Button cancelButton;
        private Label statusLabel;

        private readonly ConfigManager configManager;

        public SetupWindow(ConfigManager? configManager = null)
        {
            this.configManager = configManager ?? new ConfigManager();
            InitializeComponent();
            LoadExistingConfig();
        }

        private void InitializeComponent()
        {
            this.Text = "Clipboard Sync - Setup";
            this.Size = new Size(500, 400);
            this.StartPosition = FormStartPosition.CenterScreen;
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
                Size = new Size(300, 23),
                Text = "" // Will be set by LoadExistingConfig()
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
                Size = new Size(300, 23),
                Text = "" // Will be set by LoadExistingConfig()
            };
            this.Controls.Add(httpUrlTextBox);

            // Background Mode
            backgroundModeCheckBox = new CheckBox
            {
                Text = "Run in Background (No Tray Icon)",
                Location = new Point(20, 140),
                Size = new Size(250, 23),
                Checked = false
            };
            this.Controls.Add(backgroundModeCheckBox);

            // Auto Start
            autoStartCheckBox = new CheckBox
            {
                Text = "Start with Windows",
                Location = new Point(20, 170),
                Size = new Size(200, 23)
            };
            this.Controls.Add(autoStartCheckBox);

            // Status Label
            statusLabel = new Label
            {
                Text = "",
                Location = new Point(20, 210),
                Size = new Size(400, 23),
                ForeColor = Color.Blue
            };
            this.Controls.Add(statusLabel);

            // Buttons
            saveButton = new Button
            {
                Text = "Save & Connect",
                Location = new Point(200, 250),
                Size = new Size(100, 30)
            };
            saveButton.Click += SaveButton_Click;
            this.Controls.Add(saveButton);

            cancelButton = new Button
            {
                Text = "Cancel",
                Location = new Point(320, 250),
                Size = new Size(80, 30)
            };
            cancelButton.Click += CancelButton_Click;
            this.Controls.Add(cancelButton);

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

        private void CancelButton_Click(object? sender, EventArgs e)
        {
            Application.Exit();
        }
    }
}
