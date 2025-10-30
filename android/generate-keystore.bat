@echo off
echo ======================================
echo Generating Signing Keystore
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
echo Using: %KEYTOOL%
echo.

REM Check if keystore already exists
if exist "corridor-release-key.jks" (
    echo WARNING: Keystore already exists!
    echo File: corridor-release-key.jks
    echo.
    set /p OVERWRITE="Do you want to overwrite it? (yes/no): "
    if /i not "%OVERWRITE%"=="yes" (
        echo Cancelled.
        pause
        exit /b 0
    )
    echo.
)

echo Generating keystore...
echo.
"%KEYTOOL%" -genkey -v -keystore corridor-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias corridor -storepass corridor123 -keypass corridor123 -dname "CN=Corridor, OU=Development, O=Corridor, L=Unknown, S=Unknown, C=US"

if errorlevel 1 (
    echo.
    echo ERROR: Failed to generate keystore!
    pause
    exit /b 1
)

echo.
echo ======================================
echo Keystore Generated Successfully!
echo ======================================
echo.
echo File: corridor-release-key.jks
echo Password: corridor123
echo Alias: corridor
echo.
echo IMPORTANT: Keep this file safe!
echo You need it for all future app updates.
echo.
pause
