#nullable enable
using System;
using System.Threading;
using System.Threading.Tasks;
using ClipboardSyncClient.Core;
using ClipboardSyncClient.Network;
using System.Text.Json;
using Microsoft.Win32;
using System.Net.NetworkInformation;

namespace ClipboardSyncClient.Core
{
    public class ConnectionManager : IDisposable
    {
        private readonly WebSocketClient webSocketClient;
        private readonly ClipboardHttpClient httpClient;
        private readonly MessageQueue messageQueue;
        private readonly ConfigManager configManager;
        private AppConfig config;

        private CancellationTokenSource? cancellationTokenSource;
        private bool isRunning = false;
        private bool isUpdatingClipboardFromCloud = false;
        private bool useWebSocket = true;
        private int reconnectDelay = 1000;
        private readonly int maxReconnectDelay = 30000;
        private readonly int reconnectDelayIncrement = 1000;
        private string lastSentContent = "";

        public event EventHandler<ConnectionState>? ConnectionStateChanged;
        public event EventHandler<string>? ClipboardReceived;

        private void LogMessage(string message)
        {
            // Only log to console if in interactive mode
            if (config.Mode == AppMode.Interactive)
            {
                Console.WriteLine(message);
            }
        }

        public ConnectionManager(ConfigManager configManager)
        {
            this.configManager = configManager;
            config = configManager.LoadConfig();

            webSocketClient = new WebSocketClient();
            webSocketClient.BufferSize = config.WebSocketBufferSize;
            httpClient = new ClipboardHttpClient(config.HttpUrl);
            messageQueue = new MessageQueue();

            webSocketClient.MessageReceived += OnWebSocketMessageReceived;
            webSocketClient.Connected += OnWebSocketConnected;
            webSocketClient.Disconnected += OnWebSocketDisconnected;
            webSocketClient.Error += OnWebSocketError;

            // Subscribe to power management events
            SystemEvents.PowerModeChanged += OnPowerModeChanged;

            // Subscribe to network availability changes
            NetworkChange.NetworkAvailabilityChanged += OnNetworkAvailabilityChanged;
        }

        public async Task StartAsync()
        {
            // Stop any existing connection first
            if (isRunning)
            {
                await StopAsync();
            }

            try
            {
                isRunning = true;
                cancellationTokenSource = new CancellationTokenSource();
                
                // Reset connection state
                useWebSocket = true;
                reconnectDelay = 1000;
                
                // Start background tasks and await them
                var connectionTask = Task.Run(() => ConnectionLoop(cancellationTokenSource.Token));
                var clipboardTask = Task.Run(() => ClipboardMonitorLoop(cancellationTokenSource.Token));
                var keepaliveTask = Task.Run(() => KeepaliveLoop(cancellationTokenSource.Token));

                // Wait for any task to complete (which indicates an error or shutdown)
                await Task.WhenAny(connectionTask, clipboardTask, keepaliveTask);
            }
            catch (Exception)
            {
                isRunning = false;
                ConnectionStateChanged?.Invoke(this, ConnectionState.Error);
                throw;
            }
        }

        public async Task StopAsync()
        {
            if (!isRunning) return;

            isRunning = false;
            cancellationTokenSource?.Cancel();
            
            await webSocketClient.DisconnectAsync();
            // Don't dispose httpClient here - we need it for reconnection
        }

        private async Task ConnectionLoop(CancellationToken cancellationToken)
        {
            while (isRunning && !cancellationToken.IsCancellationRequested)
            {
                try
                {
                    if (useWebSocket && !webSocketClient.IsConnected)
                    {
                        ConnectionStateChanged?.Invoke(this, ConnectionState.Connecting);
                        string wsUrl = $"{config.WebSocketUrl}?token={config.Token}";
                        bool connected = await webSocketClient.ConnectAsync(wsUrl, cancellationToken);
                        
                        if (connected)
                        {
                            reconnectDelay = 1000; // Reset delay on successful connection
                            await SendQueuedMessages();
                        }
                        else
                        {
                            useWebSocket = false;
                            ConnectionStateChanged?.Invoke(this, ConnectionState.HttpFallback);
                        }
                    }
                    else if (!useWebSocket)
                    {
                        // Try to reconnect WebSocket periodically
                        await Task.Delay(30000, cancellationToken);
                        useWebSocket = true;
                    }
                    else
                    {
                        // Already connected, just wait
                        await Task.Delay(1000, cancellationToken);
                    }
                }
                catch (Exception ex)
                {
                    LogMessage($"Connection error: {ex.Message}");
                    ConnectionStateChanged?.Invoke(this, ConnectionState.Error);
                    useWebSocket = false;
                    await Task.Delay(reconnectDelay, cancellationToken);
                    reconnectDelay = Math.Min(reconnectDelay + reconnectDelayIncrement, maxReconnectDelay);
                }
            }
        }

