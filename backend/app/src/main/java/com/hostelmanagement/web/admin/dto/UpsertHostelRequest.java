package com.hostelmanagement.web.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertHostelRequest(
    @NotBlank @Size(max = 100) String name,
    @Size(max = 200) String location,
    boolean active) {}
