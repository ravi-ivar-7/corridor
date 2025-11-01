# Corridor - Linux

Real-time clipboard synchronization for Linux.

## Features

- Real-time WebSocket sync across devices
- System tray with history (100 items)
- Desktop notifications
- Auto-reconnect with offline queue
- Single instance check with dialog
- Setup wizard on first run
- ~3MB binary, <15MB RAM

## Installation

### Download Binary
Get the latest release from [corridor.rknain.com/downloads](https://corridor.rknain.com/downloads)

### Build from Source
```bash
./build.sh  # Builds and copies to server/web/public/Corridor
```

Or manually:
```bash
cargo build --release
./target/release/corridor
```

## First Run

On first launch, a setup dialog appears:
- Enter your sync token
- Choose mode (interactive/silent)
- Configure auto-start

Config is saved to `~/.config/corridor/config.json`

## Usage

The app runs with a system tray icon showing connection status:
- **White icon (✓)**: Connected
- **Red icon (✗)**: Disconnected

### Tray Menu
- **History**: View and restore recent clipboard items
- **Clear History**: Clear local and server history
- **Settings**: Open config file
- **Restart**: Restart the app
- **Quit**: Exit

### Modes
- `interactive`: System tray + notifications (default)
- `silent`: Background only, no UI

## Auto-Start

Configured via the setup dialog. Creates `~/.config/autostart/corridor.desktop`

Manual setup:
```bash
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/corridor.desktop <<EOF
[Desktop Entry]
Type=Application
Name=Corridor
Exec=/usr/local/bin/corridor --autostart
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF
```

## Requirements

- X11 or Wayland
- System tray support (GNOME: install `gnome-shell-extension-appindicator`)
- Python 3 + tkinter (for setup dialogs)

## Compatibility

Works on modern Linux distributions with glibc 2.31+ and libssl.so.3:
- Ubuntu 20.04+
- Debian 11+
- Fedora 35+
- Linux Mint 20+

## Troubleshooting

**Setup dialog not appearing**: Install `python3-tk`
```bash
sudo apt install python3-tk
```

**Tray icon missing**: Install system tray extension
```bash
sudo apt install gnome-shell-extension-appindicator
```

**Connection errors**: Check logs with `RUST_LOG=debug ./corridor`
