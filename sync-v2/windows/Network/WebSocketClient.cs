#nullable enable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace ClipboardSyncClient.Network
{
    public class WebSocketClient : IDisposable
    {
        private ClientWebSocket? socket;
        private CancellationTokenSource? cancellationTokenSource;
        private bool isConnected = false;
        private bool disposed = false;
        private readonly List<byte> messageBuffer = new List<byte>();
        private int bufferSize = 65536; // Default 64KB

        public event EventHandler<string>? MessageReceived;
        public event EventHandler? Connected;
        public event EventHandler<string>? Disconnected;
        public event EventHandler<string>? Error;

        public bool IsConnected => isConnected && socket?.State == WebSocketState.Open;
        
        public int BufferSize 
        { 
            get => bufferSize; 
            set => bufferSize = Math.Max(1024, Math.Min(value, 1048576)); // 1KB to 1MB
        }

        public async Task<bool> ConnectAsync(string url, CancellationToken cancellationToken = default)
        {
            try
            {
                socket?.Dispose();
                socket = new ClientWebSocket();
                cancellationTokenSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);

                await socket.ConnectAsync(new Uri(url), cancellationTokenSource.Token);
                isConnected = true;
                Connected?.Invoke(this, EventArgs.Empty);

                _ = Task.Run(() => ListenForMessages(cancellationTokenSource.Token));
                return true;
            }
            catch (Exception ex)
            {
                Error?.Invoke(this, ex.Message);
                return false;
            }
        }

        public async Task<bool> SendMessageAsync(string message, CancellationToken cancellationToken = default)
        {
            if (!IsConnected) return false;

            try
            {
                byte[] buffer = Encoding.UTF8.GetBytes(message);
                await socket!.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, cancellationToken);
                return true;
            }
            catch (Exception ex)
            {
                Error?.Invoke(this, ex.Message);
                return false;
            }
        }

        public async Task<bool> SendClipboardUpdateAsync(string content, CancellationToken cancellationToken = default)
        {
            var message = new
            {
                type = "clipboard_update",
                data = new
                {
                    content = content
                }
            };
            string json = JsonSerializer.Serialize(message);
            return await SendMessageAsync(json, cancellationToken);
        }

        public async Task DisconnectAsync()
        {
            if (socket?.State == WebSocketState.Open)
            {
                try
                {
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Disconnecting", CancellationToken.None);
                }
                catch { }
            }
            
            isConnected = false;
            cancellationTokenSource?.Cancel();
            Disconnected?.Invoke(this, "Disconnected by user");
        }

        private async Task ListenForMessages(CancellationToken cancellationToken)
        {
            var buffer = new byte[BufferSize];
            messageBuffer.Clear();
            
            while (!cancellationToken.IsCancellationRequested && IsConnected)
            {
                try
                {
                    WebSocketReceiveResult result = await socket!.ReceiveAsync(new ArraySegment<byte>(buffer), cancellationToken);

                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        isConnected = false;
                        Disconnected?.Invoke(this, "Server closed connection");
                        break;
                    }
                    else if (result.MessageType == WebSocketMessageType.Text)
                    {
                        // Add received data to message buffer
                        messageBuffer.AddRange(buffer.Take(result.Count));
                        
                        // Check if message is complete
                        if (result.EndOfMessage)
                        {
                            try
                            {
                                string message = Encoding.UTF8.GetString(messageBuffer.ToArray());
                                messageBuffer.Clear();
                                
                                // Handle keepalive ping/pong
                                if (message == "{\"type\":\"ping\"}")
                                {
                                    await SendMessageAsync("{\"type\":\"pong\"}", cancellationToken);
                                    continue;
                                }
                                else if (message == "{\"type\":\"pong\"}")
                                {
                                    continue;
                                }

                                MessageReceived?.Invoke(this, message);
                            }
                            catch (Exception ex)
                            {
                                Error?.Invoke(this, $"Failed to process message: {ex.Message}");
                                messageBuffer.Clear(); // Clear buffer on error
                            }
                        }
                        else
                        {
                            // Message is fragmented, continue receiving
                            // Check if buffer is getting too large
                            if (messageBuffer.Count > BufferSize * 10) // 10x buffer size limit
                            {
                                Error?.Invoke(this, "Message too large, discarding");
                                messageBuffer.Clear();
                            }
                        }
                    }
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    isConnected = false;
                    Disconnected?.Invoke(this, ex.Message);
                    break;
                }
            }
        }

        public void Dispose()
        {
            if (!disposed)
            {
                cancellationTokenSource?.Cancel();
                socket?.Dispose();
                cancellationTokenSource?.Dispose();
                disposed = true;
            }
        }
    }
}
