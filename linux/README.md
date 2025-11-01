# Corridor - Rust Edition

Production-ready clipboard synchronization for Linux. Fast, lightweight, and reliable.

## Features

✅ **Event-based clipboard monitoring** - Instant detection (<10ms latency)
✅ **Real-time WebSocket sync** - Synchronized across all devices
✅ **System tray integration** - Quick access and status
✅ **Clipboard history** - Last 100 items saved
✅ **Desktop notifications** - Configurable alerts
✅ **Auto-reconnect** - Resilient connection handling
✅ **Single binary** - No runtime dependencies
✅ **Tiny footprint** - ~5MB binary, <15MB RAM

## Installation

### Build from Source

```bash
# Build release binary
cargo build --release

# Binary location
./target/release/corridor

# Optional: Install system-wide
sudo cp target/release/corridor /usr/local/bin/
```

### First Run

Create config file at `~/.config/corridor/config.json`:

```json
{
  "token": "your-room-token",
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
    "history_size": 100
  }
}
```

## Usage

```bash
# Run corridor
./corridor

# Run in silent mode (edit config.json: mode: "silent")
./corridor

# View logs
RUST_LOG=debug ./corridor
```

## System Tray

Right-click the tray icon for:
- Connection status
- Recent clipboard items (click to copy)
- View full history
- Clear history
- Quit

## Configuration

### Config File Location
`~/.config/corridor/config.json`

### History File Location
`~/.config/corridor/history.json`

### Available Modes
- `interactive`: System tray + notifications
- `silent`: Background only, no UI

## Auto-Start

Create systemd user service:

```bash
mkdir -p ~/.config/systemd/user

cat > ~/.config/systemd/user/corridor.service <<EOF
[Unit]
Description=Corridor Clipboard Sync
After=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/corridor
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
EOF

# Enable and start
systemctl --user enable corridor.service
systemctl --user start corridor.service

# Check status
systemctl --user status corridor.service
```

## Architecture

```
corridor/
├── src/
│   ├── main.rs          # Application entry point
│   ├── config.rs        # Configuration management
│   ├── history.rs       # Clipboard history storage
│   ├── clipboard.rs     # Event-based clipboard monitoring
│   ├── websocket.rs     # WebSocket client with auto-reconnect
│   └── tray.rs          # System tray integration
├── Cargo.toml           # Dependencies
└── README.md
```

## Performance

| Metric | Value |
|--------|-------|
| Binary Size | ~5MB |
| Memory Usage | 10-15MB |
| Startup Time | <100ms |
| Clipboard Latency | <10ms (event-based) |
| CPU Usage (idle) | <0.1% |

## Comparison with Python Version

| Feature | Python | Rust |
|---------|--------|------|
| Binary Size | 100-200MB | 5MB |
| Memory | 50-100MB | 10-15MB |
| Clipboard Detection | Polling (500ms) | Events (<10ms) |
| Dependencies | Python + pip packages | None |
| Startup | 2-3s | <100ms |
| Distribution | Complex | Single file |

## Troubleshooting

### Clipboard not working
The app uses `arboard` which requires X11 or Wayland. Ensure you're running a display server.

### System tray not showing
Install a system tray provider:
```bash
# GNOME
sudo apt install gnome-shell-extension-appindicator

# KDE - built-in

# Other DE - check documentation
```

### Connection issues
Check logs:
```bash
RUST_LOG=debug ./corridor
```

## License

MIT

## Credits

Built with:
- [arboard](https://github.com/1Password/arboard) - Clipboard access
- [clipboard-master](https://github.com/DoumanAsh/clipboard-master) - Clipboard events
- [tokio](https://tokio.rs/) - Async runtime
- [ksni](https://github.com/iovxw/ksni) - System tray
- [notify-rust](https://github.com/hoodie/notify-rust) - Desktop notifications
