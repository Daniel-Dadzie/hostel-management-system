package com.hostelmanagement.web.admin.dto;

import com.hostelmanagement.domain.BookingStatus;
import com.hostelmanagement.domain.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record AdminBookingResponse(
    Long id,
    BookingStatus status,
    Instant createdAt,
    String specialRequests,
    Long studentId,
    String studentName,
    String studentEmail,
    String hostelName,
    String roomNumber,
    PaymentStatus paymentStatus,
    BigDecimal paymentAmount,
    Instant paymentDueAt) {}
