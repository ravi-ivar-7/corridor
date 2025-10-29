using System;
using System.IO;
using System.Text.Json;
using Microsoft.Win32;
using System.Windows.Forms;

namespace ClipboardSyncClient.Core
{
    public class ConfigManager
    {
        private readonly string configPath;
        private readonly string appDataPath;

        public ConfigManager()
        {
            appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "ClipboardSync");
            configPath = Path.Combine(appDataPath, "config.json");
            
            if (!Directory.Exists(appDataPath))
            {
                Directory.CreateDirectory(appDataPath);
            }
        }

        public bool IsConfigured()
        {
            return File.Exists(configPath);
        }

        public AppConfig LoadConfig()
        {
            if (!File.Exists(configPath))
            {
                return new AppConfig();
            }

            try
            {
                string json = File.ReadAllText(configPath);
                return JsonSerializer.Deserialize<AppConfig>(json) ?? new AppConfig();
            }
            catch
            {
                return new AppConfig();
            }
        }

        public void SaveConfig(AppConfig config)
        {
            try
            {
                string json = JsonSerializer.Serialize(config, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(configPath, json);
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to save configuration: {ex.Message}");
            }
        }

        public void SetAutoStart(bool enabled)
        {
            try
            {
                using var key = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Run", true);
                if (key != null)
                {
                    if (enabled)
                    {
                        key.SetValue("ClipboardSync", $"\"{Application.ExecutablePath}\" --autostart");
                    }
                    else
                    {
                        key.DeleteValue("ClipboardSync", false);
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to set auto-start: {ex.Message}");
            }
        }

        public bool IsAutoStartEnabled()
        {
            try
            {
                using var key = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Run", false);
                return key?.GetValue("ClipboardSync") != null;
            }
            catch
            {
                return false;
            }
        }
    }

    public class AppConfig
    {
        public string AppName { get; set; } = "Corridor";
        public string AboutText { get; set; } = "Real-time clipboard synchronization across devices.\n\n" +
                                               "Features:\n" +
                                               "• Real-time sync\n" +
                                               "• Auto-reconnect\n" +
                                               "• HTTP fallback\n" +
                                               "• System tray integration\n" +
                                               "• Background mode\n" +
                                               "• Auto-start with Windows";
        public string Token { get; set; } = "";
        public string WebSocketUrl { get; set; } = "wss://corridor-worker.corridor-sync.workers.dev/ws";
        public string HttpUrl { get; set; } = "https://corridor-worker.corridor-sync.workers.dev/api";
        public bool RunInBackground { get; set; } = false;
        public bool AutoStart { get; set; } = false;
        public int ReconnectDelay { get; set; } = 1000;
        public int MaxReconnectDelay { get; set; } = 30000;
        public int KeepaliveInterval { get; set; } = 30000;
        public int ClipboardCheckInterval { get; set; } = 1500;
        public int HttpPollingInterval { get; set; } = 5000;
        public int WebSocketBufferSize { get; set; } = 65536; // 64KB buffer
        public int MaxContentLength { get; set; } = 1048576; // 1MB max content
        public bool TruncateLargeContent { get; set; } = true;
        public string OpenHotkey { get; set; } = "Ctrl+Alt+O";
        public string CloseHotkey { get; set; } = "Ctrl+Alt+X";
    }
}
