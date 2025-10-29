@echo off
REM Silent background mode launcher for Corridor
REM This runs the application completely in the background with no visible windows

start /min "" "publish\Corridor.exe" --silent

REM Optional: Hide the command window immediately
REM If you want to completely hide this batch file window, uncomment the line below:
REM if not "%1"=="am_admin" (powershell start -verb runas '%0' am_admin & exit /b)
