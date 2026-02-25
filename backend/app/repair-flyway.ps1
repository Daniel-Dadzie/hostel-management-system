Write-Host "Repairing Flyway schema history for local MySQL..." -ForegroundColor Yellow

if (-not $env:DB_URL) {
    $env:DB_URL = "jdbc:mysql://localhost:3306/hostel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
}
if (-not $env:DB_USERNAME) {
    $env:DB_USERNAME = "root"
}
if (-not $env:DB_PASSWORD) {
    $env:DB_PASSWORD = "Ubuntu"
}
if (-not $env:ADMIN_PASSWORD_HASH) {
    $env:ADMIN_PASSWORD_HASH = "PLACEHOLDER_CHANGE_ME"
}

$env:FLYWAY_URL = $env:DB_URL
$env:FLYWAY_USER = $env:DB_USERNAME
$env:FLYWAY_PASSWORD = $env:DB_PASSWORD
$env:FLYWAY_PLACEHOLDERS_ADMINPASSWORDHASH = $env:ADMIN_PASSWORD_HASH

Write-Host "DB URL: $env:DB_URL"
Write-Host "DB User: $env:DB_USERNAME"
Write-Host ""

$javaCmd = Get-Command java -ErrorAction SilentlyContinue
if (-not $javaCmd) {
    Write-Host "Java is not available in this shell. Open the same PowerShell where run-with-mysql.ps1 works, or set JAVA_HOME/PATH." -ForegroundColor Red
    exit 1
}

& ./mvnw.cmd org.flywaydb:flyway-maven-plugin:10.10.0:repair
