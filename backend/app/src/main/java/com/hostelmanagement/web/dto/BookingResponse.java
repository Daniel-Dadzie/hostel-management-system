package com.hostelmanagement.web.dto;

import com.hostelmanagement.domain.BookingStatus;
import java.time.Instant;

public record BookingResponse(
    Long id,
    BookingStatus status,
    String hostelName,
    String roomNumber,
    Instant paymentDueAt) {}
