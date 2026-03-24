INSERT INTO academic_terms (
  academic_year,
  semester,
  start_date,
  end_date,
  reapplication_open_date,
  is_active
)
SELECT
  '2025/2026',
  '2',
  '2026-01-13',
  '2026-07-31',
  '2026-08-15',
  TRUE
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM academic_terms);

UPDATE academic_terms t
JOIN (
  SELECT id
  FROM academic_terms
  ORDER BY end_date DESC, id DESC
  LIMIT 1
) latest ON latest.id = t.id
SET t.is_active = TRUE
WHERE NOT EXISTS (SELECT 1 FROM academic_terms WHERE is_active = TRUE);
