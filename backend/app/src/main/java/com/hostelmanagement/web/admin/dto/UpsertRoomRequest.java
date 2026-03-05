package com.hostelmanagement.web.admin.dto;

import java.math.BigDecimal;

import com.hostelmanagement.domain.Gender;
import com.hostelmanagement.domain.MattressType;
import com.hostelmanagement.domain.RoomType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpsertRoomRequest(
    @NotNull Long hostelId,
    @NotBlank @Size(max = 20) String roomNumber,
    @Min(1) int capacity,
    @NotNull Gender roomGender,
    @NotNull MattressType mattressType,
    boolean hasAc,
    boolean hasWifi,
    @NotNull BigDecimal price,
    @Min(1) int floorNumber,
    RoomType roomType) {}
