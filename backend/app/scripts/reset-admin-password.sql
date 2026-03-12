-- Admin password reset template.
--
-- Usage:
-- 1. Replace PLACEHOLDER_ADMIN_EMAIL and PLACEHOLDER_BCRYPT_HASH.
-- 2. Generate bcrypt hash with cost 10 (do not store plain passwords here).
-- 3. Run this script against hostel_db.

SET @admin_email = 'PLACEHOLDER_ADMIN_EMAIL';
SET @new_bcrypt_hash = 'PLACEHOLDER_BCRYPT_HASH';

UPDATE students
SET password = @new_bcrypt_hash
WHERE email = @admin_email
	AND role = 'ADMIN'
	AND @admin_email <> 'PLACEHOLDER_ADMIN_EMAIL'
	AND @new_bcrypt_hash <> 'PLACEHOLDER_BCRYPT_HASH';

SELECT id, full_name, email, role
FROM students
WHERE email = @admin_email;
