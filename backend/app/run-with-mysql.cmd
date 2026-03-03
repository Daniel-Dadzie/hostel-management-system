@echo off
set "DB_USERNAME=root"
if "%DB_PASSWORD%"=="" (
	echo ERROR: DB_PASSWORD is not set.
	echo Set it first, e.g.:
	echo   set DB_PASSWORD=your_mysql_password
	exit /b 1
)
echo Starting Hostel Management System with MySQL...
echo Database: hostel_db
echo Username: %DB_USERNAME%
echo.
call mvnw.cmd spring-boot:run
