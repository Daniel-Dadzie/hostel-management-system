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
docker run -d --name hostel-mysql -e MYSQL_ROOT_PASSWORD=<set-root-password> -e MYSQL_DATABASE=hostel_db -e MYSQL_USER=hostel_user -e MYSQL_PASSWORD=<set-app-password> -p 3306:3306 mysql:8.4
```

Note: Docker Desktop / the Docker daemon must be running.

This starts MySQL on `127.0.0.1:3306` with:
- Database: `hostel_db`
- Username: `hostel_user`
- Password: `<set-app-password>`

### Option B: Use an existing MySQL install

Create the database and app user using [scripts/mysql-init.sql](scripts/mysql-init.sql)
(run it in MySQL Workbench, phpMyAdmin, or any SQL client).

2) Set env vars (recommended)

PowerShell example:

```powershell
$env:DB_URL='jdbc:mysql://localhost:3307/hostel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
$env:DB_USERNAME='hostel_user'
$env:DB_PASSWORD='<set-app-password>'
$env:JWT_SECRET='change-me-in-env-please-change-me-32-chars-min'
$env:FRONTEND_URL='http://localhost:5173'
$env:SERVER_PORT='8081'
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

If you start with `mvnw` directly, set `SERVER_PORT=8081` first to match frontend defaults.

## Notes

- Booking status uses `PENDING_PAYMENT` for the 30-minute hold.
- Payment status uses `PENDING`/`COMPLETED`/etc.
- Forgot-password rate limiting is Redis-backed when Redis is available.
	If Redis is unavailable, the app falls back to in-memory per-instance limiting.
	In distributed deployments, keep Redis enabled so limits are enforced globally.
- Expired password-reset tokens are cleaned up automatically by a scheduler
	(default every 1 hour, configurable via `RESET_TOKEN_CLEANUP_MS`).
- One-shot room-price migration helper is available at
	`scripts/migrate-room-prices-yearly.sql` with `REDO` (x2) and `REVERT` (/2)
	modes for cross-environment rollout/rollback.

## Troubleshooting: Flyway checksum validation errors

If startup fails with messages like:
- `Detected applied migration not resolved locally`
- `Migration checksum mismatch`

Run Flyway repair, then start the app again:

```powershell
./repair-flyway.ps1
./run-with-mysql.ps1
```

This updates Flyway schema-history metadata in your local MySQL DB to match the current migration files.

## Troubleshooting: Invalid email or password (admin login)

If backend starts successfully but admin login fails with `Invalid email or password`,
reset the default admin account password:

```powershell
./reset-admin-password.ps1
```

This runs `scripts/reset-admin-password.sql` and resets:
- Email: `admin@university.edu`
- Password: `changeme123`
