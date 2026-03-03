package com.hostelmanagement.web.dto;

import com.hostelmanagement.domain.MattressType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ApplyRequest(
    @NotNull @Positive Long hostelId,
    @NotNull @Positive Integer floorNumber,
    @NotNull @Positive Long roomId,
    boolean hasAc,
    boolean hasWifi,
    @NotNull MattressType mattressType,
    @Size(max = 500) String specialRequests) {}
