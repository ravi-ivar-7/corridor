@echo off
echo ======================================
echo Deploying APK to Web Public Folder
echo ======================================
echo.

REM Check if release APK exists
if exist "app\build\outputs\apk\release\Corridor.apk" (
    set "SOURCE=app\build\outputs\apk\release\Corridor.apk"
    echo Using release APK (signed)
) else if exist "app\build\outputs\apk\debug\Corridor-debug.apk" (
    set "SOURCE=app\build\outputs\apk\debug\Corridor-debug.apk"
    echo WARNING: Using debug APK (release not found)
) else (
    echo ERROR: No APK found!
    echo Please build the app first using build-release.bat
    pause
    exit /b 1
)

REM Copy to web public folder
set "DEST=..\server\web\public\Corridor.apk"

echo.
echo Copying APK...
echo From: %SOURCE%
echo To: %DEST%
echo.

copy /Y "%SOURCE%" "%DEST%"

if errorlevel 1 (
    echo ERROR: Failed to copy APK!
    pause
    exit /b 1
)

REM Get file size
for %%A in ("%DEST%") do set SIZE=%%~zA
set /a SIZE_MB=%SIZE% / 1048576

echo.
echo ======================================
echo Deployment Successful!
echo ======================================
echo.
echo APK deployed to: %DEST%
echo File size: ~%SIZE_MB% MB
echo.
echo The APK is now available for download at:
echo https://your-domain.com/Corridor.apk
echo.
pause
