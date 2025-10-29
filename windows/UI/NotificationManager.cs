using System;
using System.Drawing;
using System.Windows.Forms;

namespace ClipboardSyncClient.UI
{
    public class NotificationManager : IDisposable
    {
        private readonly bool enableNotifications;
        private bool disposed = false;

        public NotificationManager(bool enableNotifications = true)
        {
            this.enableNotifications = enableNotifications;
        }

        public void ShowNotification(string title, string message)
        {
            if (!enableNotifications || disposed) return;

            try
            {
                // Use Windows Forms MessageBox for now
                // In a production app, you'd use Windows Toast Notifications API
                MessageBox.Show(message, title, MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch
            {
                // Ignore notification errors
            }
        }

        public void ShowError(string title, string message)
        {
            if (!enableNotifications || disposed) return;

            try
            {
                MessageBox.Show(message, title, MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            catch
            {
                // Ignore notification errors
            }
        }

        public void ShowSuccess(string title, string message)
        {
            if (!enableNotifications || disposed) return;

            try
            {
                MessageBox.Show(message, title, MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch
            {
                // Ignore notification errors
            }
        }

        public void Dispose()
        {
            disposed = true;
        }
    }
}
