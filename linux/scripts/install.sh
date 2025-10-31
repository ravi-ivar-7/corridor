#!/bin/bash
# Installation script for Corridor Linux Client

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Corridor Linux Client Installer${NC}"
echo -e "${BLUE}============================================${NC}"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Error: Do not run this script as root${NC}"
    echo -e "Run without sudo - it will ask for password when needed"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Check if executable exists
if [ ! -f "$PROJECT_DIR/publish/corridor" ]; then
    echo -e "${RED}Error: Executable not found at $PROJECT_DIR/publish/corridor${NC}"
    echo -e "${YELLOW}Please run build.sh first${NC}"
    exit 1
fi

# Install executable
echo -e "\n${BLUE}Installing executable...${NC}"
sudo cp "$PROJECT_DIR/publish/corridor" /usr/local/bin/
sudo chmod +x /usr/local/bin/corridor
echo -e "${GREEN}✓ Executable installed to /usr/local/bin/corridor${NC}"

# Create config directory
echo -e "\n${BLUE}Creating config directory...${NC}"
mkdir -p ~/.config/corridor
echo -e "${GREEN}✓ Config directory created at ~/.config/corridor${NC}"

# Install systemd service
echo -e "\n${BLUE}Installing systemd service...${NC}"
mkdir -p ~/.config/systemd/user
cp "$PROJECT_DIR/corridor.service" ~/.config/systemd/user/
systemctl --user daemon-reload
echo -e "${GREEN}✓ Systemd service installed${NC}"

# Install desktop entry (optional)
echo -e "\n${BLUE}Installing desktop entry...${NC}"
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/corridor.desktop <<EOF
[Desktop Entry]
Name=Corridor
Comment=Clipboard Sync Client
Exec=/usr/local/bin/corridor
Icon=clipboard
Terminal=false
Type=Application
Categories=Utility;
Keywords=clipboard;sync;
EOF
echo -e "${GREEN}✓ Desktop entry installed${NC}"

echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}Installation completed successfully!${NC}"
echo -e "${GREEN}============================================${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Configure Corridor:"
echo -e "   ${BLUE}corridor --setup${NC}"
echo -e "\n2. Enable auto-start:"
echo -e "   ${BLUE}systemctl --user enable corridor${NC}"
echo -e "\n3. Start the service:"
echo -e "   ${BLUE}systemctl --user start corridor${NC}"
echo -e "\n4. Check status:"
echo -e "   ${BLUE}systemctl --user status corridor${NC}"
echo -e "\n5. View logs:"
echo -e "   ${BLUE}journalctl --user -u corridor -f${NC}"
