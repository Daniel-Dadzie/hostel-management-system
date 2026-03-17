package com.hostelmanagement.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequest(
    @NotBlank @Size(max = 120) String fullName,
    @Size(max = 30) String phone,
    @Size(max = 500) String profileImagePath) {}
