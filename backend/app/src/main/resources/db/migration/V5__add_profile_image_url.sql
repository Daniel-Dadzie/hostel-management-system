-- Add profile image URL column to students table
ALTER TABLE students
ADD COLUMN profile_image_url VARCHAR(500) NULL;
