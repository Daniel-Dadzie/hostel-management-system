package com.hostelmanagement.web.student.dto;

import com.hostelmanagement.domain.BookingStatus;
import com.hostelmanagement.domain.PaymentMethod;
import com.hostelmanagement.domain.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record SubmitPaymentResponse(
    Long bookingId,
    BookingStatus bookingStatus,
    PaymentStatus paymentStatus,
    PaymentMethod paymentMethod,
    BigDecimal amount,
    String transactionReference,
    String receiptFilename,
    Instant paidAt,
    String message) {}
