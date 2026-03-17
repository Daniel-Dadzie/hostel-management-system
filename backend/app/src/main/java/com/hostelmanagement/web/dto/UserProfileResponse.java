package com.hostelmanagement.web.dto;

import com.hostelmanagement.domain.Gender;

public record UserProfileResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    Gender gender,
    String profileImagePath,
    String role) {}
