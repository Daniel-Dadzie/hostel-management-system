-- One-shot room-price migration helper (MySQL)
-- Purpose:
--   REDO   => convert semester prices to yearly prices (x2)
--   REVERT => convert yearly prices back to semester prices (/2)
--
-- Safety features:
--   1) Writes an audit row per room before changing prices.
--   2) Requires a unique batch tag so accidental re-runs are blocked.
--
-- Usage:
--   1) Set @action to 'REDO' or 'REVERT'.
--   2) Set @batch_tag to a unique value for this run.
--   3) Execute script in hostel_db.

SET @action = 'REDO';
SET @batch_tag = '2026-03-11-yearly-price-redo';

SET @multiplier = CASE
  WHEN UPPER(@action) = 'REDO' THEN 2.00
  WHEN UPPER(@action) = 'REVERT' THEN 0.50
  ELSE NULL
END;

CREATE TABLE IF NOT EXISTS room_price_migration_audit (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT NOT NULL,
  room_number VARCHAR(50) NULL,
  previous_price DECIMAL(10,2) NOT NULL,
  action VARCHAR(10) NOT NULL,
  batch_tag VARCHAR(120) NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_room_price_migration_batch (batch_tag),
  INDEX idx_room_price_migration_room (room_id)
);

SET @can_run = IF(
  @multiplier IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM room_price_migration_audit WHERE batch_tag = @batch_tag LIMIT 1),
  1,
  0
);

START TRANSACTION;

INSERT INTO room_price_migration_audit (room_id, room_number, previous_price, action, batch_tag)
SELECT id, room_number, price, UPPER(@action), @batch_tag
FROM rooms
WHERE price IS NOT NULL
  AND @can_run = 1;

UPDATE rooms
SET price = ROUND(price * @multiplier, 2)
WHERE price IS NOT NULL
  AND @can_run = 1;

COMMIT;

SELECT
  UPPER(@action) AS migration_action,
  @batch_tag AS migration_batch,
  @can_run AS applied,
  COUNT(*) AS rooms_updated
FROM rooms;

SELECT
  CASE
    WHEN @multiplier IS NULL THEN 'No changes applied: invalid @action (use REDO or REVERT).'
    WHEN @can_run = 0 THEN 'No changes applied: batch tag already used.'
    ELSE 'Migration applied successfully.'
  END AS status;

SELECT id, room_number, price
FROM rooms
ORDER BY id;
