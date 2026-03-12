package com.hostelmanagement.web;

import com.hostelmanagement.service.StudentPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments/webhook")
public class PaymentWebhookController {

  private final StudentPaymentService studentPaymentService;

  public PaymentWebhookController(StudentPaymentService studentPaymentService) {
    this.studentPaymentService = studentPaymentService;
  }

  @PostMapping("/paystack")
  public ResponseEntity<String> paystackWebhook(
      @RequestBody String payload,
      @RequestHeader(value = "x-paystack-signature", required = false) String signature) {
    studentPaymentService.handlePaystackWebhook(payload, signature);
    return ResponseEntity.ok("ok");
  }
}
