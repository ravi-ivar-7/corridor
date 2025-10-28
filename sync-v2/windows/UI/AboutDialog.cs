using System;
using System.Drawing;
using System.Windows.Forms;

namespace ClipboardSyncClient.UI
{
    public partial class AboutDialog : Form
    {
        public AboutDialog()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.Text = "About Clipboard Sync";
            this.Size = new Size(400, 300);
            this.StartPosition = FormStartPosition.CenterParent;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;

            var titleLabel = new Label
            {
                Text = "Clipboard Sync",
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
                Text = "Real-time clipboard synchronization across devices using WebSockets.\n\n" +
                       "Features:\n" +
                       "• Real-time sync\n" +
                       "• Auto-reconnect\n" +
                       "• HTTP fallback\n" +
                       "• System tray integration\n" +
                       "• Toast notifications",
                Location = new Point(20, 100),
                Size = new Size(350, 120),
                AutoSize = false
            };
            this.Controls.Add(descriptionLabel);

            var okButton = new Button
            {
                Text = "OK",
                Location = new Point(150, 240),
                Size = new Size(80, 30)
            };
            okButton.Click += (s, e) => this.Close();
            this.Controls.Add(okButton);

            this.AcceptButton = okButton;
        }
    }
}
