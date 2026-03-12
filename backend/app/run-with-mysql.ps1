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

function Test-PortInUse {
	param([int]$Port)
	$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
	return $null -ne $listener
}

# If selected port is occupied, bump to the next available one.
[int]$requestedPort = [int]$env:SERVER_PORT
if (Test-PortInUse -Port $requestedPort) {
	[int]$candidate = $requestedPort + 1
	while (Test-PortInUse -Port $candidate) {
		$candidate++
	}
	Write-Host "Port $requestedPort is already in use. Switching to $candidate." -ForegroundColor Yellow
	$env:SERVER_PORT = $candidate.ToString()
}

# Set Spring profile for development (enables CORS for localhost)
if (-not $env:SPRING_PROFILES_ACTIVE) {
	$env:SPRING_PROFILES_ACTIVE = "dev"
}

# Local default: avoid Redis dependency unless explicitly enabled.
if (-not $env:CACHE_TYPE) {
	$env:CACHE_TYPE = "none"
}
if (-not $env:MANAGEMENT_HEALTH_REDIS_ENABLED) {
	$env:MANAGEMENT_HEALTH_REDIS_ENABLED = "false"
}

# Run the Spring Boot application
Write-Host "Starting Hostel Management System with MySQL..."
Write-Host "Database: hostel_db"
Write-Host "Username: $env:DB_USERNAME"
Write-Host "URL: $env:DB_URL"
Write-Host "Server Port: $env:SERVER_PORT"
Write-Host "Cache Type: $env:CACHE_TYPE"
Write-Host ""

& ./mvnw.cmd spring-boot:run

