#nullable enable
using System;
using System.IO;
using System.Text.Json;
using Microsoft.Win32;
using System.Windows.Forms;
using System.Runtime.InteropServices;

namespace ClipboardSyncClient.Core
{
    public class ConfigManager
    {
        private readonly string configPath;
        private readonly string appDataPath;

        public ConfigManager()
        {
            appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "Corridor");
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
            // Try both methods - Task Scheduler for better reliability, Registry as fallback
            bool taskSchedulerSuccess = false;
            bool registrySuccess = false;
            Exception? lastException = null;

            // Try Task Scheduler first (better for sleep/wake scenarios)
            try
            {
                SetTaskSchedulerAutoStart(enabled);
                taskSchedulerSuccess = true;
            }
            catch (Exception ex)
            {
                // Task Scheduler failed, continue to registry method
                lastException = ex;
            }

            // Always try registry method as well (fallback)
            try
            {
                SetRegistryAutoStart(enabled);
                registrySuccess = true;
            }
            catch (Exception ex)
            {
                if (lastException == null)
                    lastException = ex;
            }

            // If both methods failed, throw the error
            if (!taskSchedulerSuccess && !registrySuccess)
            {
                throw new Exception($"Failed to set auto-start: {lastException?.Message ?? "Unknown error"}");
            }

            // If only registry worked, that's okay - it will still autostart on boot
            // Task Scheduler is optional enhancement for sleep/wake scenarios
        }

        private void SetRegistryAutoStart(bool enabled)
        {
            try
            {
                using var key = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Run", true);
                if (key != null)
                {
                    const string registryValueName = "Corridor";
                    
                    if (enabled)
                    {
                        key.SetValue(registryValueName, $"\"{Application.ExecutablePath}\" --autostart");
                    }
                    else
                    {
                        try
                        {
                            key.DeleteValue(registryValueName, false);
                        }
                        catch { }
                    }
                }
            }
            catch
            {
                // Fallback method failed, but continue
            }
        }

        private void SetTaskSchedulerAutoStart(bool enabled)
        {
            const string taskName = "Corridor";

            try
            {
                if (!enabled)
                {
                    // Delete the task using PowerShell
                    var deleteScript = $@"
                        try {{
                            Unregister-ScheduledTask -TaskName '{taskName}' -Confirm:$false -ErrorAction Stop
                            exit 0
                        }} catch {{
                            # Task might not exist, exit successfully
                            exit 0
                        }}
                    ";

                    RunPowerShellScript(deleteScript);
                    return;
                }

                // Create the task using PowerShell (more reliable than COM interop)
                string exePath = Application.ExecutablePath.Replace("'", "''"); // Escape single quotes
                string currentUser = $"{Environment.UserDomainName}\\{Environment.UserName}".Replace("'", "''");

                var createScript = $@"
                    $taskName = '{taskName}'
                    $exePath = '{exePath}'
                    $arguments = '--autostart'

                    # Delete existing task if it exists
                    try {{
                        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
                    }} catch {{
                        # Ignore errors
                    }}

                    # Create task action
                    $action = New-ScheduledTaskAction -Execute $exePath -Argument $arguments

                    # Create triggers
                    $bootTrigger = New-ScheduledTaskTrigger -AtStartup
                    $bootTrigger.Delay = 'PT10S'  # 10 second delay after boot

                    $logonTrigger = New-ScheduledTaskTrigger -AtLogOn
                    $logonTrigger.Delay = 'PT5S'  # 5 second delay after logon

                    $unlockTrigger = New-ScheduledTaskTrigger -AtSessionUnlock
                    $unlockTrigger.Delay = 'PT3S'  # 3 second delay after unlock

                    $triggers = @($bootTrigger, $logonTrigger, $unlockTrigger)

                    # Create task settings
                    # Note: Removed RunOnlyIfNetworkAvailable to allow app to start offline and handle reconnection internally
                    $settings = New-ScheduledTaskSettingsSet `
                        -AllowStartIfOnBatteries `
                        -DontStopIfGoingOnBatteries `
                        -StartWhenAvailable `
                        -MultipleInstances IgnoreNew `
                        -ExecutionTimeLimit (New-TimeSpan -Seconds 0)

                    # Register the task (runs as current user with normal privileges - no admin needed!)
                    Register-ScheduledTask `
                        -TaskName $taskName `
                        -Action $action `
                        -Trigger $triggers `
                        -Settings $settings `
                        -Description 'Starts Corridor on system startup, user logon, and workstation unlock' `
                        -Force | Out-Null

                    # Verify task was created
                    $task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
                    if ($task -eq $null) {{
                        throw 'Task was not created successfully'
                    }}

                    exit 0
                ";

                RunPowerShellScript(createScript);
            }
            catch (Exception ex)
            {
                throw new Exception($"Task Scheduler setup failed: {ex.Message}");
            }
        }

        private void RunPowerShellScript(string script)
        {
            var processStartInfo = new System.Diagnostics.ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = $"-NoProfile -ExecutionPolicy Bypass -Command \"{script.Replace("\"", "\\\"")}\"",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
                // No Verb = "runas" needed - runs as normal user!
            };

            using (var process = System.Diagnostics.Process.Start(processStartInfo))
            {
                if (process == null)
                    throw new Exception("Failed to start PowerShell process");

                string output = process.StandardOutput.ReadToEnd();
                string error = process.StandardError.ReadToEnd();
                process.WaitForExit(30000); // 30 second timeout

                if (process.ExitCode != 0)
                {
                    string errorMsg = !string.IsNullOrWhiteSpace(error) ? error : output;
                    throw new Exception($"PowerShell script failed (Exit code: {process.ExitCode}): {errorMsg}");
                }
            }
        }

        public bool IsAutoStartEnabled()
        {
            try
            {
                // Check Task Scheduler first (primary method)
                if (IsTaskSchedulerAutoStartEnabled())
                    return true;

                // Fall back to registry check (Corridor registry value only)
                using var key = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Run", false);
                return key?.GetValue("Corridor") != null;
            }
            catch
            {
                return false;
            }
        }

        private bool IsTaskSchedulerAutoStartEnabled()
        {
            const string taskName = "Corridor";

            try
            {
                var checkScript = $@"
                    try {{
                        $task = Get-ScheduledTask -TaskName '{taskName}' -ErrorAction Stop
                        if ($task -ne $null) {{
                            exit 0  # Task exists
                        }} else {{
                            exit 1  # Task doesn't exist
                        }}
                    }} catch {{
                        exit 1  # Task doesn't exist or error
                    }}
                ";

                var processStartInfo = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = $"-NoProfile -ExecutionPolicy Bypass -Command \"{checkScript.Replace("\"", "\\\"")}\"",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };

                using (var process = System.Diagnostics.Process.Start(processStartInfo))
                {
                    if (process == null)
                        return false;

                    process.WaitForExit(5000); // 5 second timeout
                    return process.ExitCode == 0;
                }
            }
            catch
            {
                return false;
            }
        }
    }

    public enum AppMode
    {
        Interactive,  // Shows tray icon, notifications, full UI
        Silent        // Completely silent, no tray icon, no notifications
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
                                               "• Silent mode\n" +
                                               "• Auto-start with Windows";
        public string Token { get; set; } = "";
        public string WebSocketUrl { get; set; } = "wss://corridor-worker.corridor-sync.workers.dev/ws";
        public string HttpUrl { get; set; } = "https://corridor-worker.corridor-sync.workers.dev/api";
        public AppMode Mode { get; set; } = AppMode.Interactive;
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
        public string CloseHotkey { get; set; } = "";
    }
}
