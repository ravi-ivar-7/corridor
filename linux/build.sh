#!/bin/bash

# Build script for Corridor Linux
# Builds the release binary and copies to server/web/public

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Corridor Linux build...${NC}"

# Get the project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PUBLIC_DIR="$PROJECT_ROOT/server/web/public"

# Build the release binary
echo -e "${BLUE}Building release binary...${NC}"
cd "$SCRIPT_DIR"
cargo build --release

# Check if build was successful
if [ ! -f "target/release/corridor" ]; then
    echo -e "${RED}Build failed! Binary not found.${NC}"
    exit 1
fi

# Get binary size
BINARY_SIZE=$(du -h "target/release/corridor" | cut -f1)
echo -e "${GREEN}Build successful! Binary size: $BINARY_SIZE${NC}"

# Copy to public directory
echo -e "${BLUE}Copying to $PUBLIC_DIR...${NC}"

if [ ! -d "$PUBLIC_DIR" ]; then
    echo -e "${RED}Public directory not found: $PUBLIC_DIR${NC}"
    exit 1
fi

cp "target/release/corridor" "$PUBLIC_DIR/Corridor"

# Make it executable
chmod +x "$PUBLIC_DIR/Corridor"

echo -e "${GREEN}Done! Binary copied to: $PUBLIC_DIR/Corridor${NC}"
echo -e "${BLUE}File info:${NC}"
ls -lh "$PUBLIC_DIR/Corridor"
