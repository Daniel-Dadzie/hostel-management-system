package com.hostelmanagement.web.dto;

import java.math.BigDecimal;

public record HostelResponse(
	Long id,
	String name,
	String location,
	String imageUrl,
	BigDecimal distanceToCampusKm,
	int totalRooms,
	boolean active) {}
