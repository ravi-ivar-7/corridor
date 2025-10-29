# Code Signing Script for Corridor
param(
    [string]$ExePath = "publish\Corridor.exe",
    [string]$CertName = "Corridor Code Signing",
    [string]$Password = "Corridor123!"
)

Write-Host "=== Code Signing Script ===" -ForegroundColor Cyan

if (-not (Test-Path $ExePath)) {
    Write-Host "Executable not found: $ExePath" -ForegroundColor Red
    Write-Host "Please build the application first." -ForegroundColor Yellow
    exit 1
}

Write-Host "Creating self-signed certificate..." -ForegroundColor Green

# Check if certificate already exists
$existingCert = Get-ChildItem -Path "Cert:\CurrentUser\My" | Where-Object { $_.Subject -like "*$CertName*" } | Select-Object -First 1

if ($existingCert) {
    Write-Host "Using existing certificate: $($existingCert.Subject)" -ForegroundColor Yellow
    $cert = $existingCert
} else {
    # Create new certificate
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=$CertName" -KeyUsage DigitalSignature -FriendlyName $CertName -CertStoreLocation "Cert:\CurrentUser\My" -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")
    
    if ($cert) {
        Write-Host "Certificate created successfully!" -ForegroundColor Green
        Write-Host "Thumbprint: $($cert.Thumbprint)" -ForegroundColor Yellow
        
        # Export certificate to PFX file
        $pfxPath = "scripts\Corridor.pfx"
        $securePassword = ConvertTo-SecureString -String $Password -Force -AsPlainText
        Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $securePassword
        Write-Host "Certificate exported to: $pfxPath" -ForegroundColor Green
    } else {
        Write-Host "Failed to create certificate." -ForegroundColor Red
        exit 1
    }
}

# Sign the executable
Write-Host "Signing executable: $ExePath" -ForegroundColor Green

try {
    $result = Set-AuthenticodeSignature -FilePath $ExePath -Certificate $cert -TimestampServer "http://timestamp.digicert.com"
    
    if ($result.Status -eq "Valid" -or $result.Status -eq "UnknownError") {
        Write-Host "Executable signed successfully!" -ForegroundColor Green
        Write-Host "Status: $($result.Status)" -ForegroundColor Yellow
    } else {
        Write-Host "Signing completed with status: $($result.Status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error signing executable: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nNote: Self-signed certificates may still trigger warnings." -ForegroundColor Yellow
Write-Host "For production use, consider purchasing a commercial code signing certificate." -ForegroundColor Yellow
