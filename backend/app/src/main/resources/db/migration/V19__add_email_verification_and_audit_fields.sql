-- Add email verification token fields
ALTER TABLE students ADD COLUMN email_verification_token VARCHAR(255);
ALTER TABLE students ADD COLUMN email_verification_token_expiry TIMESTAMP;
ALTER TABLE students ADD COLUMN is_email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Add password reset audit timestamps
ALTER TABLE students ADD COLUMN last_password_reset_at TIMESTAMP;
ALTER TABLE students ADD COLUMN last_password_reset_attempt_at TIMESTAMP;

-- Add index for email verification token lookups
CREATE INDEX idx_students_email_verification_token ON students(email_verification_token);

-- Backfill email_verified for existing users to true (they are already registered)
UPDATE students SET is_email_verified = TRUE WHERE id IS NOT NULL;
