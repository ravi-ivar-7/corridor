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
            catch
            {
                // Fallback method failed, but continue
            }
        }

        private void SetTaskSchedulerAutoStart(bool enabled)
        {
            const string taskName = "CorridorClipboardSync";
            Type? taskServiceType = null;
            object? taskService = null;

            try
            {
                // Get Task Scheduler COM interface
                taskServiceType = Type.GetTypeFromProgID("Schedule.Service");
                if (taskServiceType == null)
                    throw new Exception("Task Scheduler COM not available on this system");

                taskService = Activator.CreateInstance(taskServiceType);
                if (taskService == null)
                    throw new Exception("Failed to create Task Scheduler service instance");

                // Connect to Task Scheduler with proper parameter handling
                try
                {
                    taskServiceType.InvokeMember("Connect",
                        System.Reflection.BindingFlags.InvokeMethod,
                        null, taskService, new object?[] { null, null, null, null });
                }
                catch
                {
                    // Try without parameters
                    taskServiceType.InvokeMember("Connect",
                        System.Reflection.BindingFlags.InvokeMethod,
                        null, taskService, null);
                }

                // Get root folder
                object? rootFolder = taskServiceType.InvokeMember("GetFolder",
                    System.Reflection.BindingFlags.InvokeMethod,
                    null, taskService, new object[] { "\\" });

                if (rootFolder == null)
                    throw new Exception("Failed to get Task Scheduler root folder");

                if (!enabled)
                {
                    // Delete existing task
                    try
                    {
                        rootFolder.GetType().InvokeMember("DeleteTask",
                            System.Reflection.BindingFlags.InvokeMethod,
                            null, rootFolder, new object[] { taskName, 0 });
                    }
                    catch
                    {
                        // Task might not exist, ignore
                    }
                    return;
                }

                // Delete existing task before creating new one
                try
                {
                    rootFolder.GetType().InvokeMember("DeleteTask",
                        System.Reflection.BindingFlags.InvokeMethod,
                        null, rootFolder, new object[] { taskName, 0 });
                }
                catch
                {
                    // Task might not exist, ignore
                }

                // Create new task definition
                object? taskDefinition = taskServiceType.InvokeMember("NewTask",
                    System.Reflection.BindingFlags.InvokeMethod,
                    null, taskService, new object[] { 0 });

                if (taskDefinition == null)
                    throw new Exception("Failed to create task definition");

                // Set registration info
                object? regInfo = taskDefinition.GetType().InvokeMember("RegistrationInfo",
                    System.Reflection.BindingFlags.GetProperty,
                    null, taskDefinition, null);

                if (regInfo != null)
                {
                    regInfo.GetType().InvokeMember("Description",
                        System.Reflection.BindingFlags.SetProperty,
                        null, regInfo, new object[] { "Starts Corridor Clipboard Sync on system startup, logon, and wake from sleep" });

                    regInfo.GetType().InvokeMember("Author",
                        System.Reflection.BindingFlags.SetProperty,
                        null, regInfo, new object[] { "Corridor" });
                }

                // Get triggers collection
                object? triggers = taskDefinition.GetType().InvokeMember("Triggers",
                    System.Reflection.BindingFlags.GetProperty,
                    null, taskDefinition, null);

                if (triggers != null)
                {
                    // Trigger 1: On system startup (TASK_TRIGGER_BOOT = 8)
                    object? bootTrigger = triggers.GetType().InvokeMember("Create",
                        System.Reflection.BindingFlags.InvokeMethod,
                        null, triggers, new object[] { 8 });

                    if (bootTrigger != null)
                    {
                        bootTrigger.GetType().InvokeMember("Id",
                            System.Reflection.BindingFlags.SetProperty,
                            null, bootTrigger, new object[] { "BootTrigger" });

                        bootTrigger.GetType().InvokeMember("Enabled",
                            System.Reflection.BindingFlags.SetProperty,
                            null, bootTrigger, new object[] { true });

                        // Delay 10 seconds after boot to allow system to stabilize
                        bootTrigger.GetType().InvokeMember("Delay",
                            System.Reflection.BindingFlags.SetProperty,
                            null, bootTrigger, new object[] { "PT10S" });
                    }

                    // Trigger 2: On user logon (TASK_TRIGGER_LOGON = 9)
                    object? logonTrigger = triggers.GetType().InvokeMember("Create",
                        System.Reflection.BindingFlags.InvokeMethod,
                        null, triggers, new object[] { 9 });

                    if (logonTrigger != null)
                    {
                        logonTrigger.GetType().InvokeMember("Id",
                            System.Reflection.BindingFlags.SetProperty,
                            null, logonTrigger, new object[] { "LogonTrigger" });

                        logonTrigger.GetType().InvokeMember("Enabled",
                            System.Reflection.BindingFlags.SetProperty,
                            null, logonTrigger, new object[] { true });

                        // Delay 5 seconds after logon
                        logonTrigger.GetType().InvokeMember("Delay",
                            System.Reflection.BindingFlags.SetProperty,
                            null, logonTrigger, new object[] { "PT5S" });
                    }

                    // Trigger 3: On workstation unlock (TASK_TRIGGER_SESSION_STATE_CHANGE = 11)
                    // This handles wake from sleep/hibernation
                    object? sessionTrigger = triggers.GetType().InvokeMember("Create",
                        System.Reflection.BindingFlags.InvokeMethod,
                        null, triggers, new object[] { 11 });

                    if (sessionTrigger != null)
                    {
                        sessionTrigger.GetType().InvokeMember("Id",
                            System.Reflection.BindingFlags.SetProperty,
                            null, sessionTrigger, new object[] { "SessionUnlockTrigger" });

                        sessionTrigger.GetType().InvokeMember("Enabled",
                            System.Reflection.BindingFlags.SetProperty,
                            null, sessionTrigger, new object[] { true });

                        // StateChange = 8 means SESSION_UNLOCK
                        sessionTrigger.GetType().InvokeMember("StateChange",
                            System.Reflection.BindingFlags.SetProperty,
                            null, sessionTrigger, new object[] { 8 });

                        // Delay 3 seconds after unlock
                        sessionTrigger.GetType().InvokeMember("Delay",
                            System.Reflection.BindingFlags.SetProperty,
                            null, sessionTrigger, new object[] { "PT3S" });
                    }
                }

                // Get actions collection
                object? actions = taskDefinition.GetType().InvokeMember("Actions",
                    System.Reflection.BindingFlags.GetProperty,
                    null, taskDefinition, null);

                if (actions != null)
                {
                    // Create exec action (TASK_ACTION_EXEC = 0)
                    object? execAction = actions.GetType().InvokeMember("Create",
                        System.Reflection.BindingFlags.InvokeMethod,
                        null, actions, new object[] { 0 });

                    if (execAction != null)
                    {
                        execAction.GetType().InvokeMember("Path",
                            System.Reflection.BindingFlags.SetProperty,
                            null, execAction, new object[] { Application.ExecutablePath });

                        execAction.GetType().InvokeMember("Arguments",
                            System.Reflection.BindingFlags.SetProperty,
                            null, execAction, new object[] { "--autostart" });
                    }
                }

                // Configure task settings
                object? settings = taskDefinition.GetType().InvokeMember("Settings",
                    System.Reflection.BindingFlags.GetProperty,
                    null, taskDefinition, null);

                if (settings != null)
                {
                    // Don't stop if going on batteries
                    settings.GetType().InvokeMember("StopIfGoingOnBatteries",
                        System.Reflection.BindingFlags.SetProperty,
                        null, settings, new object[] { false });

                    // Don't disallow start if on batteries
                    settings.GetType().InvokeMember("DisallowStartIfOnBatteries",
                        System.Reflection.BindingFlags.SetProperty,
                        null, settings, new object[] { false });

                    // Allow task to run on demand
                    settings.GetType().InvokeMember("AllowDemandStart",
                        System.Reflection.BindingFlags.SetProperty,
                        null, settings, new object[] { true });

                    // Start when available if missed
                    settings.GetType().InvokeMember("StartWhenAvailable",
                        System.Reflection.BindingFlags.SetProperty,
                        null, settings, new object[] { true });

                    // Don't start a new instance if already running
                    // TASK_INSTANCES_IGNORE_NEW = 2
                    settings.GetType().InvokeMember("MultipleInstances",
                        System.Reflection.BindingFlags.SetProperty,
                        null, settings, new object[] { 2 });

                    // No execution time limit
                    settings.GetType().InvokeMember("ExecutionTimeLimit",
                        System.Reflection.BindingFlags.SetProperty,
                        null, settings, new object[] { "PT0S" });

                    // Run only if network is available
                    settings.GetType().InvokeMember("RunOnlyIfNetworkAvailable",
                        System.Reflection.BindingFlags.SetProperty,
                        null, settings, new object[] { true });
                }

                // Register task
                // Parameters: path, definition, flags (6 = TASK_CREATE_OR_UPDATE | TASK_LOGON_INTERACTIVE_TOKEN)
                // Try with minimal parameters first
                try
                {
                    rootFolder.GetType().InvokeMember("RegisterTaskDefinition",
                        System.Reflection.BindingFlags.InvokeMethod,
                        null, rootFolder, new object?[] { taskName, taskDefinition, 6, null, null, 3, null });
                }
                catch
                {
                    // Try with simplified parameters
                    rootFolder.GetType().InvokeMember("RegisterTaskDefinition",
                        System.Reflection.BindingFlags.InvokeMethod,
                        null, rootFolder, new object?[] { taskName, taskDefinition, 6, Type.Missing, Type.Missing, 3 });
                }
            }
            catch (Exception ex)
            {
                // Get inner exception details if available
                var innerMsg = ex.InnerException?.Message ?? ex.Message;
                throw new Exception($"Task Scheduler setup failed: {innerMsg}");
            }
            finally
            {
                // Clean up COM objects to prevent memory leaks
                try
                {
                    if (taskService != null)
                    {
                        Marshal.FinalReleaseComObject(taskService);
                    }
                }
                catch
                {
                    // Ignore cleanup errors
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

                // Fall back to registry check
                using var key = Registry.CurrentUser.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Run", false);
                return key?.GetValue("ClipboardSync") != null;
            }
            catch
            {
                return false;
            }
        }

        private bool IsTaskSchedulerAutoStartEnabled()
        {
            const string taskName = "CorridorClipboardSync";
            Type? taskServiceType = null;
            object? taskService = null;

            try
            {
                taskServiceType = Type.GetTypeFromProgID("Schedule.Service");
                if (taskServiceType == null)
                    return false;

                taskService = Activator.CreateInstance(taskServiceType);
                if (taskService == null)
                    return false;

                taskServiceType.InvokeMember("Connect",
                    System.Reflection.BindingFlags.InvokeMethod,
                    null, taskService, null);

                object? rootFolder = taskServiceType.InvokeMember("GetFolder",
                    System.Reflection.BindingFlags.InvokeMethod,
                    null, taskService, new object[] { "\\" });

                if (rootFolder == null)
                    return false;

                // Try to get the task
                object? task = rootFolder.GetType().InvokeMember("GetTask",
                    System.Reflection.BindingFlags.InvokeMethod,
                    null, rootFolder, new object[] { taskName });

                return task != null;
            }
            catch
            {
                return false;
            }
            finally
            {
                try
                {
                    if (taskService != null)
                    {
                        Marshal.FinalReleaseComObject(taskService);
                    }
                }
                catch
                {
                    // Ignore cleanup errors
                }
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
        public string CloseHotkey { get; set; } = "Ctrl+Alt+X";
    }
}
