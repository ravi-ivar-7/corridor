# Clipboard Sync - Windows Client

Native Windows application for real-time clipboard synchronization using WebSockets.

## Features

### Core Functionality
- **Real-time Sync**: Instant clipboard synchronization across devices
- **WebSocket Connection**: Direct connection to Cloudflare Worker
- **Auto-reconnect**: Automatic reconnection with exponential backoff
- **Offline Queuing**: Messages queued when offline, sent when reconnected
- **Single Token**: Simple token-based authentication

### User Experience
- **Minimal UI**: One-time setup, then tray-only operation
- **System Tray**: Status indicator and quick actions
- **Toast Notifications**: Optional Windows toast notifications
- **Auto-start**: Automatic startup with Windows
- **Silent Operation**: Runs in background without interruption

### Reliability
- **Connection Monitoring**: Visual status indicators
- **Error Handling**: Graceful handling of network issues
- **Message Persistence**: Survives app restarts
- **Fallback Mode**: HTTP polling when WebSocket fails
- **Auto-recovery**: Automatic WebSocket reconnection when available




## Configuration

### First Run Setup
1. **WebSocket URL**: `wss://clipboard-sync-worker.ravi404606.workers.dev/ws` (default)
2. **HTTPS Domain**: `sync.rkanin.com` (default) - for web interface
3. **Token**: Enter your clipboard sync token
4. **Notifications**: Choose Toast or Silent mode
5. **Auto-start**: Enable/disable startup with Windows

### Settings
- **Token Management**: Single token per installation
- **Notification Preferences**: Toast notifications or silent operation
- **Connection Settings**: Auto-reconnect, retry limits
- **Fallback Mode**: HTTP polling when WebSocket fails
- **Startup**: Windows startup folder integration

### Fallback Mechanism
When WebSocket connection fails:
1. **Retry Logic**: Exponential backoff (1s, 2s, 4s, 8s, 16s, 30s max)
2. **Message Queuing**: Store clipboard changes locally
3. **HTTP Polling**: Fallback to **Worker** HTTP API every 5-10 seconds
4. **Auto-recovery**: Switch back to WebSocket when available
5. **Bulk Sync**: Send all queued messages when reconnected

### Connection Architecture
- **Primary**: WebSocket → Cloudflare Worker (real-time)
- **Fallback**: HTTP → Cloudflare Worker (polling)
- **Benefits**: Single infrastructure, same domain, better performance




## Usage

### Initial Setup
1. Run `clipboard-sync.exe`
2. Enter WebSocket URL, api URL and token
3. Choose notification preferences 
4. Enable auto-start if desired
5. Click "Save & Connect"

### Tray Operations
- **Right-click tray icon**: Access menu
- **Status indicator**: Green (connected), Yellow (connecting), Red (error)
- **Quick actions**: Connect/Disconnect, Settings, Exit

### HTTP Polling API
When WebSocket fails, the client uses HTTP polling to the **same Worker**:
- **Get Clipboard**: `GET https://clipboard-sync-worker.ravi404606.workers.dev/api/clipboard/{token}`
- **Send Clipboard**: `POST https://clipboard-sync-worker.ravi404606.workers.dev/api/clipboard/{token}`
- **Polling Interval**: 5-10 seconds (configurable)
- **Timeout**: 30 seconds per request
- **Target**: Cloudflare Worker (same as WebSocket)

### Notifications
- **Toast Mode**: Windows toast notifications for sync events
- **Silent Mode**: Log-only(if debug is on), no UI notifications
- **Status Updates**: Connection state changes

## Architecture

### Components
- **WebSocket Client**: Real-time communication
- **Clipboard Monitor**: Windows clipboard hooks
- **Configuration Manager**: Settings and token storage
- **Tray Icon**: System tray interface
- **Notification Manager**: Toast/silent notifications

### Dependencies
- **.NET 9.0**: Modern C# runtime and framework
- **System.Net.WebSockets**: Built-in WebSocket client
- **System.Text.Json**: Native JSON parsing
- **System.Windows.Forms**: GUI and system integration
- **Microsoft.Win32**: Registry access for auto-start



### Code Structure
```
sync-v2/windows/
├── src/
│   ├── Core/
│   │   ├── ClipboardSyncClient.cs        # Main application class
│   │   ├── ConnectionManager.cs          # Unified connection management
│   │   └── MessageQueue.cs               # Offline message queuing
│   ├── Network/
│   │   ├── WebSocketClient.cs            # WebSocket connection handler
│   │   ├── HttpClient.cs                 # HTTP fallback client
│   │   └── ConnectionState.cs            # Connection state management
│   ├── System/
│   │   ├── ClipboardMonitor.cs          # Windows clipboard hooks
│   │   ├── TrayIconManager.cs            # System tray interface
│   │   ├── NotificationManager.cs        # Toast notifications
│   │   └── AutoStartManager.cs           # Windows startup management
│   ├── UI/
│   │   ├── SetupWindow.cs                # Initial setup window
│   │   ├── SettingsDialog.cs             # Settings dialog
│   │   ├── AboutDialog.cs                # About dialog
│   │   └── TrayContextMenu.cs            # Tray context menu
│   ├── Storage/
│   │   ├── ConfigManager.cs              # Configuration persistence
│   │   ├── MessageStorage.cs             # Local message storage
│   │   └── DatabaseManager.cs             # SQLite database wrapper
│   ├── Utils/
│   │   ├── Logger.cs                      # Logging system
│   │   ├── CryptoUtils.cs                # Encryption utilities
│   │   ├── StringUtils.cs                # String helpers
│   │   └── FileUtils.cs                  # File operations
│   └── Protocols/
│       ├── ClipboardProtocol.cs          # Message protocol definitions
│       └── MessageParser.cs               # JSON message parsing
├── Resources/
│   ├── Icons/
│   │   ├── tray_connected.ico
│   │   ├── tray_connecting.ico
│   │   ├── tray_error.ico
│   │   └── app_icon.ico
│   └── Strings/
│       └── Resources.resx                 # Localized strings
├── Tests/
│   ├── Unit/
│   │   ├── WebSocketClientTests.cs
│   │   ├── ClipboardMonitorTests.cs
│   │   └── ConfigManagerTests.cs
│   └── Integration/
│       ├── ConnectionFlowTests.cs
│       └── FallbackMechanismTests.cs
├── Program.cs                             # Current working console version
├── Program-working.cs                     # Backup of working console version
├── ClipboardClient.csproj                 # Project file
├── app.config                            # Application configuration
├── README.md
└── bin/
    ├── Debug/
    └── Release/
```


taskkill /F /IM ClipboardClient.exe