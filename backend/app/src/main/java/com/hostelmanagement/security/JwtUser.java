package com.hostelmanagement.security;

import com.hostelmanagement.domain.Role;

public record JwtUser(Long userId, String email, Role role) {}
