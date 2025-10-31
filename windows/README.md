# Corridor

A real-time clipboard synchronization application that allows you to sync clipboard content across devices.

## Features

- Real-time clipboard synchronization
- Cross-device clipboard sharing
- Windows Forms GUI
- System tray integration
- Hotkey support
- WebSocket and HTTP communication

## Prerequisites

- .NET 9.0 SDK (for development)
- Windows 10/11 (for running the application)

## Quick Start

### **Build and Run:(Run from root dir)**
```bash
# Build optimized executable (no signing)
scripts\build.bat

# Build and sign executable
scripts\build-and-sign.bat

# Run the application
publish\Corridor.exe
```

### **Development:**
```bash
# Build for development
dotnet build --configuration Release

# Run in development mode
dotnet run
```

## Building the Application

### Development Build (Framework-Dependent)

For development and testing when .NET 9.0 is installed:

```bash
# Debug build
dotnet build --configuration Debug

# Release build
dotnet build --configuration Release
```

**Output:** `bin/Release/net9.0-windows/Corridor.exe`

### Self-Contained Deployment (No .NET Required)

For distribution to machines without .NET installed:

#### Option 1: Full Self-Contained (Multiple Files)
```bash
dotnet publish --configuration Release --self-contained true --runtime win-x64 --output ./publish
```

**Output:** `publish/Corridor.exe` + all required DLLs
**Size:** ~100-120 MB
**Requirements:** None - runs on any Windows machine

#### Option 2: Single-File Self-Contained (Recommended)
```bash
dotnet publish --configuration Release --self-contained true --runtime win-x64 --output ./publish --p:PublishSingleFile=true
```

**Output:** `publish-single/Corridor.exe` (single file)
**Size:** ~100-120 MB
**Requirements:** None - runs on any Windows machine

#### Option 3: Single-File Self-Contained (No Debug Symbols)
```bash
dotnet publish --configuration Release --self-contained true --runtime win-x64 --output ./publish --p:PublishSingleFile=true --p:DebugType=None
```

**Output:** `publish/Corridor.exe` (single file, no .pdb)
**Size:** ~150-200 MB
**Requirements:** None - runs on any Windows machine

#### Option 4: Optimized Single-File (Recommended for Distribution)
```bash
dotnet publish -c Release --self-contained true -r win-x64 -o ./publish -p:PublishSingleFile=true -p:EnableCompressionInSingleFile=true -p:DebugType=None -p:DebugSymbols=false -p:IlcOptimizationPreference=Size
```

**Output:** `publish/Corridor.exe` (single file, optimized)
**Size:** ~48 MB (includes admin manifest and all optimizations)
**Requirements:** None - runs on any Windows machine with administrator privileges

### Other Build Options

#### Framework-Dependent Single File
```bash
dotnet publish --configuration Release --self-contained false --output ./publish-framework
```

**Output:** `publish-framework/ClipboardClient.exe` (requires .NET 9.0 runtime)

#### Different Architectures
```bash
# For ARM64 Windows
dotnet publish --configuration Release --self-contained true --runtime win-arm64 --output ./publish-arm64

# For x86 Windows
dotnet publish --configuration Release --self-contained true --runtime win-x86 --output ./publish-x86
```

## Project Structure

```
windows/
├── Core/                    # Core functionality
│   ├── ConfigManager.cs     # Configuration management
│   ├── ConnectionManager.cs # Network connection handling
│   ├── HotkeyManager.cs     # Global hotkey support
│   └── MessageQueue.cs      # Message queuing system
├── Network/                 # Network communication
│   ├── HttpClient.cs        # HTTP client implementation
│   └── WebSocketClient.cs   # WebSocket client
├── UI/                      # User interface
│   ├── MainApplication.cs   # Main application window
│   ├── SetupWindow.cs       # Initial setup dialog
│   ├── AboutDialog.cs       # About dialog
│   └── NotificationManager.cs # System notifications
├── Resources/               # Application resources
│   └── Icons/              # Application icons
├── Program.cs              # Application entry point
└── ClipboardClient.csproj  # Project configuration
```

## Configuration

The application uses a configuration system to store:
- WebSocket URL
- HTTP URL
- Authentication token
- Other settings

Configuration is managed through the `ConfigManager` class and can be modified through the setup window.

## Usage

### Normal Operation
**Every time you run the application:**
1. **Instance Check:** Checks if another instance is already running
2. **Setup Window:** Always shows first to configure settings
3. **User Choice:** Select normal mode or background mode
4. **Application Start:** Runs based on your selection

