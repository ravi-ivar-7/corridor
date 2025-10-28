using System;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

class ClipboardSyncClientConsole
{
    static string lastClipboard = "";
    static ClientWebSocket socket;
    static string token = "";
    static string wsUrl = "";
    static CancellationTokenSource cancellationTokenSource = new CancellationTokenSource();
    static bool isRunning = true;
    static int reconnectDelay = 1000; // Start with 1 second
    static readonly int maxReconnectDelay = 30000; // Max 30 seconds
    static readonly int reconnectDelayIncrement = 1000; // Increase by 1 second each time

    [STAThread]
    static async Task Main()
    {
        Console.OutputEncoding = Encoding.UTF8;
        Console.Write("Enter token: ");
        token = Console.ReadLine()?.Trim();

        wsUrl = $"wss://clipboard-sync-worker.ravi404606.workers.dev/ws?token={token}";
        Console.WriteLine($"\nConnecting to {wsUrl} ...");

        // Set up Ctrl+C handler
        Console.CancelKeyPress += (sender, e) =>
        {
            e.Cancel = true;
            Console.WriteLine("\n🛑 Shutting down...");
            isRunning = false;
            cancellationTokenSource.Cancel();
            Application.Exit();
        };

        // Start the main connection loop
        await RunWithReconnection();

        Console.WriteLine("👋 Goodbye!");
    }

    static async Task RunWithReconnection()
    {
        while (isRunning)
        {
            try
            {
                await ConnectAndRun();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Connection failed: {ex.Message}");
            }

            if (isRunning)
            {
                Console.WriteLine($"🔄 Reconnecting in {reconnectDelay / 1000} seconds...");
                await Task.Delay(reconnectDelay, cancellationTokenSource.Token);
                
                // Increase delay for next attempt (exponential backoff)
                reconnectDelay = Math.Min(reconnectDelay + reconnectDelayIncrement, maxReconnectDelay);
            }
        }
    }

    static async Task ConnectAndRun()
    {
        // Create new socket for each connection attempt
        socket?.Dispose();
        socket = new ClientWebSocket();

        try
        {
            await socket.ConnectAsync(new Uri(wsUrl), cancellationTokenSource.Token);
            Console.WriteLine("✅ Connected.");
            
            // Reset reconnect delay on successful connection
            reconnectDelay = 1000;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to connect: {ex.Message}");
            throw;
        }

        // Start background tasks
        var listenTask = Task.Run(() => ListenForServerMessages(cancellationTokenSource.Token));
        var clipboardTask = Task.Run(() => CheckLocalClipboardLoop(cancellationTokenSource.Token));
        var keepaliveTask = Task.Run(() => SendKeepalivePings(cancellationTokenSource.Token));

        Console.WriteLine("📋 Clipboard sync active. Press Ctrl+C to exit.\n");

        // Wait for any task to complete (connection lost) or cancellation
        await Task.WhenAny(listenTask, clipboardTask, keepaliveTask);
        
        // If we get here, connection was lost
        Console.WriteLine("⚠️ Connection lost.");
    }

    static async Task CheckLocalClipboardLoop(CancellationToken cancellationToken)
    {
        while (isRunning && socket?.State == WebSocketState.Open && !cancellationToken.IsCancellationRequested)
        {
            try
            {
                string text = "";
                var thread = new Thread(() =>
                {
                    if (Clipboard.ContainsText())
                        text = Clipboard.GetText();
                });
                thread.SetApartmentState(ApartmentState.STA);
                thread.Start();
                thread.Join();

                if (!string.IsNullOrWhiteSpace(text) && text != lastClipboard)
                {
                    lastClipboard = text;
                    var msg = new
                    {
                        type = "clipboard_update",
                        data = new
                        {
                            content = text
                        }
                    };
                    string json = JsonSerializer.Serialize(msg);
                    byte[] buffer = Encoding.UTF8.GetBytes(json);
                    await socket.SendAsync(buffer, WebSocketMessageType.Text, true, cancellationToken);
                    Console.WriteLine($"📤 Sent update: {text}");
                }
            }
            catch (OperationCanceledException)
            {
                // Expected when cancellation is requested
                break;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Clipboard check failed: {ex.Message}");
            }

            try
            {
                await Task.Delay(1500, cancellationToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    static async Task ListenForServerMessages(CancellationToken cancellationToken)
    {
        var buffer = new byte[8192];
        while (isRunning && socket?.State == WebSocketState.Open && !cancellationToken.IsCancellationRequested)
        {
            WebSocketReceiveResult result;
            try
            {
                result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), cancellationToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when cancellation is requested
                break;
            }
            catch
            {
                Console.WriteLine("⚠️ Disconnected.");
                break;
            }

            if (result.MessageType == WebSocketMessageType.Close)
            {
                Console.WriteLine("⚠️ Server closed connection.");
                try
                {
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed", CancellationToken.None);
                }
                catch
                {
                    // Ignore errors when closing
                }
                break;
            }
            else if (result.MessageType == WebSocketMessageType.Text)
            {
                string msg = Encoding.UTF8.GetString(buffer, 0, result.Count);
                
                // Handle keepalive ping/pong messages
                if (msg == "{\"type\":\"ping\"}")
                {
                    // Respond to ping with pong
                    try
                    {
                        byte[] pongData = Encoding.UTF8.GetBytes("{\"type\":\"pong\"}");
                        await socket.SendAsync(new ArraySegment<byte>(pongData), 
                            WebSocketMessageType.Text, true, cancellationToken);
                    }
                    catch
                    {
                        // Connection might be broken, let the outer loop handle it
                        break;
                    }
                    continue;
                }
                else if (msg == "{\"type\":\"pong\"}")
                {
                    // Received pong, connection is alive
                    continue;
                }
                
                // Handle regular messages
                Console.WriteLine($"📥 Received: {msg}");
                ProcessMessage(msg);
            }
        }
    }

    static void ProcessMessage(string msg)
    {
        try
        {
            using var doc = JsonDocument.Parse(msg);
            var root = doc.RootElement;
            if (root.TryGetProperty("type", out var typeElem) &&
                typeElem.GetString() == "clipboard_update")
            {
                string newContent = root.GetProperty("data").GetProperty("content").GetString();
                if (!string.IsNullOrWhiteSpace(newContent) && newContent != lastClipboard)
                {
                    lastClipboard = newContent;
                    var thread = new Thread(() =>
                    {
                        Clipboard.SetText(newContent);
                    });
                    thread.SetApartmentState(ApartmentState.STA);
                    thread.Start();
                    thread.Join();

                    Console.WriteLine($"📋 Clipboard updated from server: {newContent}");
                }
            }
        }
        catch
        {
            // ignore malformed data
        }
    }

    static async Task SendKeepalivePings(CancellationToken cancellationToken)
    {
        while (isRunning && socket?.State == WebSocketState.Open && !cancellationToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(30000, cancellationToken); // 30 seconds
                
                if (socket?.State == WebSocketState.Open)
                {
                    // Send ping message to keep connection alive
                    byte[] pingData = Encoding.UTF8.GetBytes("{\"type\":\"ping\"}");
                    await socket.SendAsync(new ArraySegment<byte>(pingData), 
                        WebSocketMessageType.Text, true, cancellationToken);
                }
            }
            catch (OperationCanceledException)
            {
                // Expected when cancellation is requested
                break;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Keepalive ping failed: {ex.Message}");
                break;
            }
        }
    }
}
