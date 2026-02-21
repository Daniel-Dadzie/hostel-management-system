package com.hostelmanagement.web.dto;

import com.hostelmanagement.domain.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(max = 120) String fullName,
    @NotBlank @Email @Size(max = 200) String email,
    @Size(max = 30) String phone,
    @NotNull Gender gender,
    @NotBlank @Size(min = 6, max = 100) String password) {}
