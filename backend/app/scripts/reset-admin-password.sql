-- Active: 1771396014254@@127.0.0.1@3306
-- Admin Password Reset Script
-- 
-- Instructions:
-- 1. Run this script in your MySQL database (hostel_db)
-- 2. Generate a bcrypt hash for your desired password at: https://bcrypt-generator.com/ (use 10 rounds)
-- 3. Replace 'YOUR_BCRYPT_HASH' in the UPDATE statement below with the generated hash
-- 4. Execute the script

-- Option A: Reset to a default password (password: "admin123")
-- This hash corresponds to "admin123"
UPDATE students 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMye7Z7cK7hQmE5EHsM8lE9lBOsl7iK0GZq' 
WHERE email = 'ddadzie120@gmail.com' AND role = 'ADMIN';

-- Option B: Set a custom password (uncomment and replace with your hash)
-- UPDATE students 
-- SET password = 'YOUR_BCRYPT_HASH_HERE' 
-- WHERE email = 'ddadzie120@gmail.com' AND role = 'ADMIN';

-- Verify the update
SELECT id, full_name, email, role FROM students WHERE email = 'ddadzie120@gmail.com';
