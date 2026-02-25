-- Add default admin user
-- Password is set via environment variable ADMIN_PASSWORD_HASH (see V4 migration)
-- 
-- SECURITY: The password is set to a random UUID that cannot be used for login.
-- You MUST set ADMIN_PASSWORD_HASH env var before running the application,
-- or manually update the password in the database after startup.
--
-- To manually set password after startup:
-- UPDATE students SET password = '$2a$10$YOUR_BCRYPT_HASH' WHERE email = 'admin@university.edu';
INSERT INTO students (full_name, email, phone, gender, password, role)
VALUES ('System Admin', 'admin@university.edu', '+1234567890', 'MALE', 
        CONCAT('DISABLED_', UUID(), '_CHANGE_ME'), 'ADMIN')
ON DUPLICATE KEY UPDATE role = 'ADMIN';
