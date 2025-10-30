# Building Corridor Android APK

This guide explains how to build the Corridor Android app as an APK file for distribution.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Build (Recommended)](#quick-build-recommended)
- [Manual Build Process](#manual-build-process)
- [Understanding Warnings](#understanding-warnings)
- [Distribution](#distribution)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
1. **Java JDK 17+** (for keytool and Gradle)
   - **Option A:** Android Studio (includes JDK) - Recommended if you're developing
   - **Option B:** Java JDK from https://adoptium.net/
   - Verify: `java -version`

2. **Android SDK** (already included in project via Gradle)

### Verify Your Setup
```bash
cd E:\corridor\android
java -version      # Should show Java 17+
gradlew.bat --version  # Should work without errors
```

**Note:** The build scripts automatically detect keytool from:
- System PATH
- Android Studio installation (`C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe`)
- JAVA_HOME environment variable

---

## Quick Build (Recommended)

### Option 1: Using the Build Script (Easiest)

Simply run the automated build script:

```bash
cd E:\corridor\android
build-release.bat
```

This will:
- ✅ Generate signing keystore (if needed)
- ✅ Build signed release APK
- ✅ Show APK location when done

**Output:** `app\build\outputs\apk\release\app-release.apk`

### Option 2: One-Command Build

If you prefer a single command:

```bash
cd E:\corridor\android
gradlew.bat assembleRelease
```

---

## Manual Build Process

### Step 1: Generate Signing Keystore (First Time Only)

**Option A: Use the script (Easiest)**

```bash
cd E:\corridor\android
generate-keystore.bat
```

This script:
- Automatically finds keytool (from Android Studio or JAVA_HOME)
- Generates the keystore with all correct settings
- Shows clear success/error messages

**Option B: Manual command**

```bash
cd E:\corridor\android

keytool -genkey -v -keystore corridor-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias corridor -storepass corridor123 -keypass corridor123 -dname "CN=Corridor, OU=Development, O=Corridor, L=Unknown, S=Unknown, C=US"
```

**Option C: Using Android Studio's keytool directly**

```bash
"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkey -v -keystore corridor-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias corridor -storepass corridor123 -keypass corridor123 -dname "CN=Corridor, OU=Development, O=Corridor, L=Unknown, S=Unknown, C=US"
```

**Important:**
- This creates `corridor-release-key.jks` in the `android` folder
- **Keep this file safe!** You need it for all future app updates
- Password is `corridor123` (can be changed in `keystore.properties`)

### Step 2: Verify Configuration Files

Check that these files exist:

**`keystore.properties`:**
```properties
storeFile=corridor-release-key.jks
storePassword=corridor123
keyAlias=corridor
keyPassword=corridor123
```

**`build.gradle` should have:**
```gradle
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
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### Step 3: Clean Previous Builds (Optional but Recommended)

```bash
cd E:\corridor\android
gradlew.bat clean
```

### Step 4: Build Release APK

```bash
cd E:\corridor\android
gradlew.bat assembleRelease
```

**Build time:** 1-3 minutes (first build may take longer)

### Step 5: Locate Your APK

After successful build:

```
📦 APK Location:
E:\corridor\android\app\build\outputs\apk\release\app-release.apk
```

### Step 6: Verify APK (Optional)

Check APK signature:

```bash
jarsigner -verify -verbose -certs app\build\outputs\apk\release\app-release.apk
```

Get APK info:

```bash
aapt dump badging app\build\outputs\apk\release\app-release.apk
```

---

## Alternative: Debug APK (For Testing Only)

If you need a quick test build without signing:

```bash
cd E:\corridor\android
gradlew.bat assembleDebug
```

**Output:** `app\build\outputs\apk\debug\app-debug.apk`

⚠️ **Warning:** Debug APKs show more security warnings than signed release APKs!

---

## Understanding Warnings

### What Users Will See When Installing

Even with a properly signed APK, Android shows these warnings for apps outside Google Play Store:

#### 1. "Install from unknown sources"
```
For your security, your phone is not allowed to install apps from this source.
```

**Solution:** Users must enable "Install from unknown sources" in Settings:
- Go to **Settings → Security**
- Enable **"Unknown sources"** or
- Enable for specific app (Chrome, File Manager, etc.)

#### 2. "This type of file can harm your device"
```
This type of file can harm your device. Do you want to keep app-release.apk anyway?
```

**Solution:** This is a standard warning for all APKs. Click **"Keep"** or **"Download anyway"**

#### 3. "Do you want to install this application?"
```
Corridor
Do you want to install this application? It does not require any special access.
```

**Solution:** Click **"Install"**

### Why These Warnings Appear

- ✅ **Signed APK:** Verified by Android, can be updated
- ⚠️ **Not from Play Store:** Android warns about all sideloaded apps
- ✅ **Safe to Install:** These warnings appear for ALL apps installed outside Play Store

### How to Eliminate ALL Warnings

The only way to remove installation warnings is to publish to **Google Play Store**:

1. Create Google Play Console account ($25 one-time fee)
2. Upload APK and complete store listing
3. Submit for review (can take 1-7 days)
4. Once approved, users install without warnings

---

## Distribution

### Method 1: Deploy to Web Server (Recommended)

After building the APK, automatically deploy it to your web server:

```bash
cd E:\corridor\android
deploy-to-web.bat
```

This script:
- Copies the APK to `server/web/public/Corridor.apk`
- Makes it available at `https://your-domain.com/Corridor.apk`
- Updates the download page automatically

Users can download from your website at `/downloads`

### Method 2: Direct File Sharing

1. Send `app-release.apk` directly via:
   - Email attachment
   - USB transfer
   - Cloud storage (Dropbox, Google Drive, etc.)

2. User installs by:
   - Opening the APK file
   - Enabling "Unknown sources"
   - Clicking "Install"

### Method 3: Web Download

1. Upload APK to your website or GitHub Releases
2. Share download link
3. Users download and install

Example:
```
https://github.com/yourusername/corridor/releases/download/v1.0/app-release.apk
```

### Method 3: GitHub Releases (Recommended)

```bash
# Create release tag
git tag -a v1.0 -m "Release version 1.0"
git push origin v1.0

# Upload app-release.apk to GitHub Releases page
```

### Providing SHA256 Checksum (Optional Security)

Let users verify APK integrity:

```bash
# Windows
certutil -hashfile app\build\outputs\apk\release\app-release.apk SHA256

# Linux/Mac
sha256sum app/build/outputs/apk/release/app-release.apk
```

Share the checksum with your APK download link.

---

## Troubleshooting

### Build Fails: "keytool: command not found"

**Problem:** Java JDK not installed or not in PATH

**Solution:**
1. Install Java JDK 17+ from https://adoptium.net/
2. Add to PATH or use full path:
   ```bash
   "C:\Program Files\Java\jdk-17\bin\keytool" -genkey -v ...
   ```

### Build Fails: "Keystore was tampered with, or password was incorrect"

**Problem:** Wrong password in `keystore.properties`

**Solution:**
- Check password matches what you used with keytool
- Default is `corridor123`
- Regenerate keystore if you forgot password:
  ```bash
  del corridor-release-key.jks
  # Then run keytool command again
  ```

### Build Fails: "SDK location not found"

**Problem:** Android SDK path not configured

**Solution:** Create `local.properties`:
```properties
sdk.dir=C\:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
```

### APK Installs but Immediately Crashes

**Problem:** Usually a configuration or dependency issue

**Solution:**
1. Check logs: `adb logcat`
2. Verify `gradle.properties` has correct URLs
3. Try debug build first: `gradlew.bat assembleDebug`

### "Execution failed for task ':app:lintVitalRelease'"

**Problem:** Lint checks failed

**Solution:** Add to `app/build.gradle`:
```gradle
android {
    lintOptions {
        checkReleaseBuilds false
        abortOnError false
    }
}
```

### Build is Extremely Slow

**Solution:**
1. Increase Gradle memory in `gradle.properties`:
   ```properties
   org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
   ```
2. Enable parallel builds:
   ```properties
   org.gradle.parallel=true
   ```

---

## Security Best Practices

### 🔒 Protecting Your Keystore

1. **Never commit to Git:**
   - Already in `.gitignore`
   - Verify: `git status` should not show `*.jks` or `keystore.properties`

2. **Backup securely:**
   - Copy `corridor-release-key.jks` to safe location
   - Store password securely (password manager)
   - You CANNOT update the app without this keystore!

3. **Change default password (Optional but Recommended):**
   ```bash
   keytool -storepasswd -keystore corridor-release-key.jks
   # Then update keystore.properties
   ```

### 🔑 Production Keystore

For production releases, use a stronger password:

```bash
keytool -genkey -v -keystore corridor-production.jks -keyalg RSA -keysize 2048 -validity 10000 -alias corridor
# Enter strong password when prompted
```

Then update `keystore.properties` with your strong password.

---

## Summary of Commands

### First Time Setup
```bash
cd E:\corridor\android
keytool -genkey -v -keystore corridor-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias corridor -storepass corridor123 -keypass corridor123 -dname "CN=Corridor, OU=Development, O=Corridor, L=Unknown, S=Unknown, C=US"
```

### Build Signed APK
```bash
cd E:\corridor\android
gradlew.bat clean
gradlew.bat assembleRelease
```

### Or Just Use the Script
```bash
cd E:\corridor\android
build-release.bat
```

### Output Location
```
E:\corridor\android\app\build\outputs\apk\release\app-release.apk
```

---

## Version Updates

When releasing a new version:

1. Update version in `app/build.gradle`:
   ```gradle
   versionCode 2        // Increment by 1
   versionName "1.1"    // Update version string
   ```

2. Rebuild:
   ```bash
   gradlew.bat clean assembleRelease
   ```

3. Same keystore is used automatically (required for updates!)

---

## Need Help?

- Check logs: `gradlew.bat assembleRelease --stacktrace`
- Debug build: `gradlew.bat assembleDebug`
- Clean build: `gradlew.bat clean assembleRelease`
- Full rebuild: Delete `build` folders, then rebuild

---

**Ready to build?** Run `build-release.bat` and you're done! 🚀
