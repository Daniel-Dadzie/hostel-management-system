# ------------------------------
# Clean start for Hostel Backend
# ------------------------------

function Load-DotEnv {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith('#')) {
            return
        }

        $parts = $line -split '=', 2
        if ($parts.Count -ne 2) {
            return
        }

        $key = $parts[0].Trim()
        $value = $parts[1].Trim()

        if (-not $key) {
            return
        }

        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        if (-not [string]::IsNullOrWhiteSpace($value)) {
            Set-Item -Path "env:$key" -Value $value
        }
    }

    Write-Host "Loaded environment variables from $Path"
}

# 1️⃣ Stop any Java processes (optional: only if on port 8080)
Write-Host "Stopping any Java processes using port 8080..."
$processes = Get-NetTCPConnection -LocalPort 8080 -State Listen | Select-Object -ExpandProperty OwningProcess
foreach ($processId in $processes) {
    Write-Host "Stopping process ID $processId..."
    Stop-Process -Id $processId -Force
}

# 2️⃣ Set environment variables
Write-Host "Setting environment variables..."
$envPath = Join-Path $PSScriptRoot ".env"
Load-DotEnv -Path $envPath

if (-not $env:DB_URL) {
    $env:DB_URL = 'jdbc:mysql://localhost:3307/hostel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
}
if (-not $env:DB_USERNAME) {
    $env:DB_USERNAME = 'root'
}
if (-not $env:DB_PASSWORD) {
    $secure = Read-Host "Enter MySQL password for DB user '$($env:DB_USERNAME)'" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $env:DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}
if (-not $env:JWT_SECRET -or $env:JWT_SECRET -like 'change-me*') {
    throw "JWT_SECRET is missing or placeholder. Set it in backend/app/.env before running."
}
if (-not $env:SERVER_PORT) {
    $env:SERVER_PORT = '8080'
}

# 3️⃣ Run the backend
Write-Host "Starting backend..."
Set-Location $PSScriptRoot
.\mvnw.cmd spring-boot:run
