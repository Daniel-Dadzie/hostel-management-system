package com.hostelmanagement.web.admin.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertHostelRequest(
    @NotBlank @Size(max = 100) String name,
    @Size(max = 200) String location,
    @Size(max = 500) String imageUrl,
    @DecimalMin(value = "0.0", inclusive = true)
    @Digits(integer = 4, fraction = 2)
    BigDecimal distanceToCampusKm,
    boolean active) {}
