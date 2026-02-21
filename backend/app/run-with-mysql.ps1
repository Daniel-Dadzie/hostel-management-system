Write-Host "Tip: First-time setup -> run scripts/create-database.sql in your SQL client." -ForegroundColor Yellow

# MySQL Connection Settings (defaults; can be overridden by existing env vars)
if (-not $env:DB_URL) {
	$env:DB_URL = "jdbc:mysql://localhost:3306/hostel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
}
if (-not $env:DB_USERNAME) {
	$env:DB_USERNAME = "root"
}
if (-not $env:DB_PASSWORD) {
	$env:DB_PASSWORD = "Ubuntu"
}

function Test-PortFree([int]$port) {
	$listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
	return ($null -eq $listeners -or $listeners.Count -eq 0)
}

if (-not $env:SERVER_PORT) {
	foreach ($p in 8081, 8082, 8083) {
		if (Test-PortFree $p) {
			$env:SERVER_PORT = "$p"
			break
		}
	}
	if (-not $env:SERVER_PORT) {
		throw "No free port found in 8081-8083. Set SERVER_PORT manually."
	}
}

# Run the Spring Boot application
Write-Host "Starting Hostel Management System with MySQL..."
Write-Host "Database: hostel_db"
Write-Host "Username: $env:DB_USERNAME"
Write-Host "URL: $env:DB_URL"
Write-Host "Server Port: $env:SERVER_PORT"
Write-Host ""

& ./mvnw.cmd spring-boot:run
