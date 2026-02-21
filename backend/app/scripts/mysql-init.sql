-- Dev setup for Hostel Management System
-- Creates DB + a non-root app user.

CREATE DATABASE IF NOT EXISTS hostel_db;

-- Create an app user you can use from Spring Boot
CREATE USER IF NOT EXISTS 'hostel_user'@'%' IDENTIFIED BY 'hostel_pass';
GRANT ALL PRIVILEGES ON hostel_db.* TO 'hostel_user'@'%';
FLUSH PRIVILEGES;
