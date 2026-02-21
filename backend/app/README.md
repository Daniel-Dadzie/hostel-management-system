# Hostel Management System (Backend)

Spring Boot 3 + Java 21 + MySQL + JPA + JWT.

## Run (dev)

### Quickstart (MySQL80 on Windows)

1) Ensure `hostel_db` exists (run once):
- Run [scripts/create-database.sql](scripts/create-database.sql) in your SQL client.

2) Start the backend (sets DB env vars + uses port 8081 by default):

If PowerShell blocks scripts, run with a one-time bypass:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-with-mysql.ps1
```

### Option A (easiest): MySQL via Docker

From `backend/app`:

```powershell
docker compose up -d
```

If `docker compose` is not available, or you prefer not to use Compose:

```powershell
docker run -d --name hostel-mysql -e MYSQL_ROOT_PASSWORD=rootpass -e MYSQL_DATABASE=hostel_db -e MYSQL_USER=hostel_user -e MYSQL_PASSWORD=hostel_pass -p 3306:3306 mysql:8.4
```

Note: Docker Desktop / the Docker daemon must be running.

This starts MySQL on `127.0.0.1:3306` with:
- Database: `hostel_db`
- Username: `hostel_user`
- Password: `hostel_pass`

### Option B: Use an existing MySQL install

Create the database and app user using [scripts/mysql-init.sql](scripts/mysql-init.sql)
(run it in MySQL Workbench, phpMyAdmin, or any SQL client).

2) Set env vars (recommended)

PowerShell example:

```powershell
$env:DB_URL='jdbc:mysql://localhost:3306/hostel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
$env:DB_USERNAME='hostel_user'
$env:DB_PASSWORD='hostel_pass'
$env:JWT_SECRET='change-me-in-env-please-change-me-32-chars-min'
$env:FRONTEND_URL='http://localhost:5173'
```

Or copy values from [.env.example](.env.example).

3) Start:

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
./mvnw.cmd spring-boot:run
```

## Notes

- Booking status uses `PENDING_PAYMENT` for the 30-minute hold.
- Payment status uses `PENDING`/`COMPLETED`/etc.
