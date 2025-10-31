# Corridor Linux Client - Quick Start Guide

Get Corridor running on Linux in 3 simple steps!

## For End Users (AppImage - Recommended)

### Step 1: Download
Download the AppImage from: https://your-website.com/downloads

```bash
wget https://your-website.com/Corridor-x86_64.AppImage
```

### Step 2: Make Executable
```bash
chmod +x Corridor-x86_64.AppImage
```

### Step 3: Setup & Run
```bash
# Run setup wizard
./Corridor-x86_64.AppImage --setup

# Start Corridor
./Corridor-x86_64.AppImage
```

**That's it!** Your clipboard will now sync across all your devices.

---

## Installation (Optional)

If you want to install system-wide:

```bash
# Copy to system binaries
sudo cp Corridor-x86_64.AppImage /usr/local/bin/corridor
sudo chmod +x /usr/local/bin/corridor

# Now you can run from anywhere
corridor --setup
corridor
```

---

## Auto-Start on Login

To start Corridor automatically when you log in:

```bash
# Enable systemd user service
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/corridor.service <<EOF
[Unit]
Description=Corridor Clipboard Sync
After=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/corridor --daemon
Restart=on-failure

[Install]
WantedBy=default.target
EOF

# Enable and start service
systemctl --user daemon-reload
systemctl --user enable corridor
systemctl --user start corridor

# Check status
systemctl --user status corridor
```

---

## Usage Examples

### Basic Usage
```bash
# Interactive mode (with notifications)
corridor

# Silent mode (no notifications)
corridor --silent

# Background daemon
corridor --daemon
```

### Setup & Configuration
```bash
# Run setup wizard
corridor --setup

# Configuration file location
~/.config/corridor/config.json
```

### Monitoring
```bash
# Check if running
ps aux | grep corridor

# View logs (if using systemd)
journalctl --user -u corridor -f

# Stop service
systemctl --user stop corridor
```

---

## Troubleshooting

### Clipboard Not Syncing

**Check if Corridor is running:**
```bash
ps aux | grep corridor
```

**Check clipboard access:**
```bash
# For X11
xclip -o -selection clipboard

# For Wayland
wl-paste
```

**Install clipboard tools if missing:**
```bash
# Ubuntu/Debian
sudo apt install xclip wl-clipboard

# Fedora
sudo dnf install xclip wl-clipboard

# Arch
sudo pacman -S xclip wl-clipboard
```

### Connection Issues

**Test network connectivity:**
```bash
ping -c 3 corridor-worker.corridor-sync.workers.dev
```

**Check configuration:**
```bash
cat ~/.config/corridor/config.json
```

**Verify token is correct:**
Make sure your token matches across all devices.

### Notifications Not Showing

**Install libnotify:**
```bash
# Ubuntu/Debian
sudo apt install libnotify-bin

# Fedora
sudo dnf install libnotify

# Arch
sudo pacman -S libnotify
```

**Test notifications:**
```bash
notify-send "Test" "This is a test notification"
```

---

## System Requirements

- **OS**: Any modern Linux distribution
  - Ubuntu 20.04+
  - Fedora 35+
  - Debian 11+
  - Arch Linux (latest)
  - Linux Mint 20+
  - etc.
- **Display Server**: X11 or Wayland
- **Python**: 3.8+ (bundled in AppImage)
- **Dependencies** (optional, for system integration):
  - `xclip` or `wl-clipboard` (clipboard access)
  - `libnotify-bin` (desktop notifications)

---

## Configuration File

Location: `~/.config/corridor/config.json`

```json
{
  "token": "your-room-token",
  "websocket_url": "wss://corridor-worker.corridor-sync.workers.dev/ws",
  "http_url": "https://corridor-worker.corridor-sync.workers.dev/api",
  "mode": "interactive",
  "auto_start": false,
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

**Settings:**
- `token`: Your unique room identifier
- `mode`: "interactive" or "silent"
- `auto_start`: Enable auto-start (requires systemd setup)
- `notifications.local_copy`: Notify when you copy locally
- `notifications.remote_update`: Notify when clipboard synced from another device
- `notifications.errors`: Notify on connection errors
- `clipboard.monitor_interval`: How often to check clipboard (ms)

---

## Uninstallation

### Remove Application
```bash
# Remove binary
sudo rm /usr/local/bin/corridor

# Remove AppImage
rm ~/Downloads/Corridor-x86_64.AppImage  # or wherever you saved it
```

### Remove Configuration
```bash
# Remove config files
rm -rf ~/.config/corridor

# Disable and remove systemd service
systemctl --user stop corridor
systemctl --user disable corridor
rm ~/.config/systemd/user/corridor.service
systemctl --user daemon-reload
```

---

## Getting Help

- **Documentation**: https://your-website.com/docs
- **Issues**: https://github.com/yourusername/corridor/issues
- **Community**: https://discord.gg/your-invite

---

## Security & Privacy

- All clipboard data is encrypted in transit (WSS/HTTPS)
- Your token acts as your encryption key
- No data is permanently stored on servers
- Configuration file is set to user-only permissions (0600)
- Open source - audit the code yourself!

---

## Advanced Usage

### Custom Server
If you're running your own Corridor server:

```bash
corridor --setup
# Then enter your custom server URLs when prompted
```

### Debug Mode
```bash
corridor --debug
```

This enables verbose logging to help diagnose issues.

### Multiple Instances
Corridor prevents multiple instances automatically. If you need to force-start:
```bash
# Stop existing instance first
pkill -f corridor

# Then start new instance
corridor
```

---

Enjoy seamless clipboard synchronization across all your devices! 🚀
