ALTER TABLE payments
  ADD COLUMN payment_method VARCHAR(30) NULL,
  ADD COLUMN transaction_reference VARCHAR(120) NULL,
  ADD COLUMN receipt_filename VARCHAR(255) NULL,
  ADD COLUMN receipt_content_type VARCHAR(120) NULL,
  ADD COLUMN receipt_storage_path VARCHAR(500) NULL,
  ADD COLUMN paid_at TIMESTAMP NULL;
