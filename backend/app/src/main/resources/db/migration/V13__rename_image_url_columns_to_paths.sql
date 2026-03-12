-- Rename legacy URL columns to path-oriented names.
ALTER TABLE students
  CHANGE COLUMN profile_image_url profile_image_path MEDIUMTEXT NULL;

ALTER TABLE hostels
  CHANGE COLUMN image_url image_path MEDIUMTEXT NULL;