### Multiple Instance Prevention
The application prevents multiple instances from running simultaneously:
- **If another instance is running:** Shows a dialog asking to terminate existing process or cancel
- **User can choose:** Terminate existing process and start new one, or cancel
- **Automatic restart:** After terminating existing processes, the new instance starts automatically

### Background Mode (Silent Operation)
The application supports two ways to run in background mode:

#### Method 1: Setup Window Configuration (Normal Usage)
1. Run the application: `Corridor.exe`
2. **Setup window appears** (every time)
3. In the setup window, check **"Run in Background (No Disturbance, No Tray Icon, Silent Mode)"**
4. Save the configuration
5. The application will run completely silently in the background
6. **Next time you run:** Setup window appears again (you can change settings)

#### Method 2: Command Line Silent Mode (Bypass Setup)
For completely silent operation without showing setup window:

```bash
# Command line silent mode (bypasses setup window)
Corridor.exe --silent
# or
Corridor.exe --background
# or
Corridor.exe /silent
# or
Corridor.exe /background
```

**Windows Batch File:**
```batch
# Use the included run-silent.bat file
run-silent.bat
```

**Background Mode Features:**
- ✅ No main application window
- ✅ No system tray icon
- ✅ No visible GUI elements
- ✅ Runs completely in background
- ✅ Clipboard synchronization still works
- ✅ Auto-reconnect functionality active
- ✅ Hotkeys still work (if configured)

**Normal Mode Features:**
- ✅ Main application window
- ✅ System tray icon
- ✅ Full GUI interface
- ✅ Easy access to settings

## Development

### Requirements
- Visual Studio 2022 or VS Code with C# extension
- .NET 9.0 SDK

### Running in Development
```bash
dotnet run
```

### Debugging
```bash
dotnet run --configuration Debug
```

## Deployment

### For End Users (Recommended)
Use the optimized single-file self-contained build:
```bash
dotnet publish -c Release --self-contained true -r win-x64 -o ./publish -p:PublishSingleFile=true -p:EnableCompressionInSingleFile=true -p:DebugType=None -p:DebugSymbols=false -p:IlcOptimizationPreference=Size
```

Then distribute only the `Corridor.exe` file (48 MB) from the `publish` folder.

### For System Administrators
Use the full self-contained build if you need to inspect or modify individual components:
```bash
dotnet publish --configuration Release --self-contained true --runtime win-x64 --output ./publish
```

Distribute the entire `publish` folder.

## Code Signing (Prevent Antivirus False Positives)

To prevent Windows Defender and other antivirus software from flagging your executable as a virus:

### **Option 1: Self-Signed Certificate (Free)**
```bash
# Build and sign in one command
scripts\build-and-sign.bat

# Or manually with PowerShell
powershell -ExecutionPolicy Bypass -File "scripts\build.ps1" -Sign

# Or just sign an existing build
scripts\sign.bat
```

### **Option 2: Commercial Code Signing Certificate**
1. Purchase a certificate from DigiCert, Sectigo, or GlobalSign
2. Install the certificate in Windows Certificate Store
3. Use signtool to sign:
```bash
signtool sign /f "certificate.pfx" /p "password" /t http://timestamp.digicert.com "Corridor.exe"
```

### **Option 3: Assembly Signing (Not Used)**
Assembly signing is disabled as it's not needed for self-contained executables.

## Build Outputs

| Build Type | Command | Output Location | Size | Requirements |
|------------|---------|-----------------|------|--------------|
| Debug | `dotnet build -c Debug` | `bin/Debug/net9.0-windows/` | ~5 MB | .NET 9.0 |
| Release | `dotnet build -c Release` | `bin/Release/net9.0-windows/` | ~5 MB | .NET 9.0 |
| Self-Contained | `dotnet publish --self-contained true` | `publish/` | ~150-200 MB | None |
| Single File | `dotnet publish --self-contained true -p:PublishSingleFile=true` | `publish/` | ~150-200 MB | None |
| **Optimized** | `dotnet publish -c Release --self-contained true -r win-x64 -p:PublishSingleFile=true -p:EnableCompressionInSingleFile=true -p:DebugType=None -p:DebugSymbols=false -p:IlcOptimizationPreference=Size` | `publish/` | **~48 MB** | None |

## Troubleshooting

### Build Issues
- Ensure .NET 9.0 SDK is installed
- Check that all NuGet packages are restored: `dotnet restore`
- Verify target framework compatibility

### Runtime Issues
- For self-contained builds, ensure the target machine is Windows x64
- Check that all required files are present in the output directory
- Verify network connectivity for WebSocket/HTTP communication
