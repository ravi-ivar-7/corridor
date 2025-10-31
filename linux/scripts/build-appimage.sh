#!/bin/bash
# Build AppImage for Corridor Linux Client

set -e

echo "============================================"
echo "Building Corridor AppImage"
echo "============================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo -e "${BLUE}Project directory: $PROJECT_DIR${NC}"

# Check dependencies
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

# Create virtual environment
if [ ! -d "venv" ]; then
    echo -e "\n${BLUE}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo -e "\n${BLUE}Installing dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt
pip install pyinstaller

# Clean previous builds
echo -e "\n${BLUE}Cleaning previous builds...${NC}"
rm -rf build/ dist/ *.spec publish/

# Build executable with PyInstaller
echo -e "\n${BLUE}Building executable...${NC}"
pyinstaller --name=corridor \
    --onefile \
    --console \
    --hidden-import=PyQt5 \
    --hidden-import=websockets \
    --hidden-import=requests \
    --hidden-import=pyperclip \
    src/main.py

# Create AppDir structure
echo -e "\n${BLUE}Creating AppDir structure...${NC}"
mkdir -p AppDir/usr/bin
mkdir -p AppDir/usr/share/applications
mkdir -p AppDir/usr/share/icons/hicolor/256x256/apps

# Copy executable
cp dist/corridor AppDir/usr/bin/

# Create desktop entry
cat > AppDir/usr/share/applications/corridor.desktop <<EOF
[Desktop Entry]
Name=Corridor
Comment=Real-time clipboard synchronization
Exec=corridor
Icon=corridor
Terminal=false
Type=Application
Categories=Utility;Network;
Keywords=clipboard;sync;
EOF

# Create a simple icon (placeholder - replace with actual icon)
# For now, we'll skip the icon and use a default
# cp resources/icons/app-icon.png AppDir/usr/share/icons/hicolor/256x256/apps/corridor.png

# Create AppRun script
cat > AppDir/AppRun <<'EOF'
#!/bin/bash
SELF=$(readlink -f "$0")
HERE=${SELF%/*}
export PATH="${HERE}/usr/bin:${PATH}"
exec "${HERE}/usr/bin/corridor" "$@"
EOF

chmod +x AppDir/AppRun
chmod +x AppDir/usr/bin/corridor

# Download appimagetool if not present
if [ ! -f "appimagetool-x86_64.AppImage" ]; then
    echo -e "\n${BLUE}Downloading appimagetool...${NC}"
    wget -q "https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage"
    chmod +x appimagetool-x86_64.AppImage
fi

# Create AppImage
echo -e "\n${BLUE}Creating AppImage...${NC}"
ARCH=x86_64 ./appimagetool-x86_64.AppImage AppDir

# Create publish directory
mkdir -p publish

# Move AppImage to publish
mv Corridor-x86_64.AppImage publish/

echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}AppImage build completed!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "\nAppImage location: ${BLUE}$PROJECT_DIR/publish/Corridor-x86_64.AppImage${NC}"
echo -e "\nTo test:"
echo -e "  ${BLUE}chmod +x publish/Corridor-x86_64.AppImage${NC}"
echo -e "  ${BLUE}./publish/Corridor-x86_64.AppImage --setup${NC}"
echo -e "  ${BLUE}./publish/Corridor-x86_64.AppImage${NC}"
