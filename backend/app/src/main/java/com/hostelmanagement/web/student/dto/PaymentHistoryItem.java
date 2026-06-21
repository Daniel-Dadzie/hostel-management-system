package com.hostelmanagement.web.student.dto;

import com.hostelmanagement.domain.PaymentMethod;
import com.hostelmanagement.domain.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record PaymentHistoryItem(
    Long id,
    Long bookingId,
    BigDecimal amount,
    PaymentStatus status,
    PaymentMethod paymentMethod,
    String transactionReference,
    Instant dueAt,
    Instant paidAt,
    String receiptFilename,
    boolean hasReceipt) {}
