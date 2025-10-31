# 🔍 Corridor AutoStart Verification Guide

Complete guide to verify if AutoStart is properly configured for Corridor Clipboard Sync.

---

## 📋 Table of Contents

1. [Quick Verification](#quick-verification)
2. [Automated Script](#automated-script)
3. [Manual Verification Methods](#manual-verification-methods)
4. [Testing AutoStart](#testing-autostart)
5. [Troubleshooting](#troubleshooting)
6. [Common Issues](#common-issues)

---

## 🚀 Quick Verification

### Quick Checklist

Use this checklist to quickly verify AutoStart:

```
☐ Task "CorridorClipboardSync" exists in Task Scheduler
☐ Task state is "Ready" (not Disabled)
☐ Task has 3 triggers (Boot, Logon, Unlock)
☐ All 3 triggers are Enabled
☐ Action points to correct .exe path
☐ Arguments include "--autostart"
☐ Registry entry exists (optional fallback)
☐ Test: Restart computer → App starts within 15 seconds
☐ Test: Sleep → Wake → App starts within 10 seconds
☐ Test: Lock → Unlock → App starts within 10 seconds
```

---

## 🤖 Automated Script

### Using the Diagnostic Script

The easiest way to verify AutoStart configuration:

```powershell
# Navigate to the windows directory
cd E:\corridor\windows

# Run the diagnostic script
powershell -ExecutionPolicy Bypass -File CheckAutoStart.ps1
```

**What it checks:**
- ✅ Task Scheduler configuration
- ✅ All 3 triggers (Boot, Logon, Unlock)
- ✅ Registry fallback entry
- ✅ Current process status
- ✅ Task execution history
- ✅ Network conditions

**Sample Output:**
```
=====================================================
    Corridor AutoStart Diagnostic Tool
=====================================================

[1] Checking Task Scheduler Configuration...
    ✓ Task 'CorridorClipboardSync' found
    → Status: Ready
    ✓ Task is enabled and ready
    → Triggers found: 3
    ✓ Has 3 trigger(s) (expected: 3)
    ✓ Boot trigger configured
    ✓ Logon trigger configured
    ✓ Unlock trigger configured
    ✓ Action configured
    ✓ Correct arguments (includes --autostart)
    ✓ Executable file exists

[2] Checking Registry Configuration (Fallback)...
    ✓ Registry entry 'ClipboardSync' found
    ✓ Correct arguments (includes --autostart)
    ✓ Executable file exists

[3] Checking if Corridor is currently running...
    ✓ Corridor is currently running
    → Process ID: 12345
    → Path: E:\corridor\windows\bin\Debug\net9.0-windows\Corridor.exe

=====================================================
                   SUMMARY
=====================================================

Checks Performed: 5
Issues Found: 0

✓ AutoStart appears to be configured correctly!
```

---

## 🔧 Manual Verification Methods

### Method 1: Task Scheduler (Primary) ⭐

**Open Task Scheduler:**
```
Win + R → taskschd.msc → Enter
```

**Navigate to:**
```
Task Scheduler Library → CorridorClipboardSync
```

#### **Check General Tab:**
```
Name: CorridorClipboardSync
Description: Starts Corridor Clipboard Sync on system startup, logon, and wake from sleep
Author: Corridor
Security options: Run only when user is logged on
Status: Ready ✅
```

#### **Check Triggers Tab (MOST IMPORTANT):**

Should see exactly **3 triggers**:

| # | Trigger Type | Settings | Status |
|---|--------------|----------|--------|
| 1 | **At system startup** | Delay: 10 seconds | ✅ Enabled |
| 2 | **At log on** | Any user, Delay: 5 seconds | ✅ Enabled |
| 3 | **On workstation unlock** | Any user, Delay: 3 seconds | ✅ Enabled |

**Detailed Trigger Settings:**

**Trigger 1 - Boot:**
```
Begin the task: At startup
Delay task for: 10 seconds
Repeat task every: <not set>
Stop task if it runs longer than: <not set>
Enabled: ✅ Yes
```

**Trigger 2 - Logon:**
```
Begin the task: At log on
Specific user or group: <Any user>
Delay task for: 5 seconds
Enabled: ✅ Yes
```

**Trigger 3 - Unlock (Wake from Sleep):**
```
Begin the task: On workstation unlock
Specific user or group: <Any user>
Delay task for: 3 seconds
Enabled: ✅ Yes
```

#### **Check Actions Tab:**
```
Action: Start a program
Program/script: E:\corridor\windows\bin\Debug\net9.0-windows\Corridor.exe
Add arguments: --autostart
Start in: (Optional)
```

**Important:** Path should point to your actual build location.

#### **Check Conditions Tab:**
```
☑️ Start only if the following network connection is available: Any connection
☐ Stop if the computer switches to battery power
☐ Start the task only if the computer is on AC power
```

#### **Check Settings Tab:**
```
☑️ Allow task to be run on demand
☑️ Run task as soon as possible after a scheduled start is missed
☐ If the task fails, restart every: <unchecked>
Stop the task if it runs longer than: <unchecked>
If the running task does not end when requested: Do not wait
If the task is already running: Do not start a new instance ✅
```

#### **Check History Tab:**

Enable history first:
```
Right-click "Task Scheduler (Local)" → Enable All Tasks History
```

Look for recent events:
```
Event ID 100: Task Started
Event ID 102: Task Completed Successfully
Event ID 200: Action Started
Event ID 201: Action Failed (if any errors)
```

---

### Method 2: Registry Editor (Fallback)

**Open Registry Editor:**
```
Win + R → regedit → Enter
```

**Navigate to:**
```
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
```

**Check for Entry:**
```
Name: ClipboardSync
Type: REG_SZ
Data: "E:\corridor\windows\bin\Debug\net9.0-windows\Corridor.exe" --autostart
```

**Verification Steps:**
1. Look in the right pane for `ClipboardSync`
2. Double-click to see the value
3. Verify path includes full quotes
4. Verify `--autostart` argument is present

**Note:** This is a fallback method. Task Scheduler is the primary method.

---

### Method 3: PowerShell Commands

#### **Check Task Scheduler:**

```powershell
# Get the task
Get-ScheduledTask -TaskName "CorridorClipboardSync"

# Get task details
Get-ScheduledTask -TaskName "CorridorClipboardSync" | Format-List *

# Get task information
Get-ScheduledTask -TaskName "CorridorClipboardSync" | Get-ScheduledTaskInfo

# Get triggers
(Get-ScheduledTask -TaskName "CorridorClipboardSync").Triggers

# Get actions
(Get-ScheduledTask -TaskName "CorridorClipboardSync").Actions

# Get last run time
Get-ScheduledTaskInfo -TaskName "CorridorClipboardSync" | Select-Object LastRunTime, NextRunTime, LastTaskResult
```

**Expected Output:**
```powershell
TaskName          : CorridorClipboardSync
State             : Ready
Triggers          : {MSFT_TaskBootTrigger, MSFT_TaskLogonTrigger, MSFT_TaskSessionStateChangeTrigger}
```

#### **Check Registry:**

```powershell
# Get registry value
Get-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "ClipboardSync"

# Check if value exists
Test-Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -ErrorAction SilentlyContinue
```

#### **Check Running Process:**

```powershell
# Find Corridor process
Get-Process -Name "Corridor" -ErrorAction SilentlyContinue

# Detailed process information
Get-Process -Name "Corridor" | Format-List *

# Check command line arguments
Get-CimInstance Win32_Process -Filter "Name='Corridor.exe'" | Select-Object CommandLine
```

---

### Method 4: Windows Settings

**Windows 10/11 Settings:**
```
Settings → Apps → Startup
```

**Look for:**
```
Name: ClipboardSync or Corridor
Status: On ✅
Impact: Low/Medium
```

**Note:** This shows only the Registry method, not Task Scheduler.

---

### Method 5: Event Viewer

**Open Event Viewer:**
```
Win + R → eventvwr.msc → Enter
```

**Navigate to:**
```
Event Viewer (Local)
  └── Applications and Services Logs
      └── Microsoft
          └── Windows
              └── TaskScheduler
                  └── Operational
```

**Filter Events:**
```
Right-click "Operational" → Filter Current Log
Event IDs: 100, 102, 200, 201
```

**Look for:**
```
Event ID 100: Task Started
  Time: [timestamp]
  Task Name: \CorridorClipboardSync

Event ID 102: Task Completed Successfully
  Time: [timestamp]
  Task Name: \CorridorClipboardSync

Event ID 200: Task Scheduler successfully completed task
  Time: [timestamp]
  Task Name: \CorridorClipboardSync
  Action: Start a program
```

**Error Events:**
```
Event ID 103: Task start failed
Event ID 201: Task Scheduler failed to start action
```

---

## 🧪 Testing AutoStart

### Test 1: Boot Trigger

**Test the system startup trigger:**

```
1. Ensure AutoStart is enabled in app settings
2. Restart computer completely
3. After login, wait 10-15 seconds
4. Open Task Manager (Ctrl+Shift+Esc)
5. Go to "Processes" tab
6. Look for "Corridor.exe"
```

**Expected Result:** ✅ App should be running within 15 seconds of login

---

### Test 2: Logon Trigger

**Test the user logon trigger:**

```
1. Sign out of Windows (Start → User Icon → Sign out)
2. Sign back in with your account
3. Wait 5-10 seconds after desktop appears
4. Check Task Manager for "Corridor.exe"
```

**Expected Result:** ✅ App should start within 10 seconds of login

---

### Test 3: Wake from Sleep (Unlock Trigger)

**Test wake from sleep/hibernation:**

```
1. Close Corridor app completely if running
2. Put computer to sleep:
   - Start → Power → Sleep
   - Or close laptop lid
3. Wake computer:
   - Press power button
   - Open laptop lid
4. Unlock screen
5. Wait 5-10 seconds
6. Check Task Manager for "Corridor.exe"
```

**Expected Result:** ✅ App should start within 10 seconds of unlock

---

### Test 4: Command Line Simulation

**Manually test the AutoStart command:**

```powershell
# Navigate to app directory
cd E:\corridor\windows\bin\Debug\net9.0-windows

# Run with --autostart argument
.\Corridor.exe --autostart
```

**Expected Result:**
- ✅ App starts in configured mode (Silent/Interactive)
- ✅ In Silent mode: No tray icon (unless connection fails)
- ✅ In Interactive mode: Tray icon appears
- ✅ Connection is established automatically

---

### Test 5: Task Scheduler Manual Run

**Test task execution manually:**

```
1. Open Task Scheduler
2. Find "CorridorClipboardSync"
3. Right-click → Run
4. Check Task Manager for "Corridor.exe"
```

**Expected Result:** ✅ App should start immediately

---

## 🔧 Troubleshooting

### Issue 1: Task Not Found

**Symptom:** Task "CorridorClipboardSync" doesn't exist in Task Scheduler

**Solution:**
```
1. Open Corridor app
2. Go to Settings/Setup
3. Check "AutoStart" checkbox
4. Click "Save"
5. Run diagnostic script to verify
```

---

### Issue 2: Task is Disabled

**Symptom:** Task exists but State shows "Disabled"

**Solution:**
```
1. Open Task Scheduler
2. Find "CorridorClipboardSync"
3. Right-click → Enable
4. Verify State changes to "Ready"
```

---

### Issue 3: Wrong Path in Action

**Symptom:** Action points to old/incorrect path

**Solution:**
```
1. Delete the task:
   - Task Scheduler → Right-click task → Delete
2. In Corridor app:
   - Settings → Uncheck AutoStart → Save
   - Settings → Check AutoStart → Save
3. Verify new path is correct
```

---

### Issue 4: Missing Triggers

**Symptom:** Task has fewer than 3 triggers

**Solution:**
```
1. Delete and recreate the task:
   - Task Scheduler → Delete task
   - Corridor app → Disable AutoStart → Save
   - Corridor app → Enable AutoStart → Save
2. Verify all 3 triggers are present
```

---

### Issue 5: Task Fails to Start

**Symptom:** Event Viewer shows "Task start failed" (Event ID 103)

**Check:**
```
1. Verify executable exists at specified path
2. Check file permissions (should be readable/executable)
3. Verify user has permission to run Task Scheduler tasks
4. Check Event Viewer for specific error message
```

**Common Errors:**
```
Error 0x1: Incorrect path or file not found
Error 0x2: Access denied (permissions issue)
Error 0x41301: Task instance already running
```

---

### Issue 6: App Doesn't Start After Sleep

**Symptom:** App doesn't start after waking from sleep

**Check:**
```
1. Verify "On workstation unlock" trigger exists
2. Check trigger is enabled
3. Verify StateChange = SessionUnlock (value 8)
4. Check Event Viewer for execution attempts
```

**Fix:**
```
1. Task Scheduler → Open task
2. Triggers tab → Edit unlock trigger
3. Verify: "On workstation unlock" and "Any user"
4. Test again
```

---

### Issue 7: Multiple Instances Running

**Symptom:** Multiple Corridor.exe processes in Task Manager

**Solution:**
```
1. Task Scheduler → Open task
2. Settings tab → Verify:
   "If the task is already running: Do not start a new instance"
3. Kill all Corridor processes
4. Test AutoStart again
```

---

## 📊 Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Task doesn't exist** | Not in Task Scheduler | Enable AutoStart in app settings |
| **Task is Disabled** | State shows "Disabled" | Right-click task → Enable |
| **Wrong path** | Action shows old path | Delete task, re-enable AutoStart |
| **No triggers** | Triggers tab is empty | Delete task, re-enable AutoStart |
| **Missing boot trigger** | Only 2 triggers | Delete task, re-enable AutoStart |
| **Task failed to start** | Event ID 103 in Event Viewer | Check path, permissions |
| **App requires admin** | Permission errors | Ensure task runs as current user |
| **No network** | Task waiting | Check network connection |
| **Already running** | Multiple instances | Change settings to prevent duplicates |
| **Path contains spaces** | Path errors | Ensure path is in quotes |

---

## 🎯 Best Practices

### DO ✅

- Run diagnostic script regularly
- Check Task Scheduler history periodically
- Test all three scenarios (boot, logon, unlock)
- Keep Event Viewer logs enabled
- Verify after Windows updates
- Check path after app updates

### DON'T ❌

- Manually edit Task Scheduler tasks (use app settings)
- Disable Task Scheduler service
- Run multiple instances manually
- Delete Windows system tasks
- Change task security settings unnecessarily

---

## 📝 Quick Reference

### File Locations

```
Application: E:\corridor\windows\bin\Debug\net9.0-windows\Corridor.exe
Config: %APPDATA%\ClipboardSync\config.json
Diagnostic Script: E:\corridor\windows\CheckAutoStart.ps1
```

### Registry Path

```
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Run\ClipboardSync
```

### Task Scheduler Path

```
Task Scheduler Library\CorridorClipboardSync
```

### PowerShell Quick Commands

```powershell
# Check if task exists
Get-ScheduledTask -TaskName "CorridorClipboardSync"

# Get task status
(Get-ScheduledTask -TaskName "CorridorClipboardSync").State

# Check if app is running
Get-Process -Name "Corridor" -ErrorAction SilentlyContinue

# Run diagnostic script
powershell -ExecutionPolicy Bypass -File CheckAutoStart.ps1
```

---

## 🆘 Need Help?

If AutoStart still doesn't work after following this guide:

1. **Run Diagnostic Script:**
   ```powershell
   cd E:\corridor\windows
   powershell -ExecutionPolicy Bypass -File CheckAutoStart.ps1
   ```

2. **Check Event Viewer:**
   ```
   Event Viewer → Windows Logs → Application
   Look for Corridor or Task Scheduler errors
   ```

3. **Re-enable AutoStart:**
   ```
   Open Corridor → Settings
   Uncheck AutoStart → Save
   Check AutoStart → Save
   ```

4. **Verify Manually:**
   ```
   Task Scheduler → Right-click CorridorClipboardSync → Run
   Check if app starts
   ```

---

## 📚 Additional Resources

- **Task Scheduler Documentation:** https://docs.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page
- **Event IDs Reference:** See Event Viewer for specific error codes
- **PowerShell Commands:** `Get-Help Get-ScheduledTask -Full`

---

## ✅ Final Verification Checklist

Before closing, verify all of these:

```
☐ Ran CheckAutoStart.ps1 with 0 issues
☐ Task exists in Task Scheduler
☐ Task state is "Ready"
☐ Has 3 triggers (Boot, Logon, Unlock)
☐ All triggers are enabled
☐ Action path is correct
☐ Arguments include "--autostart"
☐ Tested boot: Restart → App starts
☐ Tested logon: Sign out/in → App starts
☐ Tested wake: Sleep/wake → App starts
☐ Event Viewer shows successful executions
☐ No errors in Event Viewer
```

---

**Last Updated:** 2025-01-31
**Version:** 1.0
**For:** Corridor Clipboard Sync
