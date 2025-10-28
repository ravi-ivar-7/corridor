using System;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

class ClipboardSyncClient
{
    static string lastClipboard = "";
    static ClientWebSocket socket = new ClientWebSocket();
    static string token = "";

    [STAThread]
    static async Task Main()
    {
        Console.OutputEncoding = Encoding.UTF8;
        Console.Write("Enter token: ");
        token = Console.ReadLine()?.Trim();

        string wsUrl = $"wss://clipboard-sync-worker.ravi404606.workers.dev/ws?token={token}";
        Console.WriteLine($"\nConnecting to {wsUrl} ...");

        try
        {
            await socket.ConnectAsync(new Uri(wsUrl), CancellationToken.None);
            Console.WriteLine("✅ Connected.\n");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Failed to connect: {ex.Message}");
            return;
        }

        // Start background tasks
        _ = Task.Run(ListenForServerMessages);
        _ = Task.Run(CheckLocalClipboardLoop);

        Console.WriteLine("📋 Clipboard sync active. Press Ctrl+C to exit.\n");

        // Keep the main STA thread alive for clipboard operations
        Application.Run();
    }

    static async Task CheckLocalClipboardLoop()
    {
        while (socket.State == WebSocketState.Open)
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
                    await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                    Console.WriteLine($"📤 Sent update: {text}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Clipboard check failed: {ex.Message}");
            }

            await Task.Delay(1500);
        }
    }

    static async Task ListenForServerMessages()
    {
        var buffer = new byte[8192];
        while (socket.State == WebSocketState.Open)
        {
            WebSocketReceiveResult result;
            try
            {
                result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            }
            catch
            {
                Console.WriteLine("⚠️ Disconnected.");
                break;
            }

            if (result.MessageType == WebSocketMessageType.Close)
            {
                Console.WriteLine("⚠️ Server closed connection.");
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed", CancellationToken.None);
                break;
            }

            string msg = Encoding.UTF8.GetString(buffer, 0, result.Count);
            Console.WriteLine($"📥 Received: {msg}");

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
    }
}
