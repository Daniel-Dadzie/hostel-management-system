package com.hostelmanagement.web.student.dto;

import com.hostelmanagement.domain.Gender;

public record StudentProfileResponse(
	Long id,
	String fullName,
	String email,
	String phone,
	Gender gender,
	String profileImageUrl) {}
