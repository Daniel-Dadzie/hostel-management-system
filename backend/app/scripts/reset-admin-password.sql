-- Admin password reset script.
-- This script resets the admin password to a known bcrypt hash.
--
-- The hash below corresponds to the password: daniel123
-- Run this script against hostel_db to reset the admin password.

INSERT INTO students (full_name, email, phone, gender, password, role)
VALUES (
  'System Admin',
  'admin@university.edu',
  '+1234567890',
  'MALE',
  '$2a$10$uR5pmFQgJL./w9wM3JIWGeKyJ7FsCsSZUPNLXhyLhVJ1N1.RnpCLq',
  'ADMIN'
)
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  role = 'ADMIN';

SELECT id, full_name, email, role
FROM students
WHERE email = 'admin@university.edu';
