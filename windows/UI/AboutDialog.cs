#nullable enable
using System;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;
using ClipboardSyncClient.Core;

namespace ClipboardSyncClient.UI
{
    public partial class AboutDialog : Form
    {
        private readonly string appName;
        private readonly string aboutText;

        public AboutDialog()
        {
            // Load config to get current values
            var configManager = new ClipboardSyncClient.Core.ConfigManager();
            var config = configManager.LoadConfig();
            this.appName = config.AppName;
            this.aboutText = config.AboutText;
            InitializeComponent();
        }

        public AboutDialog(string appName, string aboutText)
        {
            this.appName = appName;
            this.aboutText = aboutText;
            InitializeComponent();
        }

        private void InitializeComponent()
        {
                this.Text = $"About {appName}";
            this.Size = new Size(500, 350);
            this.StartPosition = FormStartPosition.CenterParent;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;

            var titleLabel = new Label
            {
                    Text = appName,
                Font = new Font("Segoe UI", 16, FontStyle.Bold),
                Location = new Point(20, 20),
                Size = new Size(200, 30),
                ForeColor = Color.DarkBlue
            };
            this.Controls.Add(titleLabel);

            var versionLabel = new Label
            {
                Text = "Version 1.0.0",
                Location = new Point(20, 60),
                Size = new Size(200, 23)
            };
            this.Controls.Add(versionLabel);

            var descriptionLabel = new Label
            {
                    Text = aboutText,
                Location = new Point(20, 100),
                Size = new Size(450, 140),
                AutoSize = false
            };
            this.Controls.Add(descriptionLabel);

            // Action buttons
            var websiteButton = new Button
            {
                Text = "Website",
                Location = new Point(20, 260),
                Size = new Size(80, 30),
                FlatStyle = FlatStyle.Standard
            };
            websiteButton.Click += WebsiteButton_Click;
            this.Controls.Add(websiteButton);

            var githubButton = new Button
            {
                Text = "GitHub",
                Location = new Point(110, 260),
                Size = new Size(80, 30),
                FlatStyle = FlatStyle.Standard
            };
            githubButton.Click += GitHubButton_Click;
            this.Controls.Add(githubButton);

            var helpButton = new Button
            {
                Text = "Help",
                Location = new Point(200, 260),
                Size = new Size(80, 30),
                FlatStyle = FlatStyle.Standard
            };
            helpButton.Click += HelpButton_Click;
            this.Controls.Add(helpButton);

            var okButton = new Button
            {
                Text = "OK",
                Location = new Point(300, 260),
                Size = new Size(80, 30),
                FlatStyle = FlatStyle.Standard
            };
            okButton.Click += (s, e) => this.Close();
            this.Controls.Add(okButton);

            this.AcceptButton = okButton;
        }

        private void WebsiteButton_Click(object? sender, EventArgs e)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "https://corridor.rknain.com",
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to open website: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void GitHubButton_Click(object? sender, EventArgs e)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "https://github.com/ravi-ivar-7/corridor",
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to open GitHub: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void HelpButton_Click(object? sender, EventArgs e)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "https://corridor.rknain.com/resources",
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to open help: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
