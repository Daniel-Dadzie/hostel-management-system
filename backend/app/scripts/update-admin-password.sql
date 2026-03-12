-- Update admin password template.
-- Replace placeholders before execution.

SET @admin_email = 'PLACEHOLDER_ADMIN_EMAIL';
SET @new_bcrypt_hash = 'PLACEHOLDER_BCRYPT_HASH';

UPDATE students
SET password = @new_bcrypt_hash
WHERE email = @admin_email
  AND role = 'ADMIN'
  AND @admin_email <> 'PLACEHOLDER_ADMIN_EMAIL'
  AND @new_bcrypt_hash <> 'PLACEHOLDER_BCRYPT_HASH';

SELECT id, email, role
FROM students
WHERE email = @admin_email;
