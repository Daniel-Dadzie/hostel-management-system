package com.hostelmanagement.web.dto;

import com.hostelmanagement.domain.Gender;
import com.hostelmanagement.domain.MattressType;
import com.hostelmanagement.domain.RoomStatus;
import java.math.BigDecimal;

public record RoomResponse(
    Long id,
    Long hostelId,
    String hostelName,
    String roomNumber,
    int capacity,
    int currentOccupancy,
    Gender roomGender,
    MattressType mattressType,
    boolean hasAc,
    boolean hasWifi,
    RoomStatus status,
    BigDecimal price,
    int floorNumber) {}
