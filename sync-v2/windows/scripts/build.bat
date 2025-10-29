@echo off
REM Corridor Build Script
REM This builds the optimized self-contained executable (without signing)

echo Building Corridor...
echo.

REM Run the PowerShell build script (without signing)
powershell -ExecutionPolicy Bypass -File "%~dp0build.ps1"

echo.
echo Build complete! Check the publish folder for Corridor.exe
pause
