INSERT INTO students (full_name, email, phone, gender, password, role)
VALUES ('System Admin', 'admin@university.edu', '+1234567890', 'MALE', '$2a$10$replace_me_with_real_hash', 'ADMIN')
ON DUPLICATE KEY UPDATE email = email;
