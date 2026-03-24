ALTER TABLE students
  ADD COLUMN current_level INT NOT NULL DEFAULT 100;

ALTER TABLE bookings
  ADD COLUMN academic_year VARCHAR(20) NOT NULL DEFAULT '',
  ADD COLUMN academic_session VARCHAR(20) NOT NULL DEFAULT 'REGULAR',
  ADD COLUMN checked_out_at TIMESTAMP NULL;

UPDATE bookings
SET academic_year = CONCAT(YEAR(created_at), '/', YEAR(created_at) + 1)
WHERE academic_year = '';

CREATE INDEX idx_bookings_academic_year_status ON bookings(academic_year, status);