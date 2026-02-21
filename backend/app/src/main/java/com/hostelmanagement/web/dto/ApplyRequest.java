package com.hostelmanagement.web.dto;

import com.hostelmanagement.domain.MattressType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ApplyRequest(
    boolean hasAc,
    boolean hasWifi,
    @NotNull MattressType mattressType,
    @Size(max = 500) String specialRequests) {}
