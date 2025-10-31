# Corridor Linux Client

Real-time clipboard synchronization for Linux.

## Features

- **Real-time clipboard sync** - Copy on Linux, paste on Windows/Android/Web (and vice versa)
- **System tray integration** - Quick access and controls
- **Desktop notifications** - Configurable notification settings
- **Clipboard history** - View and manage clipboard history
- **Auto-start on boot** - systemd integration for automatic startup
- **Silent mode** - Run without UI notifications
- **Wayland & X11 support** - Works with modern and traditional display servers

## Architecture Overview

### Technology Stack

- **Python 3.8+** - Core language
- **PyQt5/PyQt6** - GUI framework and system tray
- **websockets** - WebSocket client for real-time sync
- **requests** - HTTP API client
- **pyperclip/pyclip** - Cross-platform clipboard access
- **python-daemon** - Background service management

### Project Structure

```
linux/
├── src/
│   ├── main.py              # Application entry point
│   ├── config_manager.py    # Configuration management (JSON config)
│   ├── websocket_client.py  # WebSocket connection handler
│   ├── clipboard_manager.py # Clipboard monitoring and updates
│   ├── notification.py      # Desktop notification system
│   └── ui/
│       ├── setup_window.py  # Initial configuration dialog
│       ├── main_window.py   # Main application window (optional)
│       └── tray_icon.py     # System tray icon and menu
├── resources/
│   └── icons/              # Application icons (SVG/PNG)
├── scripts/
│   ├── build.sh            # Build and package script
│   ├── install.sh          # System installation script
│   └── uninstall.sh        # Uninstallation script
├── corridor.service        # systemd service file
├── requirements.txt        # Python dependencies
├── setup.py               # Python package setup
└── README.md              # This file
```

## Communication Protocol

### WebSocket Protocol

The client communicates with the Corridor server via WebSocket using JSON messages:

