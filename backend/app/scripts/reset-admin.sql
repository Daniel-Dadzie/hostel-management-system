-- Reset admin password to a known working value.
-- Login after running this script:
--   Email: admin@university.edu
--   Password: admin123
UPDATE students
SET password = '$2a$10$r0B10wtJG5G15eufG7zjv.QY6X4l3fcDkJBuh0GjVCh6lCjxvUH.q'
WHERE email = 'admin@university.edu' AND role = 'ADMIN';

SELECT id, email, role
FROM students
WHERE email = 'admin@university.edu';
