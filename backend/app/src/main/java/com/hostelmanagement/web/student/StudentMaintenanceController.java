package com.hostelmanagement.web.student;

import com.hostelmanagement.domain.MaintenanceTicket.TicketCategory;
import com.hostelmanagement.service.MaintenanceTicketService;
import com.hostelmanagement.web.auth.AuthUser;
import com.hostelmanagement.web.student.dto.CreateMaintenanceTicketRequest;
import com.hostelmanagement.web.student.dto.MaintenanceTicketResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Student endpoints for maintenance tickets and complaints.
 */
@RestController
@RequestMapping("/api/student/maintenance-tickets")
public class StudentMaintenanceController {

  private final MaintenanceTicketService maintenanceTicketService;

  public StudentMaintenanceController(MaintenanceTicketService maintenanceTicketService) {
    this.maintenanceTicketService = maintenanceTicketService;
  }

  /**
   * Create a new maintenance ticket/complaint.
   */
  @PostMapping
  public ResponseEntity<MaintenanceTicketResponse> createTicket(
      @AuthenticationPrincipal AuthUser user,
      @Valid @RequestBody CreateMaintenanceTicketRequest request) {
    var ticket = maintenanceTicketService.createTicket(
        user.userId(),
        request.category(),
        request.title(),
        request.description(),
        request.roomId()
    );
    return ResponseEntity.status(HttpStatus.CREATED).body(MaintenanceTicketResponse.from(ticket));
  }

  /**
   * Get all tickets for the authenticated student.
   */
  @GetMapping
  public ResponseEntity<List<MaintenanceTicketResponse>> getMyTickets(
      @AuthenticationPrincipal AuthUser user) {
    var tickets = maintenanceTicketService.getTicketsForStudent(user.userId());
    var response = tickets.stream()
        .map(MaintenanceTicketResponse::from)
        .toList();
    return ResponseEntity.ok(response);
  }

  /**
   * Get a specific ticket by ID (must own the ticket).
   */
  @GetMapping("/{id}")
  public ResponseEntity<MaintenanceTicketResponse> getTicket(
      @AuthenticationPrincipal AuthUser user,
      @PathVariable Long id) {
    var ticket = maintenanceTicketService.getTicketById(id);
    
    // Verify the student owns this ticket
    if (!ticket.getStudent().getId().equals(user.userId())) {
      return ResponseEntity.status(403).build();
    }
    
    return ResponseEntity.ok(MaintenanceTicketResponse.from(ticket));
  }
}
