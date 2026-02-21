@echo off
set "DB_USERNAME=root"
set "DB_PASSWORD=Ubuntu"
echo Starting Hostel Management System with MySQL...
echo Database: hostel_db
echo Username: %DB_USERNAME%
echo.
call mvnw.cmd spring-boot:run
