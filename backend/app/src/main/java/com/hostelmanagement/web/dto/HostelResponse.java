package com.hostelmanagement.web.dto;

public record HostelResponse(Long id, String name, String location, int totalRooms, boolean active) {}
