package com.hostelmanagement.web.student.dto;

import com.hostelmanagement.domain.PaymentMethod;

public record PaymentGatewayInitResponse(
    Long bookingId,
    PaymentMethod paymentMethod,
    String transactionReference,
    String authorizationUrl,
    String accessCode,
    String message) {}
