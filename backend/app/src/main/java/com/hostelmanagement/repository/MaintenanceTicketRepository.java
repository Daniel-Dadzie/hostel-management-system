package com.hostelmanagement.repository;

import com.hostelmanagement.domain.MaintenanceTicket;
import com.hostelmanagement.domain.MaintenanceTicket.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceTicketRepository extends JpaRepository<MaintenanceTicket, Long> {
  List<MaintenanceTicket> findByStudentId(Long studentId);
  
  List<MaintenanceTicket> findByStatus(TicketStatus status);
  
  List<MaintenanceTicket> findByStudentIdAndStatus(Long studentId, TicketStatus status);
}
