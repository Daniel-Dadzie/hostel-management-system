-- Create maintenance_tickets table for student complaints/maintenance requests

CREATE TABLE maintenance_tickets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  room_id BIGINT NULL,
  category VARCHAR(20) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  admin_notes TEXT NULL,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tickets_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_tickets_room FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Indexes for common query patterns
CREATE INDEX idx_tickets_student ON maintenance_tickets(student_id);
CREATE INDEX idx_tickets_status ON maintenance_tickets(status);
CREATE INDEX idx_tickets_student_status ON maintenance_tickets(student_id, status);
CREATE INDEX idx_tickets_room ON maintenance_tickets(room_id);