**Connection:**
- URL: `wss://corridor-worker.corridor-sync.workers.dev/ws?token=YOUR_TOKEN`
- Protocol: WebSocket (wss://)

**Message Types:**

1. **Clipboard Update** (Send/Receive)
```json
{
  "type": "clipboard_update",
  "data": {
    "content": "clipboard text content",
    "timestamp": 1234567890,
    "id": "unique_message_id"
  }
}
```

2. **Ping/Pong** (Keep-Alive)
```json
{
  "type": "ping"
}
```
```json
{
  "type": "pong"
}
```

3. **Clipboard History** (Receive)
```json
{
  "type": "clipboard_history",
  "history": [
    {
      "id": "msg_id",
      "content": "text",
      "timestamp": 1234567890
    }
  ]
}
```

4. **Error Messages** (Receive)
```json
{
  "type": "error",
  "error": "error message"
}
```

### HTTP API

Optional HTTP endpoints for non-realtime operations:
- Base URL: `https://corridor-worker.corridor-sync.workers.dev/api`
- Authentication: Token-based (passed as URL parameter or header)

## Development Approach

### Phase 1: Core Functionality (MVP)

1. **Configuration Management**
   - JSON config file in `~/.config/corridor/config.json`
   - Store: token, WebSocket URL, HTTP URL, mode (silent/interactive)
   - Create ConfigManager class

2. **WebSocket Client**
   - Connect with auto-reconnect logic
   - Send clipboard updates
   - Receive remote updates
   - Ping/pong keep-alive (30s interval)
   - Handle connection errors gracefully

3. **Clipboard Manager**
   - Monitor local clipboard changes
   - Update local clipboard from remote
   - Prevent feedback loops (ignore self-updates)
   - Support for text content (images in Phase 2)

4. **CLI Mode (No GUI)**
   - Command-line configuration
   - Background service
   - Logging to file/systemd journal

### Phase 2: GUI & User Experience

5. **Setup Window**
   - First-run configuration dialog
   - Input: Token, server URLs
   - Mode selection: Interactive vs Silent
   - Auto-start configuration

6. **System Tray Icon**
   - Status indicator (connected/disconnected)
   - Right-click menu:
     - Start/Stop sync
     - View history
     - Settings
     - About
     - Quit

7. **Desktop Notifications**
   - Configurable notifications:
     - On local clipboard copy
     - On remote clipboard update
     - On connection errors
   - Use libnotify / notify-send

### Phase 3: Advanced Features

8. **Clipboard History**
   - Store last 100 items locally
   - History viewer window
   - Search and filter
   - Copy from history

9. **Auto-Start Integration**
   - systemd user service
   - Auto-start on login
   - Enable/disable from UI

10. **Single Instance Prevention**
    - Use lock file or D-Bus
    - Prevent duplicate processes

### Phase 4: Packaging & Distribution

11. **Build System**
    - PyInstaller for standalone executable
    - .deb package for Debian/Ubuntu
    - .rpm package for Fedora/RHEL
    - Flatpak for universal Linux
    - AppImage for portable executable

12. **Installation Script**
    - Automated installation
    - systemd service setup
    - Desktop entry creation

## Prerequisites

### Runtime Requirements

- **Python 3.8+**
- **X11 or Wayland** display server
- **D-Bus** (for notifications)
- **systemd** (for auto-start, optional)

### Dependencies

```bash
# Core dependencies
python3-pip
python3-venv
python3-dev

# GUI dependencies (if using PyQt)
python3-pyqt5
python3-pyqt5.qtwebsockets

# System dependencies
libnotify-bin  # For notifications
xclip         # For X11 clipboard (alternative: xsel)
wl-clipboard  # For Wayland clipboard
```

## Installation

### Option 1: From Source (Development)

```bash
cd linux

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python src/main.py
```

### Option 2: System Installation (Future)

```bash
cd linux
sudo ./scripts/install.sh
```

### Option 3: Package Manager (Future)

```bash
# Debian/Ubuntu
sudo apt install corridor

# Fedora/RHEL
sudo dnf install corridor

# Flatpak
flatpak install corridor
```

## Configuration

### Configuration File

Location: `~/.config/corridor/config.json`

```json
{
  "token": "your_room_token",
  "websocket_url": "wss://corridor-worker.corridor-sync.workers.dev/ws",
  "http_url": "https://corridor-worker.corridor-sync.workers.dev/api",
  "mode": "interactive",
  "auto_start": true,
  "notifications": {
    "local_copy": false,
    "remote_update": true,
    "errors": true
  },
  "clipboard": {
    "monitor_interval": 500,
    "history_size": 100
  }
}
```

### Command Line Options

```bash
# Normal mode with GUI
corridor

# Silent mode (no GUI)
corridor --silent

# Background mode (daemon)
corridor --daemon

# Configure token
corridor --setup

# Show version
corridor --version

# Enable debug logging
corridor --debug
```

## systemd Integration

### User Service

Create `~/.config/systemd/user/corridor.service`:

```ini
[Unit]
Description=Corridor Clipboard Sync Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/corridor --daemon
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
```

### Enable Auto-Start

```bash
# Enable service
systemctl --user enable corridor.service

# Start service
systemctl --user start corridor.service

# Check status
systemctl --user status corridor.service

# View logs
journalctl --user -u corridor.service -f
```

## Development Roadmap

### Milestone 1: CLI Prototype (Week 1-2)
- [ ] Config manager implementation
- [ ] WebSocket client with reconnection
- [ ] Basic clipboard monitoring (X11)
- [ ] CLI interface
- [ ] Background daemon mode

### Milestone 2: GUI Implementation (Week 3-4)
- [ ] Setup window (PyQt5)
- [ ] System tray icon
- [ ] Notification system
- [ ] Settings dialog
- [ ] About dialog

### Milestone 3: Advanced Features (Week 5-6)
- [ ] Clipboard history viewer
- [ ] Wayland support
- [ ] systemd integration
- [ ] Single instance prevention
- [ ] Error handling improvements

### Milestone 4: Packaging (Week 7-8)
- [ ] PyInstaller build script
- [ ] .deb package
- [ ] .rpm package
- [ ] Flatpak manifest
- [ ] AppImage creation
- [ ] Installation scripts

## Implementation Notes

### Clipboard Access

**X11 (Traditional):**
```python
import pyperclip

# Read clipboard
text = pyperclip.paste()

# Write clipboard
pyperclip.copy("text")
```

**Wayland (Modern):**
```python
import subprocess

# Read clipboard
result = subprocess.run(['wl-paste'], capture_output=True, text=True)
text = result.stdout

# Write clipboard
subprocess.run(['wl-copy'], input="text", text=True)
```

### WebSocket Connection

```python
import asyncio
import websockets
import json

async def connect():
    url = f"wss://server/ws?token={token}"
    async with websockets.connect(url) as ws:
        # Send clipboard update
        await ws.send(json.dumps({
            "type": "clipboard_update",
            "data": {"content": "text"}
        }))

        # Receive updates
        async for message in ws:
            data = json.loads(message)
            if data["type"] == "clipboard_update":
                update_clipboard(data["data"]["content"])
```

### System Tray (PyQt5)

```python
from PyQt5.QtWidgets import QSystemTrayIcon, QMenu, QAction
from PyQt5.QtGui import QIcon

tray = QSystemTrayIcon(QIcon("icon.png"))
menu = QMenu()
menu.addAction("Start Sync")
menu.addAction("Settings")
menu.addAction("Quit")
tray.setContextMenu(menu)
tray.show()
```

## Alternative Tech Stacks

If Python doesn't meet your requirements, consider:

### Option 1: Go + Fyne
- **Pros:** Compiled binary, fast, modern UI, easy cross-compilation
- **Cons:** Larger binary size, newer ecosystem
- **Tools:** Fyne for GUI, gorilla/websocket for WebSocket

### Option 2: Rust + GTK
- **Pros:** Maximum performance, memory safety, small binary
- **Cons:** Steeper learning curve, more boilerplate
- **Tools:** gtk-rs for GUI, tokio-tungstenite for WebSocket

### Option 3: Electron/Tauri + React
- **Pros:** Reuse web app code, rich UI capabilities
- **Cons:** Larger size (Electron), more resource intensive
- **Tools:** Tauri (recommended over Electron for size)

### Option 4: C++ + Qt
- **Pros:** Native performance, Qt is mature and feature-rich
- **Cons:** More verbose, memory management complexity
- **Tools:** Qt Framework, QtWebSockets

## Testing Strategy

### Unit Tests
- Config manager
- WebSocket message parsing
- Clipboard operations
- Notification system

### Integration Tests
- End-to-end sync between devices
- Reconnection handling
- Error scenarios

### Distribution Testing
- Test on Ubuntu 20.04+, 22.04, 24.04
- Test on Fedora 38+
- Test on Arch Linux
- Test on X11 and Wayland

## Contributing

When developing:
1. Follow PEP 8 style guide
2. Add type hints (Python 3.8+ syntax)
3. Write docstrings for public functions
4. Add unit tests for new features
5. Test on multiple distributions

## Security Considerations

1. **Configuration Storage:** Store config file with 0600 permissions (user-only)
2. **Token Security:** Never log the full token
3. **WebSocket TLS:** Always use wss:// (not ws://)
4. **Clipboard Privacy:** Respect user privacy, don't log clipboard content
5. **Network Errors:** Handle gracefully, don't expose internals

## Performance Targets

- **Clipboard Monitor:** < 1% CPU when idle
- **Memory Usage:** < 50 MB resident
- **Sync Latency:** < 500ms for text under 10KB
- **Reconnect Time:** < 5s after network recovery

## Troubleshooting

### Common Issues

**1. Clipboard not syncing**
```bash
# Check if service is running
systemctl --user status corridor

# Check logs
journalctl --user -u corridor -f

# Test clipboard access
xclip -o -selection clipboard  # X11
wl-paste                        # Wayland
```

**2. WebSocket connection fails**
- Verify internet connection
- Check token is correct
- Verify server URL is accessible
- Check firewall settings

**3. System tray icon not showing**
- Ensure system tray is enabled in desktop environment
- Check if AppIndicator support is installed
- Try restarting the application

## License

[Specify your license here]

## Support

- GitHub Issues: [Your repo URL]
- Documentation: [Your docs URL]
- Community: [Discord/Forum URL]

## Related Projects

- [Windows Client](../windows/) - .NET/C# Windows desktop application
- [Android App](../android/) - Kotlin Android application
- [Web App](../server/web/) - Next.js web interface
