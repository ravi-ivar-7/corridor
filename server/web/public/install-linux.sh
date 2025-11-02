#!/bin/bash
# Corridor Linux Installer
# This script downloads and installs Corridor for Linux

set -e

echo "Corridor Linux Installer"
echo "============================"
echo

# Detect Downloads folder
if [ -d "$HOME/Downloads" ]; then
    INSTALL_DIR="$HOME/Downloads"
elif [ -d "$HOME/Download" ]; then
    INSTALL_DIR="$HOME/Download"
else
    INSTALL_DIR="$HOME"
fi

echo "Downloading to: $INSTALL_DIR"
echo

# Download binary
echo "Downloading Corridor..."
if command -v curl &> /dev/null; then
    curl -fsSL https://corridor.rknain.com/Corridor -o "$INSTALL_DIR/Corridor"
elif command -v wget &> /dev/null; then
    wget -q https://corridor.rknain.com/Corridor -O "$INSTALL_DIR/Corridor"
else
    echo "Error: Neither curl nor wget found. Please install one of them."
    exit 1
fi

# Make executable
echo "Making executable..."
chmod +x "$INSTALL_DIR/Corridor"

echo
echo "Installation complete!"
echo
echo "Corridor has been downloaded to:"
echo "   $INSTALL_DIR/Corridor"
echo
echo "To run Corridor:"
echo "   1. Open your file manager and go to Downloads"
echo "   2. Double-click 'Corridor' to run"
echo "   Or run from terminal: $INSTALL_DIR/Corridor"
echo
