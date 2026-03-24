-- Ensure current_level exists on students table.
-- V14 already creates this in newer databases, so this migration is idempotent for mixed environments.
SET @current_level_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'students'
    AND column_name = 'current_level'
);

SET @add_current_level_column_sql = IF(
  @current_level_column_exists = 0,
  'ALTER TABLE students ADD COLUMN current_level INT NOT NULL DEFAULT 100 AFTER email',
  'SELECT 1'
);
PREPARE add_current_level_column_stmt FROM @add_current_level_column_sql;
EXECUTE add_current_level_column_stmt;
DEALLOCATE PREPARE add_current_level_column_stmt;

SET @current_level_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'students'
    AND index_name = 'idx_students_current_level'
);

SET @add_current_level_index_sql = IF(
  @current_level_index_exists = 0,
  'CREATE INDEX idx_students_current_level ON students(current_level)',
  'SELECT 1'
);
PREPARE add_current_level_index_stmt FROM @add_current_level_index_sql;
EXECUTE add_current_level_index_stmt;
DEALLOCATE PREPARE add_current_level_index_stmt;