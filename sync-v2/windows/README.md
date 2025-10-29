# Clipboard Sync Client

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

## Building the Application

### Development Build (Framework-Dependent)

For development and testing when .NET 9.0 is installed:

```bash
# Debug build
dotnet build --configuration Debug

# Release build
dotnet build --configuration Release
```

**Output:** `bin/Release/net9.0-windows/ClipboardClient.exe`

### Self-Contained Deployment (No .NET Required)

For distribution to machines without .NET installed:

#### Option 1: Full Self-Contained (Multiple Files)
```bash
dotnet publish --configuration Release --self-contained true --runtime win-x64 --output ./publish
```

**Output:** `publish/ClipboardClient.exe` + all required DLLs
**Size:** ~100-120 MB
**Requirements:** None - runs on any Windows machine

#### Option 2: Single-File Self-Contained (Recommended)
```bash
dotnet publish --configuration Release --self-contained true --runtime win-x64 --output ./publish --p:PublishSingleFile=true
```

**Output:** `publish-single/ClipboardClient.exe` (single file)
**Size:** ~100-120 MB
**Requirements:** None - runs on any Windows machine

#### Option 3: Single-File Self-Contained (No Debug Symbols)
```bash
dotnet publish --configuration Release --self-contained true --runtime win-x64 --output ./publish --p:PublishSingleFile=true --p:DebugType=None
```

**Output:** `publish/ClipboardClient.exe` (single file, no .pdb)
**Size:** ~100-120 MB
**Requirements:** None - runs on any Windows machine

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

1. **First Run:** The application will show a setup window to configure connection settings
2. **Main Application:** After configuration, the main application window will appear
3. **System Tray:** The application runs in the system tray for background operation
4. **Hotkeys:** Global hotkeys can be configured for quick access

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
Use the single-file self-contained build:
```bash
dotnet publish --configuration Release --self-contained true --runtime win-x64 --output ./publish-single --p:PublishSingleFile=true
```

Then distribute only the `ClipboardClient.exe` file from the `publish-single` folder.

### For System Administrators
Use the full self-contained build if you need to inspect or modify individual components:
```bash
dotnet publish --configuration Release --self-contained true --runtime win-x64 --output ./publish
```

Distribute the entire `publish` folder.

## Build Outputs

| Build Type | Command | Output Location | Size | Requirements |
|------------|---------|-----------------|------|--------------|
| Debug | `dotnet build --configuration Debug` | `bin/Debug/net9.0-windows/` | ~5 MB | .NET 9.0 |
| Release | `dotnet build --configuration Release` | `bin/Release/net9.0-windows/` | ~5 MB | .NET 9.0 |
| Self-Contained | `dotnet publish --self-contained true` | `publish/` | ~150-200 MB | None |
| Single File | `dotnet publish --self-contained true --p:PublishSingleFile=true` | `publish-single/` | ~150-200 MB | None |

## Troubleshooting

### Build Issues
- Ensure .NET 9.0 SDK is installed
- Check that all NuGet packages are restored: `dotnet restore`
- Verify target framework compatibility

### Runtime Issues
- For self-contained builds, ensure the target machine is Windows x64
- Check that all required files are present in the output directory
- Verify network connectivity for WebSocket/HTTP communication
