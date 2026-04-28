package com.hostelmanagement.web.student.dto;

import com.hostelmanagement.domain.MaintenanceTicket;
import com.hostelmanagement.domain.MaintenanceTicket.TicketCategory;
import com.hostelmanagement.domain.MaintenanceTicket.TicketStatus;
import java.time.Instant;

public record MaintenanceTicketResponse(
    Long id,
    String title,
    String description,
    TicketCategory category,
    TicketStatus status,
    String adminNotes,
    Instant createdAt,
    Instant resolvedAt,
    Long studentId,
    String studentName,
    Long roomId
) {
  public static MaintenanceTicketResponse from(MaintenanceTicket ticket) {
    return new MaintenanceTicketResponse(
        ticket.getId(),
        ticket.getTitle(),
        ticket.getDescription(),
        ticket.getCategory(),
        ticket.getStatus(),
        ticket.getAdminNotes(),
        ticket.getCreatedAt(),
        ticket.getResolvedAt(),
        ticket.getStudent() != null ? ticket.getStudent().getId() : null,
        ticket.getStudent() != null ? ticket.getStudent().getFullName() : null,
        ticket.getRoom() != null ? ticket.getRoom().getId() : null
    );
  }
}
