# Corridor AutoStart Diagnostic Script (Simplified Version)
# This script verifies AutoStart configuration

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "    Corridor AutoStart Diagnostic Tool" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$issuesFound = 0
$checksPerformed = 0

# Check 1: Task Scheduler
Write-Host "[1] Checking Task Scheduler..." -ForegroundColor Yellow
$checksPerformed++

try {
    $task = Get-ScheduledTask -TaskName "CorridorClipboardSync" -ErrorAction SilentlyContinue

    if ($task) {
        Write-Host "    [OK] Task found" -ForegroundColor Green
        Write-Host "    Status: $($task.State)" -ForegroundColor Cyan

        if ($task.State -eq "Ready" -or $task.State -eq "Running") {
            Write-Host "    [OK] Task is enabled" -ForegroundColor Green
        } else {
            Write-Host "    [ERROR] Task is $($task.State)" -ForegroundColor Red
            $issuesFound++
        }

        # Check triggers
        $triggers = $task.Triggers
        Write-Host "    Triggers: $($triggers.Count)" -ForegroundColor Cyan

        if ($triggers.Count -ge 3) {
            Write-Host "    [OK] Has 3 triggers" -ForegroundColor Green
        } else {
            Write-Host "    [ERROR] Missing triggers (found $($triggers.Count), expected 3)" -ForegroundColor Red
            $issuesFound++
        }

        # Check action
        $action = $task.Actions[0]
        if ($action) {
            Write-Host "    [OK] Action configured" -ForegroundColor Green
            Write-Host "    Program: $($action.Execute)" -ForegroundColor Cyan

            if ($action.Arguments -like "*--autostart*") {
                Write-Host "    [OK] Has --autostart argument" -ForegroundColor Green
            } else {
                Write-Host "    [ERROR] Missing --autostart argument" -ForegroundColor Red
                $issuesFound++
            }

            if (Test-Path $action.Execute) {
                Write-Host "    [OK] Executable exists" -ForegroundColor Green
            } else {
                Write-Host "    [ERROR] Executable NOT found" -ForegroundColor Red
                $issuesFound++
            }
        }
    } else {
        Write-Host "    [ERROR] Task NOT found" -ForegroundColor Red
        $issuesFound++
    }
} catch {
    Write-Host "    [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    $issuesFound++
}

Write-Host ""

# Check 2: Registry
Write-Host "[2] Checking Registry..." -ForegroundColor Yellow
$checksPerformed++

try {
    $regPath = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
    $regValue = Get-ItemProperty -Path $regPath -Name "ClipboardSync" -ErrorAction SilentlyContinue

    if ($regValue) {
        Write-Host "    [OK] Registry entry found" -ForegroundColor Green
        Write-Host "    Value: $($regValue.ClipboardSync)" -ForegroundColor Cyan
    } else {
        Write-Host "    [INFO] Registry entry not found (Task Scheduler is primary)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "    [WARN] Could not check registry" -ForegroundColor Yellow
}

Write-Host ""

# Check 3: Process Status
Write-Host "[3] Checking Process Status..." -ForegroundColor Yellow
$checksPerformed++

try {
    $processes = Get-Process -Name "Corridor" -ErrorAction SilentlyContinue

    if ($processes) {
        Write-Host "    [OK] Corridor is running" -ForegroundColor Green
        foreach ($proc in $processes) {
            Write-Host "    PID: $($proc.Id)" -ForegroundColor Cyan
            Write-Host "    Path: $($proc.Path)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "    [INFO] Corridor is not running" -ForegroundColor Cyan
    }
} catch {
    Write-Host "    [WARN] Could not check process" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "                   SUMMARY" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Checks Performed: $checksPerformed" -ForegroundColor Cyan

if ($issuesFound -eq 0) {
    Write-Host "Issues Found: 0" -ForegroundColor Green
    Write-Host ""
    Write-Host "[OK] AutoStart appears to be configured correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Test boot: Restart computer" -ForegroundColor Gray
    Write-Host "  2. Test sleep: Sleep then wake" -ForegroundColor Gray
    Write-Host "  3. Test lock: Lock then unlock" -ForegroundColor Gray
} else {
    Write-Host "Issues Found: $issuesFound" -ForegroundColor Red
    Write-Host ""
    Write-Host "[ERROR] Issues need attention!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Recommended Fix:" -ForegroundColor Yellow
    Write-Host "  1. Open Corridor app" -ForegroundColor Gray
    Write-Host "  2. Go to Settings" -ForegroundColor Gray
    Write-Host "  3. Uncheck AutoStart -> Save" -ForegroundColor Gray
    Write-Host "  4. Check AutoStart -> Save" -ForegroundColor Gray
}

Write-Host ""
Write-Host "For details, see: VERIFY_AUTOSTART.MD" -ForegroundColor Cyan
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Pause if run from explorer
if ($Host.Name -eq "ConsoleHost") {
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
