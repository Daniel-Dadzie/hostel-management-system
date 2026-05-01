package com.hostelmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hostelmanagement.domain.MaintenanceTicket;
import com.hostelmanagement.domain.MaintenanceTicket.TicketStatus;

@Repository
public interface MaintenanceTicketRepository extends JpaRepository<MaintenanceTicket, Long> {
  List<MaintenanceTicket> findByStudentId(Long studentId);
  
  List<MaintenanceTicket> findByStatus(TicketStatus status);
  
  List<MaintenanceTicket> findByStudentIdAndStatus(Long studentId, TicketStatus status);
  
  @Query("SELECT DISTINCT t FROM MaintenanceTicket t LEFT JOIN FETCH t.student LEFT JOIN FETCH t.room")
  List<MaintenanceTicket> findAllWithStudentAndRoom();
  
  @Query("SELECT DISTINCT t FROM MaintenanceTicket t LEFT JOIN FETCH t.student LEFT JOIN FETCH t.room WHERE t.status = :status")
  List<MaintenanceTicket> findByStatusWithStudentAndRoom(@Param("status") TicketStatus status);
}
