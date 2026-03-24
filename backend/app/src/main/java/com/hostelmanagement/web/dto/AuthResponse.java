package com.hostelmanagement.web.dto;

public record AuthResponse(String accessToken, String refreshToken, String role) {}
