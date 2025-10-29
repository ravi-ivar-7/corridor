@echo off
REM Code signing script for Corridor
REM This will create a self-signed certificate and sign the executable

echo Creating self-signed certificate and signing executable...
echo.

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "sign.ps1"

echo.
echo Done! Check the output above for any errors.
pause