        private string lastClipboard = "";

        private async Task ClipboardMonitorLoop(CancellationToken cancellationToken)
        {

            while (isRunning && !cancellationToken.IsCancellationRequested)
            {
                try
                {
                    string currentClipboard = "";
                    var thread = new Thread(() =>
                    {
                        if (System.Windows.Forms.Clipboard.ContainsText())
                            currentClipboard = System.Windows.Forms.Clipboard.GetText();
                    });
                    thread.SetApartmentState(ApartmentState.STA);
                    thread.Start();
                    thread.Join();

                    if (!string.IsNullOrWhiteSpace(currentClipboard) && currentClipboard != lastClipboard && !isUpdatingClipboardFromCloud)
                    {
                        // Validate and potentially truncate content
                        string processedContent = ValidateAndProcessContent(currentClipboard);
                        
                        lastClipboard = currentClipboard;
                        lastSentContent = processedContent; // Track what we're sending
                        
                        if (useWebSocket && webSocketClient.IsConnected)
                        {
                            await webSocketClient.SendClipboardUpdateAsync(processedContent, cancellationToken);
                        }
                        else
                        {
                            messageQueue.Enqueue(processedContent);
                        }
                    }
                }
                catch (InvalidOperationException ex)
                {
                    // Content too large - log and skip
                    LogMessage($"Skipping clipboard update: {ex.Message}");
                }
                catch (Exception ex)
                {
                    LogMessage($"Error in clipboard monitoring: {ex.Message}");
                }

                try
                {
                    await Task.Delay(1000, cancellationToken); // Check clipboard every second
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }
        }

        private async Task KeepaliveLoop(CancellationToken cancellationToken)
        {
            while (isRunning && !cancellationToken.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(30000, cancellationToken); // Send ping every 30 seconds
                    
                    if (useWebSocket && webSocketClient.IsConnected)
                    {
                        await webSocketClient.SendMessageAsync("{\"type\":\"ping\"}", cancellationToken);
                    }
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }
        }

        private async Task SendQueuedMessages()
        {
            var messages = messageQueue.DequeueAll();
            foreach (var message in messages)
            {
                if (useWebSocket && webSocketClient.IsConnected)
                {
                    await webSocketClient.SendClipboardUpdateAsync(message.Content, CancellationToken.None);
                }
                else
                {
                    // Fallback to HTTP if WebSocket is not available
                    await httpClient.SendClipboardAsync(config.Token, message.Content);
                }
            }
        }

        private string ValidateAndProcessContent(string content)
        {
            if (string.IsNullOrEmpty(content))
                return content;
            
            // Check content length
            if (content.Length > config.MaxContentLength)
            {
                if (config.TruncateLargeContent)
                {
                    LogMessage($"Warning: Clipboard content too large ({content.Length} chars), truncating to {config.MaxContentLength} chars");
                    return content.Substring(0, config.MaxContentLength) + "\n\n[Content truncated due to size limit]";
                }
                else
                {
                    LogMessage($"Error: Clipboard content too large ({content.Length} chars), max allowed: {config.MaxContentLength} chars");
                    throw new InvalidOperationException($"Content too large: {content.Length} chars (max: {config.MaxContentLength})");
                }
            }
            
            return content;
        }

        private void OnWebSocketMessageReceived(object? sender, string message)
        {
            try
            {
                using var doc = JsonDocument.Parse(message);
                var root = doc.RootElement;
                
                if (root.TryGetProperty("type", out var typeElement) &&
                    typeElement.GetString() == "clipboard_update")
                {
                    string content = root.GetProperty("data").GetProperty("content").GetString() ?? "";
                    
                    // Validate received content
                    content = ValidateAndProcessContent(content);
                    
                    // Check if this is a message we just sent (to prevent feedback loop notifications)
                    if (content == lastSentContent)
                    {
                        // This is our own message, just update lastClipboard without showing notification
                        lastClipboard = content;
                        return;
                    }
                    
                    // Set flag to prevent sending this update back to cloud
                    isUpdatingClipboardFromCloud = true;
                    
                    // Update lastClipboard immediately to prevent detecting this as a new change
                    lastClipboard = content;
                    
                    ClipboardReceived?.Invoke(this, content);
                    
                    // Reset flag after a short delay to allow clipboard to update
                    Task.Delay(200).ContinueWith(_ => 
                    {
                        isUpdatingClipboardFromCloud = false;
                    });
                }
            }
            catch (JsonException ex)
            {
                LogMessage($"JSON parsing failed: {ex.Message}");
                LogMessage($"Message: {message.Substring(0, Math.Min(message.Length, 200))}...");
            }
            catch (Exception ex)
            {
                LogMessage($"Error processing WebSocket message: {ex.Message}");
            }
        }

        private void OnWebSocketConnected(object? sender, EventArgs e)
        {
            ConnectionStateChanged?.Invoke(this, ConnectionState.Connected);
        }

        private void OnWebSocketDisconnected(object? sender, string reason)
        {
            ConnectionStateChanged?.Invoke(this, ConnectionState.Disconnected);
        }

        private void OnWebSocketError(object? sender, string error)
        {
            ConnectionStateChanged?.Invoke(this, ConnectionState.Error);
        }

        public void UpdateConfiguration()
        {
            // Reload configuration
            var newConfig = configManager.LoadConfig();
            
            // Update WebSocket buffer size if it changed
            if (webSocketClient != null && newConfig.WebSocketBufferSize != config.WebSocketBufferSize)
            {
                webSocketClient.BufferSize = newConfig.WebSocketBufferSize;
                LogMessage($"WebSocket buffer size updated to: {newConfig.WebSocketBufferSize} bytes");
            }
            
            // Update local config
            config = newConfig;
        }

        public (int BufferSize, int MaxContentLength, bool TruncateLargeContent) GetConfiguration()
        {
            return (config.WebSocketBufferSize, config.MaxContentLength, config.TruncateLargeContent);
        }

        private void OnPowerModeChanged(object sender, PowerModeChangedEventArgs e)
        {
            try
            {
                switch (e.Mode)
                {
                    case PowerModes.Suspend:
                        // Computer is going to sleep
                        LogMessage("System suspending, preparing for sleep...");
                        // Connection will be handled by ConnectionLoop
                        break;

                    case PowerModes.Resume:
                        // Computer woke up from sleep/hibernation
                        LogMessage("System resumed from sleep, reconnecting...");

                        // Force reconnection after a brief delay to allow network to stabilize
                        Task.Run(async () =>
                        {
                            try
                            {
                                await Task.Delay(3000); // Wait for network to stabilize

                                // Force disconnect to trigger reconnection
                                if (webSocketClient != null)
                                {
                                    await webSocketClient.DisconnectAsync();
                                }

                                // Reset reconnection parameters
                                reconnectDelay = 1000;
                                useWebSocket = true;

                                LogMessage("Reconnection initiated after system resume");
                            }
                            catch (Exception ex)
                            {
                                LogMessage($"Error during resume reconnection: {ex.Message}");
                            }
                        });
                        break;
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error handling power mode change: {ex.Message}");
            }
        }

        private void OnNetworkAvailabilityChanged(object? sender, NetworkAvailabilityEventArgs e)
        {
            try
            {
                if (e.IsAvailable)
                {
                    LogMessage("Network available, initiating reconnection...");

                    // Network is back, try to reconnect
                    Task.Run(async () =>
                    {
                        try
                        {
                            await Task.Delay(2000); // Brief delay for network stabilization

                            // Reset reconnection parameters to trigger immediate reconnect
                            reconnectDelay = 1000;
                            useWebSocket = true;

                            LogMessage("Reconnection triggered by network availability");
                        }
                        catch (Exception ex)
                        {
                            LogMessage($"Error during network reconnection: {ex.Message}");
                        }
                    });
                }
                else
                {
                    LogMessage("Network unavailable");
                }
            }
            catch (Exception ex)
            {
                LogMessage($"Error handling network availability change: {ex.Message}");
            }
        }

        public void Dispose()
        {
            // Unsubscribe from events
            SystemEvents.PowerModeChanged -= OnPowerModeChanged;
            NetworkChange.NetworkAvailabilityChanged -= OnNetworkAvailabilityChanged;

            StopAsync().Wait();
            webSocketClient?.Dispose();
            httpClient?.Dispose();
            cancellationTokenSource?.Dispose();
        }
    }

    public enum ConnectionState
    {
        Disconnected,
        Connecting,
        Connected,
        HttpFallback,
        Error
    }
}
