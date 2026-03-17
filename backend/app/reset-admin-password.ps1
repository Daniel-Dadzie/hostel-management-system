Write-Host "Resetting admin password in local MySQL..." -ForegroundColor Yellow

function Import-DotEnv {
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
}

function Test-PortInUse {
	param([int]$Port)
	$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
	return $null -ne $listener
}

function Resolve-DbConnection {
	if ($env:DB_URL -and ($env:DB_URL -match '^jdbc:mysql://([^:/]+):(\d+)/([^?]+)')) {
		return @{
			Host = $Matches[1]
			Port = [int]$Matches[2]
			Database = $Matches[3]
		}
	}

	$resolvedPort = 3306
	if ($env:MYSQL_HOST_PORT) {
		$resolvedPort = [int]$env:MYSQL_HOST_PORT
	} elseif (Test-PortInUse -Port 3307) {
		$resolvedPort = 3307
	} elseif (Test-PortInUse -Port 3306) {
		$resolvedPort = 3306
	}

	$database = if ($env:MYSQL_DATABASE) { $env:MYSQL_DATABASE } elseif ($env:DB_NAME) { $env:DB_NAME } else { 'hostel_db' }
	return @{
		Host = 'localhost'
		Port = $resolvedPort
		Database = $database
	}
}

$envPath = Join-Path $PSScriptRoot '.env'
Import-DotEnv -Path $envPath

if (-not $env:DB_USERNAME) {
	if ($env:MYSQL_USER) {
		$env:DB_USERNAME = $env:MYSQL_USER
	} else {
		$env:DB_USERNAME = 'root'
	}
}

if (-not $env:DB_PASSWORD -or $env:DB_PASSWORD -eq 'change-me' -or $env:DB_PASSWORD -eq '<set-app-password>') {
	$secure = Read-Host "Enter MySQL password for DB user '$($env:DB_USERNAME)'" -AsSecureString
	$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
	$env:DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
	[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

$mysqlCmd = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlCmd) {
	Write-Host 'The mysql CLI was not found in PATH.' -ForegroundColor Red
	Write-Host 'Install MySQL client tools or run scripts/reset-admin-password.sql in your SQL client.' -ForegroundColor Yellow
	exit 1
}

$sqlPath = Join-Path $PSScriptRoot 'scripts\reset-admin-password.sql'
if (-not (Test-Path $sqlPath)) {
	Write-Host "Could not find SQL script at $sqlPath" -ForegroundColor Red
	exit 1
}

$connection = Resolve-DbConnection
Write-Host "MySQL Host: $($connection.Host)"
Write-Host "MySQL Port: $($connection.Port)"
Write-Host "Database: $($connection.Database)"
Write-Host "Username: $($env:DB_USERNAME)"

$env:MYSQL_PWD = $env:DB_PASSWORD
$resetSucceeded = $false
try {
	$mysqlExe = $mysqlCmd.Source
	$sqlContent = Get-Content -Path $sqlPath -Raw
	$sqlContent | & $mysqlExe "--protocol=tcp" "--host=$($connection.Host)" "--port=$($connection.Port)" "--user=$($env:DB_USERNAME)" "$($connection.Database)"
	if ($LASTEXITCODE -ne 0) {
		throw "mysql exited with code $LASTEXITCODE"
	}
	$resetSucceeded = $true
} finally {
	Remove-Item -Path env:MYSQL_PWD -ErrorAction SilentlyContinue
}

if ($resetSucceeded) {
	Write-Host ''
	Write-Host 'Admin password reset completed.' -ForegroundColor Green
	Write-Host 'Login email: admin@university.edu'
	Write-Host 'Login password: daniel123'
	exit 0
}

Write-Host 'Admin password reset failed.' -ForegroundColor Red
exit 1
