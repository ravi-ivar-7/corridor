export function handleLandingPage(env?: any): Response {
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
            color: #1e293b;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
        }
        .status {
            display: inline-flex;
            align-items: center;
            background: #dcfce7;
            color: #166534;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            border: 1px solid #bbf7d0;
        }
        .status::before {
            content: '●';
            color: #22c55e;
            margin-right: 0.5rem;
            font-size: 0.75rem;
        }
        .logo {
            font-size: 3.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 1rem;
        }
        .subtitle {
            font-size: 1.25rem;
            color: #64748b;
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        .card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 1rem;
            padding: 2rem;
            border: 1px solid rgba(226, 232, 240, 0.5);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
        }
        .card h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
        }
        .card h2::before {
            content: '';
            width: 4px;
            height: 1.5rem;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 2px;
            margin-right: 0.75rem;
        }
        .feature {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 0.75rem;
            border: 1px solid #e2e8f0;
        }
        .feature h3 {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }
        .feature p {
            color: #64748b;
            font-size: 0.875rem;
        }
        .links {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin-top: 1.5rem;
        }
        .link {
            display: inline-flex;
            align-items: center;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 0.875rem;
            transition: all 0.3s ease;
            border: 1px solid transparent;
        }
        .link:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        .link.secondary {
            background: white;
            color: #3b82f6;
            border: 1px solid #e2e8f0;
        }
        .link.secondary:hover {
            background: #f8fafc;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .api-info {
            background: #1e293b;
            color: #e2e8f0;
            border-radius: 0.75rem;
            padding: 1.5rem;
            font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
            overflow-x: auto;
        }
        .api-info strong {
            color: #60a5fa;
        }
        .steps {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
        }
        .step {
            display: flex;
            align-items: flex-start;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 0.75rem;
            border: 1px solid #e2e8f0;
        }
        .step-number {
            width: 2rem;
            height: 2rem;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.875rem;
            margin-right: 1rem;
            flex-shrink: 0;
        }
        .step-content {
            flex: 1;
        }
        .step-content p {
            color: #64748b;
            font-size: 0.875rem;
            margin: 0;
        }
        .step-content a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 600;
        }
        .step-content a:hover {
            text-decoration: underline;
        }
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            .logo {
                font-size: 2.5rem;
            }
            .subtitle {
                font-size: 1.125rem;
            }
            .grid {
                grid-template-columns: 1fr;
            }
            .links {
                flex-direction: column;
            }
            .link {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="status">ONLINE</div>
            <h1 class="logo">Corridor</h1>
            <p class="subtitle">Real-time clipboard synchronization across devices</p>
        </div>

        <div class="grid">
            <div class="card">
                <h2>Features</h2>
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
                <h2>Quick Links</h2>
                <div class="links">
                    <a href="${env?.APP_URL || 'https://corridor-web.vercel.app'}" class="link">🌐 Web App</a>
                    <a href="${env?.APP_URL || 'https://corridor-web.vercel.app'}/downloads" class="link secondary">📱 Windows Client</a>
                    <a href="/health" class="link secondary">❤️ Health Check</a>
                </div>
            </div>

            <div class="card">
                <h2>API Endpoints</h2>
                <div class="api-info">
                    <strong>WebSocket:</strong> wss://corridor-worker.corridor-sync.workers.dev/ws?token=YOUR_TOKEN<br><br>
                    <strong>HTTP API:</strong> https://corridor-worker.corridor-sync.workers.dev/api/clipboard/YOUR_TOKEN<br><br>
                    <strong>Health:</strong> https://corridor-worker.corridor-sync.workers.dev/health
                </div>
            </div>

            <div class="card">
                <h2>How to Use</h2>
                <div class="steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <p>Visit the <a href="${env?.APP_URL || 'https://corridor-web.vercel.app'}">web app</a> or download the Windows client</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <p>Create or enter a token to join a clipboard room</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <p>Start copying and pasting - it syncs in real-time!</p>
                        </div>
                    </div>
                </div>
            </div>
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
