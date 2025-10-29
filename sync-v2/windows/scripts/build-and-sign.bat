@echo off
REM Corridor Build Script
REM This builds the optimized self-contained executable

echo Building Corridor...
echo.

REM Run the PowerShell build script
powershell -ExecutionPolicy Bypass -File "%~dp0build.ps1" -Sign

echo.
echo Build complete! Check the publish folder for Corridor.exe
pause
