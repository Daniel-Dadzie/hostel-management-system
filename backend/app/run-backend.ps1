# ------------------------------
# Clean start for Hostel Backend
# ------------------------------

# 1️⃣ Stop any Java processes (optional: only if on port 8080)
Write-Host "Stopping any Java processes using port 8080..."
$processes = Get-NetTCPConnection -LocalPort 8080 -State Listen | Select-Object -ExpandProperty OwningProcess
foreach ($pid in $processes) {
    Write-Host "Stopping process ID $pid..."
    Stop-Process -Id $pid -Force
}

# 2️⃣ Set environment variables
Write-Host "Setting environment variables..."
$env:DB_URL='jdbc:mysql://localhost:3306/hostel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
$env:DB_USERNAME='root'
$env:DB_PASSWORD='Ubuntu'
$env:JWT_SECRET='change-me-in-env-please-change-me-32-chars-min'
$env:SERVER_PORT='8080'

# 3️⃣ Run the backend
Write-Host "Starting backend..."
cd "C:\Users\dani@\Desktop\java\end-of-semester-project\hostel-management-system\backend\app"
.\mvnw.cmd spring-boot:run
