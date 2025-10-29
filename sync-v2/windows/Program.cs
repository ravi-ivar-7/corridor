using System;
using System.Windows.Forms;
using ClipboardSyncClient.Core;
using ClipboardSyncClient.UI;

namespace ClipboardSyncClient
{
    internal static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // Always show setup window first (will prefill existing values)
            var configManager = new ConfigManager();
            var setupWindow = new SetupWindow(configManager);
            
            // Use Application.Run for the setup window to avoid threading issues
            Application.Run(setupWindow);
            
            // After setup window closes, start main application if config was saved
            var config = configManager.LoadConfig();
            if (!string.IsNullOrWhiteSpace(config.Token) && 
                !string.IsNullOrWhiteSpace(config.WebSocketUrl) && 
                !string.IsNullOrWhiteSpace(config.HttpUrl))
            {
                Application.Run(new MainApplication());
            }
        }
    }
}