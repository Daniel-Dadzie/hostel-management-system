Write-Host "Tip: First-time setup -> run scripts/create-database.sql in your SQL client." -ForegroundColor Yellow

function Test-PortInUse {
	param([int]$Port)
	$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
	return $null -ne $listener
}

function Resolve-DbPort {
	if ($env:MYSQL_HOST_PORT) {
		return [int]$env:MYSQL_HOST_PORT
	}
	return 3307
}

# MySQL Connection Settings (defaults; can be overridden by existing env vars)
if (-not $env:DB_URL) {
	$resolvedDbPort = Resolve-DbPort
	$env:DB_URL = "jdbc:mysql://localhost:$resolvedDbPort/hostel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
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

# Local frontend URL for password-reset links and CORS-aware flows.
if (-not $env:FRONTEND_URL) {
	$env:FRONTEND_URL = "http://localhost:3000"
}

# JWT secret is required at startup; provide a dev-only default.
if (-not $env:JWT_SECRET) {
	$env:JWT_SECRET = "local-dev-jwt-secret-change-this-1234567890"
}

# Local default: avoid Redis dependency unless explicitly enabled.
if (-not $env:CACHE_TYPE) {
	$env:CACHE_TYPE = "none"
}
if (-not $env:MANAGEMENT_HEALTH_REDIS_ENABLED) {
	$env:MANAGEMENT_HEALTH_REDIS_ENABLED = "false"
}

# Keep Spring property binding happy even when Redis is disabled.
if (-not $env:REDIS_HOST) {
	$env:REDIS_HOST = "localhost"
}
if (-not $env:REDIS_PORT) {
	$env:REDIS_PORT = "6379"
}

# Run the Spring Boot application
Write-Host "Starting Hostel Management System with MySQL..."
Write-Host "Database: hostel_db"
Write-Host "Username: $env:DB_USERNAME"
Write-Host "URL: $env:DB_URL"
Write-Host "Server Port: $env:SERVER_PORT"
Write-Host "Cache Type: $env:CACHE_TYPE"
Write-Host "Frontend URL: $env:FRONTEND_URL"
Write-Host "Tip: Set MYSQL_HOST_PORT to force a specific MySQL port (for example 3306 or 3307)."
Write-Host ""

$mavenWrapper = Join-Path $PSScriptRoot "mvnw.cmd"
if (-not (Test-Path $mavenWrapper)) {
	throw "Could not find mvnw.cmd at $mavenWrapper"
}

Push-Location $PSScriptRoot
try {
	& $mavenWrapper spring-boot:run
} finally {
	Pop-Location
}

