#nullable enable
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Windows.Forms;
using ClipboardSyncClient.Core;
using ClipboardSyncClient.UI;

namespace ClipboardSyncClient
{
    internal static class Program
    {

        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // Check for existing instance FIRST (before any GUI)
            if (!IsSingleInstance())
            {
                HandleMultipleInstances();
                return;
            }

            var configManager = new ConfigManager();

            // Check for silent/background mode arguments (bypass setup)
            bool silentMode = args.Length > 0 && (args[0] == "--silent" || args[0] == "--background" || args[0] == "/silent" || args[0] == "/background");
            
            if (silentMode)
            {
                // Silent mode - run directly without setup window
                var silentConfig = configManager.LoadConfig();
                if (!string.IsNullOrWhiteSpace(silentConfig.Token) &&
                    !string.IsNullOrWhiteSpace(silentConfig.WebSocketUrl) &&
                    !string.IsNullOrWhiteSpace(silentConfig.HttpUrl))
                {
                    // Force silent mode for silent operation
                    silentConfig.Mode = AppMode.Silent;
                    configManager.SaveConfig(silentConfig);

                    // Start application in silent mode
                    Application.Run(new MainApplication());
                }
                return;
            }

            // Check if this is actually a Windows auto-start (not manual launch)
            // We can detect this by checking for a special auto-start argument
            bool isWindowsAutoStart = args.Length > 0 && (args[0] == "--autostart" || args[0] == "/autostart");
            
            // Check if AutoStart is enabled and we have valid configuration
            var config = configManager.LoadConfig();
            if (isWindowsAutoStart && config.AutoStart && 
                !string.IsNullOrWhiteSpace(config.Token) && 
                !string.IsNullOrWhiteSpace(config.WebSocketUrl) && 
                !string.IsNullOrWhiteSpace(config.HttpUrl))
            {
                // AutoStart mode - run directly with saved configuration without setup window
                // Don't force background mode - use the user's saved preference
                // But pass startup mode flag for failure notifications
                Application.Run(new MainApplication(startupMode: true));
                return;
            }

            // ALWAYS show setup window first (normal behavior)
            var setupWindow = new SetupWindow(configManager);
            Application.Run(setupWindow);
            
            // After setup window closes, start main application if config was saved
            var finalConfig = configManager.LoadConfig();
            if (!string.IsNullOrWhiteSpace(finalConfig.Token) &&
                !string.IsNullOrWhiteSpace(finalConfig.WebSocketUrl) &&
                !string.IsNullOrWhiteSpace(finalConfig.HttpUrl))
            {
                // Start application (will run in silent or interactive mode based on user's choice)
                if (finalConfig.Mode == AppMode.Silent)
                {
                    // For silent mode, run without showing any windows
                    var mainApp = new MainApplication();
                    Application.Run(mainApp);
                }
                else
                {
                    // Interactive mode with GUI
                    Application.Run(new MainApplication());
                }
            }
        }

        private static bool IsSingleInstance()
        {
            try
            {
                var currentProcess = Process.GetCurrentProcess();
                var currentExePath = currentProcess.MainModule?.FileName;
                
                // Check if any other instances of the same executable are running
                var existingProcesses = Process.GetProcessesByName(currentProcess.ProcessName)
                    .Where(p => p.Id != currentProcess.Id && 
                               p.MainModule?.FileName == currentExePath &&
                               !p.HasExited)
                    .ToList();

                if (existingProcesses.Count > 0)
                {
                    // Another instance is running
                    return false;
                }

                // No other instances found, this is the only one
                return true;
            }
            catch
            {
                // If there's an error checking processes, assume single instance is OK
                return true;
            }
        }

        private static void HandleMultipleInstances()
        {
            // Find existing processes
            var currentProcess = Process.GetCurrentProcess();
            var currentExePath = currentProcess.MainModule?.FileName;
            
            var existingProcesses = Process.GetProcessesByName(currentProcess.ProcessName)
                .Where(p => p.Id != currentProcess.Id && 
                           p.MainModule?.FileName == currentExePath &&
                           !p.HasExited)
                .ToList();

            // Show dialog to user
            var result = MessageBox.Show(
                $"Another instance of {currentProcess.ProcessName} is already running.\n\n" +
                "Would you like to:\n" +
                "• Terminate the existing process and start new one\n" +
                "• Cancel and exit\n\n" +
                $"Found {existingProcesses.Count} existing process(es).",
                "Multiple Instances Detected",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Warning,
                MessageBoxDefaultButton.Button2);

            if (result == DialogResult.Yes)
            {
                // Terminate existing processes
                foreach (var process in existingProcesses)
                {
                    try
                    {
                        if (!process.HasExited)
                        {
                            process.Kill();
                            process.WaitForExit(5000); // Wait up to 5 seconds
                        }
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Failed to terminate process {process.Id}: {ex.Message}", 
                            "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                    finally
                    {
                        process.Dispose();
                    }
                }

                // Wait a moment for processes to fully terminate
                System.Threading.Thread.Sleep(1000);

                // Try to start this instance again
                Application.Restart();
            }
            else
            {
                // User chose to cancel
                Application.Exit();
            }
        }

    }
}