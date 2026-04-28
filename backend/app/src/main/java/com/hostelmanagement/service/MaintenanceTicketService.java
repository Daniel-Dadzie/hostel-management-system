package com.hostelmanagement.service;

import com.hostelmanagement.domain.MaintenanceTicket;
import com.hostelmanagement.domain.MaintenanceTicket.TicketCategory;
import com.hostelmanagement.domain.MaintenanceTicket.TicketStatus;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.MaintenanceTicketRepository;
import com.hostelmanagement.repository.StudentRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class MaintenanceTicketService {

  private final MaintenanceTicketRepository ticketRepository;
  private final StudentRepository studentRepository;

  public MaintenanceTicketService(
      MaintenanceTicketRepository ticketRepository,
      StudentRepository studentRepository) {
    this.ticketRepository = ticketRepository;
    this.studentRepository = studentRepository;
  }

  @Transactional
  public MaintenanceTicket createTicket(Long studentId, TicketCategory category, String title, 
      String description, Long roomId) {
    Student student = studentRepository.findById(studentId)
        .orElseThrow(() -> new IllegalArgumentException("Student not found"));

    MaintenanceTicket ticket = new MaintenanceTicket();
    ticket.setStudent(student);
    ticket.setCategory(category);
    ticket.setTitle(title);
    ticket.setDescription(description);
    ticket.setStatus(TicketStatus.OPEN);

    return ticketRepository.save(ticket);
  }

  @Transactional(readOnly = true)
  public List<MaintenanceTicket> getTicketsForStudent(Long studentId) {
    return ticketRepository.findByStudentId(studentId);
  }

  @Transactional(readOnly = true)
  public List<MaintenanceTicket> getAllTickets() {
    return ticketRepository.findAll();
  }

  @Transactional(readOnly = true)
  public List<MaintenanceTicket> getTicketsByStatus(TicketStatus status) {
    return ticketRepository.findByStatus(status);
  }

  @CacheEvict(value = "maintenance-tickets", allEntries = true)
  @Transactional
  public MaintenanceTicket updateTicketStatus(Long ticketId, TicketStatus status, String adminNotes) {
    MaintenanceTicket ticket = ticketRepository.findById(ticketId)
        .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

    ticket.setStatus(status);
    if (adminNotes != null && !adminNotes.isBlank()) {
      ticket.setAdminNotes(adminNotes);
    }
    
    if (status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED) {
      ticket.setResolvedAt(Instant.now());
    }

    return ticketRepository.save(ticket);
  }

  @Transactional(readOnly = true)
  public MaintenanceTicket getTicketById(Long ticketId) {
    return ticketRepository.findById(ticketId)
        .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
  }
}
