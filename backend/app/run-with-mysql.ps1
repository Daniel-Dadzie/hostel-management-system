Write-Host "Tip: First-time setup -> run scripts/create-database.sql in your SQL client." -ForegroundColor Yellow

# MySQL Connection Settings (defaults; can be overridden by existing env vars)
if (-not $env:DB_URL) {
	$env:DB_URL = "jdbc:mysql://localhost:3306/hostel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
}
if (-not $env:DB_USERNAME) {
	$env:DB_USERNAME = "root"
}
if (-not $env:DB_PASSWORD) {
	$secure = Read-Host "Enter MySQL password for DB user '$($env:DB_USERNAME)'" -AsSecureString
	$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
	$env:DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
	[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

if (-not $env:SERVER_PORT) {
	$env:SERVER_PORT = "8081"
}

# Set Spring profile for development (enables CORS for localhost)
if (-not $env:SPRING_PROFILES_ACTIVE) {
	$env:SPRING_PROFILES_ACTIVE = "dev"
}

# Run the Spring Boot application
Write-Host "Starting Hostel Management System with MySQL..."
Write-Host "Database: hostel_db"
Write-Host "Username: $env:DB_USERNAME"
Write-Host "URL: $env:DB_URL"
Write-Host "Server Port: $env:SERVER_PORT"
Write-Host ""

& ./mvnw.cmd spring-boot:run

