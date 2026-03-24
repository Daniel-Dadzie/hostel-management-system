CREATE TABLE academic_terms (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  academic_year VARCHAR(20) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reapplication_open_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uk_academic_terms_year_semester UNIQUE (academic_year, semester)
);

ALTER TABLE students
  ADD COLUMN retained_from_checkout BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE bookings
  ADD COLUMN academic_term_id BIGINT NULL,
  ADD CONSTRAINT fk_bookings_academic_term FOREIGN KEY (academic_term_id) REFERENCES academic_terms(id);

CREATE INDEX idx_bookings_academic_term_status ON bookings(academic_term_id, status);

INSERT INTO academic_terms (academic_year, semester, start_date, end_date, reapplication_open_date, is_active)
SELECT DISTINCT
  b.academic_year,
  COALESCE(NULLIF(b.academic_session, ''), '1') AS semester,
  STR_TO_DATE(CONCAT(SUBSTRING_INDEX(b.academic_year, '/', 1), '-09-01'), '%Y-%m-%d') AS start_date,
  STR_TO_DATE(CONCAT(SUBSTRING_INDEX(b.academic_year, '/', -1), '-07-31'), '%Y-%m-%d') AS end_date,
  STR_TO_DATE(CONCAT(SUBSTRING_INDEX(b.academic_year, '/', 1), '-08-01'), '%Y-%m-%d') AS reapplication_open_date,
  FALSE
FROM bookings b
WHERE b.academic_year IS NOT NULL
  AND b.academic_year <> '';

UPDATE bookings b
JOIN academic_terms t
  ON t.academic_year = b.academic_year
  AND t.semester = COALESCE(NULLIF(b.academic_session, ''), '1')
SET b.academic_term_id = t.id;

UPDATE academic_terms t
SET t.is_active = TRUE
WHERE t.id = (
  SELECT x.id
  FROM (
    SELECT id
    FROM academic_terms
    ORDER BY start_date DESC
    LIMIT 1
  ) AS x
);
