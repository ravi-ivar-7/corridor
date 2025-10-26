# Clipboard Sync Client

A Windows client application that synchronizes your clipboard across multiple devices in real-time. This client connects to a Clipboard Sync server to keep your clipboard in sync across all your devices.

## Features

- Real-time clipboard synchronization
- Secure token-based authentication
- Configurable server and polling interval
- Lightweight and runs in the background
- No installation required
- Optional quiet mode for background operation

## Prerequisites

- Windows 7 or later
- Visual Studio 2019 or later with C++ build tools
- Windows SDK (included with Visual Studio)

## Compilation

### Using MSVC (Visual Studio)
1. Open **Developer Command Prompt for VS 2022** (or your version)
2. Navigate to the client directory:
   ```bash
   cd path\to\clipboard-sync\client
   ```
3. Compile the application:
   ```bash
   cl /EHsc /Fe:clipboard-sync.exe main.cpp /link wininet.lib user32.lib ole32.lib oleaut32.lib
   ```

### Using g++ (MinGW)
1. Ensure MinGW-w64 is installed and added to your PATH
2. Open a command prompt and navigate to the client directory:
   ```bash
   cd path/to/clipboard-sync/client
   ```
3. Compile the application:
   ```bash
   g++ -std=c++17 -o sync.exe sync.cpp -lwininet -luser32 -lole32 -loleaut32 -lws2_32 -static -static-libgcc -static-libstdc++
   ```
   
   For a smaller executable size (stripped debug symbols):
   ```bash
   g++ -std=c++17 -s -Os -o sync.exe sync.cpp -lwininet -luser32 -lole32 -loleaut32 -lws2_32 -static -static-libgcc -static-libstdc++
   ```

### Notes:
- MSVC: Requires Visual Studio with C++ build tools
- MinGW: Download from [MSYS2](https://www.msys2.org/) or [MinGW-w64](https://www.mingw-w64.org/)
- The `-static` flags ensure all required DLLs are included in the executable

## Using Pre-built Executable

If you don't want to compile from source, you can use the pre-built Windows executable:

1. Download the latest `sync.exe` from the [releases page](https://github.com/yourusername/clipboard-sync/releases)
2. Open a Command Prompt and navigate to the download location
3. Run the executable with your token:
   ```bash
   sync.exe -t YOUR_TOKEN
   ```

### Verifying the Download (Recommended)
For security, verify the checksum of the downloaded file:
```bash
certutil -hashfile sync.exe SHA256
```
Compare the output with the checksum provided in the release notes.

## Usage

### Basic Usage
```bash
sync.exe -t YOUR_TOKEN
```

### All Options
```bash
sync.exe [options]

Options:
  -h, --host <hostname>   Server hostname or IP (default: localhost)
  -p, --port <port>       Server port (default: 443 for HTTPS)
  -t, --token <token>     Authentication token (required)
  -i, --interval <ms>     Polling interval in milliseconds (default: 1000)
  -q, --quiet             Disable debug output (run silently)
  --help                  Show this help message
```

### Examples

1. Connect to default local server:
   ```bash
   sync.exe -t my-secret-token
   ```

2. Connect to remote server with custom port:
   ```bash
   sync.exe -h example.com -p 8080 -t my-secret-token
   ```

3. Faster polling (500ms):
   ```bash
   sync.exe -t my-secret-token -i 500
   ```

4. Run in quiet mode (no console output):
   ```bash
   sync.exe -t my-secret-token -q
   ```

5. Remote server with custom settings:
   ```bash
   sync.exe -h sync.rknain.com -t token_nr75nih4t -i 10000 -q
   ```

6. Run as a background process (Windows):
   ```bash
   start /B sync.exe -t my-secret-token -q
   ```
## Security

- The token is required for authentication and should be kept secret
- Communication with the server is not encrypted (use HTTPS for production)
- The client only sends clipboard text content, no other system information is transmitted

## Troubleshooting

- **Clipboard not syncing**:
  - Verify the server is running and accessible
  - Check that the token matches on all devices
  - Check the console output for error messages

- **Compilation errors**:
  - Ensure all required Windows SDK components are installed
  - Verify Visual C++ build tools are properly installed
