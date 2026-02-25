-- Set admin password from Flyway placeholder adminPasswordHash
-- Configure via environment variable: ADMIN_PASSWORD_HASH
-- Example: $env:ADMIN_PASSWORD_HASH = '$2a$10$...' (bcrypt hash)
-- 
-- To generate a bcrypt hash for your password, use:
-- Java: new BCryptPasswordEncoder().encode("your-password")
-- Online: https://bcrypt-generator.com/ (use rounds=10)
--
-- SECURITY: If ADMIN_PASSWORD_HASH is not set, this migration will NOT update the password.
-- You must either set the env var before first run, or manually update the password later.
-- The admin account is created with a placeholder password that cannot be used for login.
-- 
-- To manually set the password after startup:
-- UPDATE students SET password = '$2a$10$YOUR_BCRYPT_HASH' WHERE email = 'admin@university.edu';

-- Only update if a valid hash is provided (non-empty placeholder)
-- Flyway will replace ${adminPasswordHash} with empty string if env var is not set
UPDATE students 
SET password = '${adminPasswordHash}' 
WHERE email = 'admin@university.edu' 
  AND role = 'ADMIN' 
  AND '${adminPasswordHash}' <> '';
