#!/bin/bash
# Build script for Corridor Linux Client

set -e  # Exit on error

echo "============================================"
echo "Building Corridor Linux Client"
echo "============================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo -e "${BLUE}Project directory: $PROJECT_DIR${NC}"

# Check Python version
echo -e "\n${BLUE}Checking Python version...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo -e "${GREEN}Python version: $PYTHON_VERSION${NC}"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "\n${BLUE}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "\n${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate

# Upgrade pip
echo -e "\n${BLUE}Upgrading pip...${NC}"
pip install --upgrade pip

# Install dependencies
echo -e "\n${BLUE}Installing dependencies...${NC}"
pip install -r requirements.txt

# Install PyInstaller for packaging
echo -e "\n${BLUE}Installing PyInstaller...${NC}"
pip install pyinstaller

# Clean previous builds
echo -e "\n${BLUE}Cleaning previous builds...${NC}"
rm -rf build/ dist/ *.spec

# Build with PyInstaller
echo -e "\n${BLUE}Building executable with PyInstaller...${NC}"
pyinstaller --name=corridor \
    --onefile \
    --windowed \
    --hidden-import=PyQt5 \
    --hidden-import=websockets \
    --hidden-import=requests \
    --add-data="resources:resources" \
    --icon="resources/icons/app-icon.png" \
    src/main.py

# Create output directory
mkdir -p publish

# Copy executable
echo -e "\n${BLUE}Copying executable to publish/...${NC}"
cp dist/corridor publish/

# Make executable
chmod +x publish/corridor

# Copy service file
cp corridor.service publish/

echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}Build completed successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "\nExecutable location: ${BLUE}$PROJECT_DIR/publish/corridor${NC}"
echo -e "Service file: ${BLUE}$PROJECT_DIR/publish/corridor.service${NC}"
echo -e "\nTo install:"
echo -e "  ${BLUE}sudo cp publish/corridor /usr/local/bin/${NC}"
echo -e "  ${BLUE}mkdir -p ~/.config/systemd/user/${NC}"
echo -e "  ${BLUE}cp publish/corridor.service ~/.config/systemd/user/${NC}"
echo -e "  ${BLUE}systemctl --user enable --now corridor${NC}"
