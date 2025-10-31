# Corridor Android App

Real-time clipboard synchronization for Android.

## Features

- **Real-time clipboard sync** - Copy on Android, paste on Windows/Web (and vice versa)
- **Granular notifications** - Control which events trigger notifications
- **Clipboard history** - View last 100 items
- **Auto-start on boot** - Optional background service
- **Silent mode** - Run without any UI notifications
- **Start/Stop controls** - Easy service management

## Configuration

- **Token**: Your room identifier (3+ characters)
- **Silent Mode**: No notifications or tray icons
- **Notify on local copy**: Show notification when you copy text
- **Notify on remote update**: Show notification when clipboard synced from server
- **Notify on errors**: Show notification on connection/sync errors
- **Auto-start on boot**: Start service automatically when device boots

## Configuration

### Default URLs (Production)

Configured in `gradle.properties`:
- **Worker**: `https://corridor-worker.corridor-sync.workers.dev`
- **WebSocket**: `wss://corridor-worker.corridor-sync.workers.dev/ws`
- **API**: `${WORKER_URL}/api` (auto-constructed)

### Custom Backend / Local Development

**Option 1: Edit `gradle.properties`** (affects all builds)
```properties
CORRIDOR_WORKER_URL=https://your-worker.your-domain.com
CORRIDOR_WEBSOCKET_URL=wss://your-worker.your-domain.com/ws
```

**Option 2: Create `local.properties`** (gitignored, for local dev only)
```properties
CORRIDOR_WORKER_URL=http://localhost:8787
CORRIDOR_WEBSOCKET_URL=ws://localhost:8787/ws
```

**Option 3: Override in `app/build.gradle`** (for debug builds)
```gradle
buildTypes {
    debug {
        buildConfigField "String", "WORKER_URL", "\"http://10.0.2.2:8787\""
        buildConfigField "String", "WEBSOCKET_URL", "\"ws://10.0.2.2:8787/ws\""
    }
}
```

The app uses `BuildConfig.WORKER_URL` and `BuildConfig.WEBSOCKET_URL` throughout the codebase.

## Building APK

### Quick Build (Debug APK - for testing)

Build a debug APK that can be installed immediately:

```bash
cd android
gradlew.bat assembleDebug  # Windows
./gradlew assembleDebug    # Linux/Mac
```

Output: `app/build/outputs/apk/debug/Corridor-debug.apk`

**Note**: Debug APKs show "Install from unknown sources" warning when shared, which is normal.

### Production Build (Release APK - for distribution)

#### 1. Generate a signing key (first time only)

```bash
keytool -genkey -v -keystore corridor-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias corridor
```

Enter password and details when prompted. **Save this keystore file and password securely!**

#### 2. Create `android/keystore.properties`

```properties
storeFile=../corridor-release-key.jks
storePassword=YOUR_PASSWORD
keyAlias=corridor
keyPassword=YOUR_PASSWORD
```

**Important**: This file is gitignored. Never commit passwords!

#### 3. Add signing config to `app/build.gradle`

```gradle
android {
    signingConfigs {
        release {
            def keystorePropertiesFile = rootProject.file("keystore.properties")
            if (keystorePropertiesFile.exists()) {
                def keystoreProperties = new Properties()
                keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 4. Build release APK

```bash
cd android
gradlew.bat assembleRelease  # Windows
./gradlew assembleRelease    # Linux/Mac
```

Output: `app/build/outputs/apk/release/Corridor.apk`

### About "Unknown Sources" Warning

When users install your APK, Android will show security warnings:
- **"Install from unknown sources"** - Normal for APKs outside Google Play
- **"This type of file can harm your device"** - Standard warning for all APKs
- **"Do you want to install this app?"** - Final confirmation

To minimize warnings, users should:
1. Go to **Settings → Security**
2. Enable **"Install apps from unknown sources"** or allow for their browser/file manager
3. Install the APK

Alternatively, publish to **Google Play Store** for a trusted installation experience.

## Sharing Your APK

1. Upload to **GitHub Releases** or **your website**
2. Share direct download link with users
3. Optionally provide SHA256 checksum for verification:
   ```bash
   certutil -hashfile Corridor.apk SHA256  # Windows
   sha256sum Corridor.apk                   # Linux/Mac
   ```
