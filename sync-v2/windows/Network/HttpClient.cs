using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace ClipboardSyncClient.Network
{
    public class ClipboardHttpClient
    {
        private readonly System.Net.Http.HttpClient httpClient;
        private readonly string baseUrl;

        public ClipboardHttpClient(string baseUrl)
        {
            this.baseUrl = baseUrl;
            httpClient = new System.Net.Http.HttpClient
            {
                Timeout = TimeSpan.FromSeconds(30)
            };
        }

        public async Task<string?> GetClipboardAsync(string token, CancellationToken cancellationToken = default)
        {
            try
            {
                string url = $"{baseUrl}/clipboard/{token}";
                HttpResponseMessage response = await httpClient.GetAsync(url, cancellationToken);
                
                if (response.IsSuccessStatusCode)
                {
                    string content = await response.Content.ReadAsStringAsync(cancellationToken);
                    using var doc = JsonDocument.Parse(content);
                    var root = doc.RootElement;
                    
                    if (root.TryGetProperty("data", out var dataElement) &&
                        dataElement.TryGetProperty("content", out var contentElement))
                    {
                        return contentElement.GetString();
                    }
                }
                
                return null;
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> SendClipboardAsync(string token, string content, CancellationToken cancellationToken = default)
        {
            try
            {
                string url = $"{baseUrl}/clipboard/{token}";
                var message = new
                {
                    type = "clipboard_update",
                    data = new
                    {
                        content = content
                    }
                };
                
                string json = JsonSerializer.Serialize(message);
                StringContent stringContent = new StringContent(json, Encoding.UTF8, "application/json");
                
                HttpResponseMessage response = await httpClient.PostAsync(url, stringContent, cancellationToken);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public void Dispose()
        {
            httpClient?.Dispose();
        }
    }
}
