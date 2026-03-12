-- Generate a bcrypt hash and paste it below.
-- Example generation with Spring BCryptPasswordEncoder rounds=10.
UPDATE students
SET password = 'PASTE_VALID_BCRYPT_HASH_HERE'
WHERE email = 'admin@university.edu'
  AND role = 'ADMIN';
