# Clipboard Sync v2 - Real-time WebSocket Edition

A modern, real-time clipboard synchronization solution built with Cloudflare Workers, WebSockets, and Durable Storage.

## 🚀 Features

- **Real-time Synchronization**: WebSocket-based instant clipboard sync
- **Cloudflare Infrastructure**: Serverless, global, and scalable
- **Cross-platform**: Windows client + Web interface
- **No Polling**: True real-time communication
- **Persistent Storage**: Durable Objects for reliable data persistence
- **Token-based Security**: Simple authentication without accounts

## 🏗️ Architecture

```
Windows Client ←→ WebSocket ←→ Cloudflare Worker ←→ Durable Storage
Web Interface ←→ WebSocket ←→ Cloudflare Worker ←→ Durable Storage
```

### Components

1. **Cloudflare Worker**: WebSocket server with Durable Objects
2. **Cloudflare Pages**: Static web interface
3. **Windows Client**: Native WebSocket client
4. **Durable Storage**: Persistent clipboard history

## 📁 Project Structure

```
clipboard-sync-v2/
├── server/                # Cloudflare server infrastructure
│   ├── worker/            # WebSocket Worker backend
│   │   ├── src/
│   │   │   ├── index.ts       # Main worker entry point
│   │   │   ├── durable-object.ts # Durable Object for WebSocket handling
│   │   │   └── types.ts       # TypeScript definitions
│   │   ├── wrangler.toml      # Cloudflare Worker configuration
│   │   └── package.json
│   └── web/             # Next.js web interface
│       ├── src/
│       │   ├── components/    # Next.js components
│       │   ├── hooks/        # Custom React hooks
│       │   ├── utils/        # Utility functions
│       │   └── app/          # Next.js App Router
│       ├── public/
│       ├── package.json
│       └── next.config.js    # Next.js configuration
├── windows/               # Windows native client
│   ├── src/
│   │   ├── main.cpp      # Main client application
│   │   ├── websocket.cpp # WebSocket implementation
│   │   └── clipboard.cpp # Clipboard handling
│   ├── CMakeLists.txt
│   └── README.md
├── android/               # Android native client(later)
│   ├── app/
│   │   ├── src/main/java/ # Kotlin/Java source
│   │   └── src/main/res/  # Android resources
│   ├── build.gradle
│   └── README.md
├── ios/                   # iOS native client (later)
│   ├── ClipboardSync/
│   │   ├── Sources/       # Swift source
│   │   └── Resources/     # iOS resources
│   ├── Package.swift
│   └── README.md
└── README.md
```