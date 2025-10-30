@echo off
echo ======================================
echo Building Signed Release APK
echo ======================================
echo.

REM Find keytool - check multiple locations
set "KEYTOOL="

REM Check if keytool is in PATH
where keytool >nul 2>&1
if not errorlevel 1 (
    set "KEYTOOL=keytool"
    echo Found keytool in PATH
    goto :found_keytool
)

REM Check Android Studio
if exist "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" (
    set "KEYTOOL=C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
    echo Found keytool in Android Studio
    goto :found_keytool
)

REM Check JAVA_HOME
if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\keytool.exe" (
        set "KEYTOOL=%JAVA_HOME%\bin\keytool.exe"
        echo Found keytool in JAVA_HOME
        goto :found_keytool
    )
)

REM Not found
echo ERROR: keytool not found!
echo.
echo Please install one of:
echo   1. Java JDK from https://adoptium.net/
echo   2. Android Studio (includes JDK)
echo.
pause
exit /b 1

:found_keytool
echo.

REM Set JAVA_HOME for Gradle
if not defined JAVA_HOME (
    REM Use Android Studio's JBR
    if exist "C:\Program Files\Android\Android Studio\jbr" (
        set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
        echo Set JAVA_HOME to Android Studio JBR
        echo.
    )
)

REM Check if keystore exists
if not exist "corridor-release-key.jks" (
    echo Generating signing keystore...
    "%KEYTOOL%" -genkey -v -keystore corridor-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias corridor -storepass corridor123 -keypass corridor123 -dname "CN=Corridor, OU=Development, O=Corridor, L=Unknown, S=Unknown, C=US"
    if errorlevel 1 (
        echo ERROR: Failed to generate keystore!
        pause
        exit /b 1
    )
    echo Keystore generated successfully!
    echo.
) else (
    echo Keystore already exists, skipping generation...
    echo.
)

echo Building signed release APK...
call gradlew.bat assembleRelease

if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ======================================
echo Build Successful!
echo ======================================
echo.
echo APK Location: app\build\outputs\apk\release\app-release.apk
echo.
echo You can now share this APK file!
echo.
pause
