export function handleLandingPage(): Response {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Corridor - Real-time Clipboard Sync</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            max-width: 800px;
            padding: 2rem;
            text-align: center;
        }
        .logo { font-size: 3rem; font-weight: bold; margin-bottom: 1rem; }
        .subtitle { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
        .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            margin: 2rem 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .feature { margin: 1rem 0; }
        .feature h3 { margin-bottom: 0.5rem; }
        .links { margin-top: 2rem; }
        .link {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            padding: 0.8rem 1.5rem;
            border-radius: 10px;
            margin: 0.5rem;
            transition: all 0.3s ease;
        }
        .link:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        .api-info {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            padding: 1rem;
            margin: 1rem 0;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }
        .status { 
            display: inline-block;
            background: #4ade80;
            color: #065f46;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status">🟢 ONLINE</div>
        <h1 class="logo">Corridor</h1>
        <p class="subtitle">Real-time clipboard synchronization across devices</p>
        
        <div class="card">
            <h2>🚀 Features</h2>
            <div class="feature">
                <h3>Real-time Sync</h3>
                <p>Instant clipboard synchronization across all your devices</p>
            </div>
            <div class="feature">
                <h3>WebSocket & HTTP</h3>
                <p>Dual communication protocols for maximum reliability</p>
            </div>
            <div class="feature">
                <h3>Token-based Security</h3>
                <p>Secure, isolated clipboard rooms with simple token authentication</p>
            </div>
            <div class="feature">
                <h3>Cross-platform</h3>
                <p>Works on Windows, Web, and any device with a browser</p>
            </div>
        </div>

        <div class="card">
            <h2>🔗 Quick Links</h2>
            <div class="links">
                <a href="https://corridor-web.vercel.app" class="link">🌐 Web App</a>
                <a href="https://github.com/yourusername/corridor" class="link">📱 Windows Client</a>
                <a href="/health" class="link">❤️ Health Check</a>
            </div>
        </div>

        <div class="card">
            <h2>🔧 API Endpoints</h2>
            <div class="api-info">
                <strong>WebSocket:</strong> wss://corridor-worker.corridor-sync.workers.dev/ws?token=YOUR_TOKEN<br>
                <strong>HTTP API:</strong> https://corridor-worker.corridor-sync.workers.dev/api/clipboard/YOUR_TOKEN<br>
                <strong>Health:</strong> https://corridor-worker.corridor-sync.workers.dev/health
            </div>
        </div>

        <div class="card">
            <h2>📖 How to Use</h2>
            <p>1. Visit the <a href="https://corridor-web.vercel.app" style="color: #93c5fd;">web app</a> or download the Windows client</p>
            <p>2. Create or enter a token to join a clipboard room</p>
            <p>3. Start copying and pasting - it syncs in real-time!</p>
        </div>
    </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
