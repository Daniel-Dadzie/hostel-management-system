SET @profile_image_url_exists := (
	SELECT COUNT(*)
	FROM INFORMATION_SCHEMA.COLUMNS
	WHERE TABLE_SCHEMA = DATABASE()
		AND TABLE_NAME = 'students'
		AND COLUMN_NAME = 'profile_image_url'
);

SET @profile_image_url_ddl := IF(
	@profile_image_url_exists = 0,
	'ALTER TABLE students ADD COLUMN profile_image_url VARCHAR(500) NULL',
	'SELECT 1'
);

PREPARE profile_image_url_stmt FROM @profile_image_url_ddl;
EXECUTE profile_image_url_stmt;
DEALLOCATE PREPARE profile_image_url_stmt;
