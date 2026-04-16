package com.hostelmanagement.web.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating/updating announcements.
 */
public record UpsertAnnouncementRequest(
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be 3-200 characters")
    String title,

    @NotBlank(message = "Body is required")
    @Size(min = 10, max = 5000, message = "Body must be 10-5000 characters")
    String body,

    String expiresAt) {}
