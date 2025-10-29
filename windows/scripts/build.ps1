# Corridor Build Script
# This script builds and signs the Corridor application

param(
    [string]$Configuration = "Release",
    [string]$OutputPath = "publish",
    [switch]$Sign = $false,
    [switch]$Clean = $false
)

Write-Host "=== Corridor Build Script ===" -ForegroundColor Cyan

if ($Clean) {
    Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
    dotnet clean --configuration $Configuration
    if (Test-Path $OutputPath) {
        Remove-Item -Recurse -Force $OutputPath
    }
}

Write-Host "Building optimized self-contained executable..." -ForegroundColor Green
$buildCommand = @(
    "dotnet publish"
    "--configuration $Configuration"
    "--self-contained true"
    "--runtime win-x64"
    "--output ./$OutputPath"
    "--p:PublishSingleFile=true"
    "--p:DebugType=None"
    "--p:EnableCompressionInSingleFile=true"
    "--p:IncludeNativeLibrariesForSelfExtract=true"
    "--p:IlcOptimizationPreference=Size"
)

Invoke-Expression ($buildCommand -join " ")

if ($LASTEXITCODE -eq 0) {
    $exePath = Join-Path $OutputPath "Corridor.exe"
    if (Test-Path $exePath) {
        $fileSize = (Get-Item $exePath).Length / 1MB
        Write-Host "Build successful! Executable size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
        
        if ($Sign) {
            Write-Host "Signing executable..." -ForegroundColor Yellow
            & ".\scripts\sign.ps1" -ExePath $exePath
        }
    } else {
        Write-Host "Build failed - executable not found" -ForegroundColor Red
    }
} else {
    Write-Host "Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
