#!/bin/bash
# corridor Linux Installer
# This script downloads and installs corridor for Linux

set -e

echo "corridor Linux Installer"
echo "============================"
echo

# Set installation directory
INSTALL_DIR="$HOME/.local/bin"

# Create directory if it doesn't exist
mkdir -p "$INSTALL_DIR"

echo "Installing to: $INSTALL_DIR"
echo

# Download binary
echo "Downloading corridor..."
if command -v curl &> /dev/null; then
    curl -fsSL https://corridor.rknain.com/corridor -o "$INSTALL_DIR/corridor"
elif command -v wget &> /dev/null; then
    wget -q https://corridor.rknain.com/corridor -O "$INSTALL_DIR/corridor"
else
    echo "Error: Neither curl nor wget found. Please install one of them."
    exit 1
fi

# Make executable
echo "Making executable..."
chmod +x "$INSTALL_DIR/corridor"

# Add to PATH if not already there
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo
    echo "Adding $HOME/.local/bin to PATH..."

    # Detect shell and add to appropriate rc file
    if [ -n "$BASH_VERSION" ]; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
        echo "Added to ~/.bashrc"
    elif [ -n "$ZSH_VERSION" ]; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc"
        echo "Added to ~/.zshrc"
    fi

    # Export for current session
    export PATH="$HOME/.local/bin:$PATH"
fi

echo
echo "Installation complete!"
echo
echo "corridor has been installed to:"
echo "   $INSTALL_DIR/corridor"
echo
echo "To run corridor:"
echo "   $ corridor"
echo
echo "Note: You may need to restart your terminal or run:"
echo "   $ source ~/.bashrc  (or ~/.zshrc for zsh)"
echo
