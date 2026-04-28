package com.hostelmanagement.web.admin;

import com.hostelmanagement.domain.MaintenanceTicket.TicketStatus;
import com.hostelmanagement.service.MaintenanceTicketService;
import com.hostelmanagement.web.admin.dto.UpdateMaintenanceTicketRequest;
import com.hostelmanagement.web.student.dto.MaintenanceTicketResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin endpoints for managing maintenance tickets and student complaints.
 */
@RestController
@RequestMapping("/api/admin/maintenance-tickets")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMaintenanceController {

  private final MaintenanceTicketService maintenanceTicketService;

  public AdminMaintenanceController(MaintenanceTicketService maintenanceTicketService) {
    this.maintenanceTicketService = maintenanceTicketService;
  }

  /**
   * Get all maintenance tickets across all students.
   */
  @GetMapping
  public ResponseEntity<List<MaintenanceTicketResponse>> getAllTickets() {
    var tickets = maintenanceTicketService.getAllTickets();
    var response = tickets.stream()
        .map(MaintenanceTicketResponse::from)
        .toList();
    return ResponseEntity.ok(response);
  }

  /**
   * Get all tickets with a specific status (OPEN, IN_PROGRESS, RESOLVED, CLOSED).
   */
  @GetMapping("/by-status/{status}")
  public ResponseEntity<List<MaintenanceTicketResponse>> getTicketsByStatus(
      @PathVariable TicketStatus status) {
    var tickets = maintenanceTicketService.getTicketsByStatus(status);
    var response = tickets.stream()
        .map(MaintenanceTicketResponse::from)
        .toList();
    return ResponseEntity.ok(response);
  }

  /**
   * Get a specific ticket by ID.
   */
  @GetMapping("/{id}")
  public ResponseEntity<MaintenanceTicketResponse> getTicket(@PathVariable Long id) {
    var ticket = maintenanceTicketService.getTicketById(id);
    return ResponseEntity.ok(MaintenanceTicketResponse.from(ticket));
  }

  /**
   * Update a ticket's status and add admin notes.
   */
  @PutMapping("/{id}")
  public ResponseEntity<MaintenanceTicketResponse> updateTicket(
      @PathVariable Long id,
      @Valid @RequestBody UpdateMaintenanceTicketRequest request) {
    var ticket = maintenanceTicketService.updateTicketStatus(
        id,
        request.status(),
        request.adminNotes()
    );
    return ResponseEntity.ok(MaintenanceTicketResponse.from(ticket));
  }
}
