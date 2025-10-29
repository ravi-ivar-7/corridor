# Clipboard Sync - Real-time Cross-Device Synchronization

A modern, real-time clipboard synchronization solution built with Cloudflare Workers, WebSockets, and a native Windows client.

## 🚀 Features

- **Real-time Synchronization**: WebSocket-based instant clipboard sync
- **Cloudflare Infrastructure**: Serverless, global, and scalable
- **Cross-platform**: Windows client + Web interface
- **Dual Communication**: WebSocket + HTTP API fallback
- **Persistent Storage**: Durable Objects for reliable data persistence
- **Token-based Security**: Simple authentication without accounts
- **Silent Operation**: Background mode with system tray integration

## 🏗️ Architecture

```
Windows Client (C#) ←→ WebSocket/HTTP ←→ Cloudflare Worker ←→ Durable Storage
Web Interface (Next.js) ←→ WebSocket ←→ Cloudflare Worker ←→ Durable Storage
```

### Components

1. **Cloudflare Worker**: WebSocket server with Durable Objects and HTTP API
2. **Next.js Web App**: Modern web interface with real-time sync
3. **Windows Client (Corridor)**: Native C# application with system tray
4. **Durable Storage**: Persistent clipboard history and room management

## 📁 Project Structure

```
sync/
├── server/                    # Cloudflare server infrastructure
│   ├── worker/               # WebSocket Worker backend
│   │   ├── src/
│   │   │   ├── index.ts              # Main worker entry point
│   │   │   ├── durable-object.ts     # Durable Object for WebSocket handling
│   │   │   ├── types.ts              # TypeScript definitions
│   │   │   └── handlers/             # Modular request handlers
│   │   │       ├── api-handler.ts    # HTTP API endpoints
│   │   │       ├── websocket-handler.ts # WebSocket management
│   │   │       └── room-manager.ts   # Room/token management
│   │   ├── wrangler.toml             # Cloudflare Worker configuration
│   │   └── package.json
│   └── web/                  # Next.js web interface
│       ├── src/
│       │   ├── app/                  # Next.js App Router
│       │   │   ├── [token]/          # Token-based rooms
│       │   │   ├── about/            # About page
│       │   │   └── blogs/            # Documentation pages
│       │   ├── components/           # React components
│       │   │   ├── ClipboardHistory.tsx
│       │   │   ├── ClipboardInput.tsx
│       │   │   ├── ConnectionStatus.tsx
│       │   │   └── TokenInput.tsx
│       │   └── hooks/                # Custom React hooks
│       │       └── useWebSocket.ts
│       ├── public/                   # Static assets
│       ├── package.json
│       └── next.config.ts
├── windows/                  # Windows native client (C#)
│   ├── Core/                # Core functionality
│   │   ├── ConfigManager.cs         # Configuration management
│   │   ├── ConnectionManager.cs     # Network connection handling
│   │   ├── HotkeyManager.cs         # Global hotkey support
│   │   └── MessageQueue.cs          # Message queuing system
│   ├── Network/             # Network communication
│   │   ├── HttpClient.cs            # HTTP client implementation
│   │   └── WebSocketClient.cs       # WebSocket client
│   ├── UI/                  # User interface
│   │   ├── MainApplication.cs       # Main application window
│   │   ├── SetupWindow.cs           # Initial setup dialog
│   │   ├── AboutDialog.cs           # About dialog
│   │   └── NotificationManager.cs   # System notifications
│   ├── Resources/           # Application resources
│   │   └── Icons/          # Application icons
│   ├── scripts/            # Build and deployment scripts
│   ├── Program.cs          # Application entry point
│   ├── Corridor.csproj     # C# project configuration
│   └── README.md
├── vercel.json             # Vercel deployment configuration
├── package.json            # Root package configuration
└── README.md
```

## 🚀 Quick Start

### 1. Deploy the Cloudflare Worker

```bash
# Install dependencies
npm install

# Deploy the worker
npm run deploy:worker
```

### 2. Deploy the Web Interface

```bash
# Deploy to Vercel
vercel --prod
```

### 3. Build the Windows Client

```bash
# Build optimized executable
npm run build:windows
```

## 📱 Usage

### Web Interface
1. Visit your deployed web app
2. Enter a token to create/join a room
3. Start copying and pasting - it syncs in real-time!

### Windows Client (Corridor)
1. Run `Corridor.exe` from the `windows/publish/` directory
2. Configure your settings in the setup window
3. Choose normal mode (with GUI) or silent mode (background only)
4. Your clipboard will sync automatically!

## 🛠️ Development

### Prerequisites
- Node.js 18+
- .NET 9.0 SDK (for Windows client)
- Cloudflare account (for worker deployment)

### Local Development

```bash
# Start web interface
npm run dev

# Start worker in development
npm run dev:worker

# Build Windows client
npm run build:windows
```

## 🔧 Configuration

### Environment Variables (Worker)
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `WORKER_NAME`: Name for your worker
- `CUSTOM_DOMAIN`: Custom domain (optional)
- `CLOUDFLARE_API_TOKEN`: API token for deployment

### Windows Client Settings
- WebSocket URL: `wss://your-worker.workers.dev/ws`
- HTTP URL: `https://your-worker.workers.dev`
- Token: Your room token
- Silent Mode: Run in background without GUI