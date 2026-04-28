package com.hostelmanagement.web.admin.dto;

import com.hostelmanagement.domain.MaintenanceTicket.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateMaintenanceTicketRequest(
    @NotNull(message = "Status is required")
    TicketStatus status,
    
    String adminNotes
) {}
