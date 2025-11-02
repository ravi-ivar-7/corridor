#!/bin/bash
# Corridor Linux Installer
# This script downloads and installs Corridor for Linux

set -e

echo "Corridor Linux Installer"
echo "============================"
echo

# Detect installation directory
INSTALL_DIR="$HOME/.local/bin"
mkdir -p "$INSTALL_DIR"

# Download binary
echo "Downloading Corridor..."
if command -v curl &> /dev/null; then
    curl -fsSL https://corridor.rknain.com/Corridor -o "$INSTALL_DIR/Corridor"
elif command -v wget &> /dev/null; then
    wget -q https://corridor.rknain.com/Corridor -O "$INSTALL_DIR/Corridor"
else
    echo "✘ Error: Neither curl nor wget found. Please install one of them."
    exit 1
fi

# Make executable
echo "Making executable..."
chmod +x "$INSTALL_DIR/Corridor"

# Check if ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo
    echo "⚠︎  Note: $INSTALL_DIR is not in your PATH"
    echo "   Add this line to your ~/.bashrc or ~/.zshrc:"
    echo
    echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo
fi

echo
echo "Installation complete!"
echo
echo "Run Corridor with:"
echo "   Corridor"
echo
echo "Or with full path:"
echo "   $INSTALL_DIR/Corridor"
echo
