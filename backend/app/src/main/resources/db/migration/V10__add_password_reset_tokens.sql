-- Add password reset token fields
ALTER TABLE students ADD COLUMN reset_token VARCHAR(255);
ALTER TABLE students ADD COLUMN reset_token_expiry TIMESTAMP;

-- Add index for faster token lookups
CREATE INDEX idx_students_reset_token ON students(reset_token);
