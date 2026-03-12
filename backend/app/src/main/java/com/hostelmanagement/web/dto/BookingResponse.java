package com.hostelmanagement.web.dto;

import com.hostelmanagement.domain.BookingStatus;
import com.hostelmanagement.domain.PaymentMethod;
import com.hostelmanagement.domain.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record BookingResponse(
    Long id,
    BookingStatus status,
    String hostelName,
    String roomNumber,
    Instant paymentDueAt,
    PaymentStatus paymentStatus,
    BigDecimal paymentAmount,
    PaymentMethod paymentMethod,
    String transactionReference,
    String receiptFilename,
    Instant paidAt) {}
