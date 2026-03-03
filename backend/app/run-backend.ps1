# ------------------------------
# Clean start for Hostel Backend
# ------------------------------

# 1️⃣ Stop any Java processes (optional: only if on port 8080)
Write-Host "Stopping any Java processes using port 8080..."
$processes = Get-NetTCPConnection -LocalPort 8080 -State Listen | Select-Object -ExpandProperty OwningProcess
foreach ($processId in $processes) {
    Write-Host "Stopping process ID $processId..."
    Stop-Process -Id $processId -Force
}

# 2️⃣ Set environment variables
Write-Host "Setting environment variables..."
$env:DB_URL='jdbc:mysql://localhost:3306/hostel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
$env:DB_USERNAME='root'
if (-not $env:DB_PASSWORD) {
    $secure = Read-Host "Enter MySQL password for DB user '$($env:DB_USERNAME)'" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $env:DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}
$env:JWT_SECRET='change-me-in-env-please-change-me-32-chars-min'
$env:SERVER_PORT='8080'

# 3️⃣ Run the backend
Write-Host "Starting backend..."
Set-Location "C:\Users\dani@\Desktop\java\end-of-semester-project\hostel-management-system\backend\app"
.\mvnw.cmd spring-boot:run
