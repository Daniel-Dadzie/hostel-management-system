package com.hostelmanagement.web.student.dto;

import com.hostelmanagement.domain.MaintenanceTicket.TicketCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateMaintenanceTicketRequest(
    @NotNull(message = "Category is required")
    TicketCategory category,
    
    @NotBlank(message = "Title is required")
    String title,
    
    @NotBlank(message = "Description is required")
    String description,
    
    Long roomId
) {}
