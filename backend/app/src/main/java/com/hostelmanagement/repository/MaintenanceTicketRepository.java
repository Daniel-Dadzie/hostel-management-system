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
  @Query("SELECT DISTINCT t FROM MaintenanceTicket t LEFT JOIN FETCH t.student LEFT JOIN FETCH t.room WHERE t.student.id = :studentId")
  List<MaintenanceTicket> findByStudentId(@Param("studentId") Long studentId);
  
  List<MaintenanceTicket> findByStatus(TicketStatus status);
  
  @Query("SELECT DISTINCT t FROM MaintenanceTicket t LEFT JOIN FETCH t.student LEFT JOIN FETCH t.room WHERE t.student.id = :studentId AND t.status = :status")
  List<MaintenanceTicket> findByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") TicketStatus status);
  
  @Query("SELECT DISTINCT t FROM MaintenanceTicket t LEFT JOIN FETCH t.student LEFT JOIN FETCH t.room")
  List<MaintenanceTicket> findAllWithStudentAndRoom();
  
  @Query("SELECT DISTINCT t FROM MaintenanceTicket t LEFT JOIN FETCH t.student LEFT JOIN FETCH t.room WHERE t.status = :status")
  List<MaintenanceTicket> findByStatusWithStudentAndRoom(@Param("status") TicketStatus status);
  
  @Query("SELECT DISTINCT t FROM MaintenanceTicket t LEFT JOIN FETCH t.student LEFT JOIN FETCH t.room WHERE t.id = :id")
  java.util.Optional<MaintenanceTicket> findByIdWithStudentAndRoom(@Param("id") Long id);
}
