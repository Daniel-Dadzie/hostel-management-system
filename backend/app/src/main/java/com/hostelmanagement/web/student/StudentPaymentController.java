package com.hostelmanagement.web.student;

import com.hostelmanagement.domain.PaymentMethod;
import com.hostelmanagement.security.JwtUser;
import com.hostelmanagement.service.StudentPaymentService;
import com.hostelmanagement.web.student.dto.PaymentGatewayInitResponse;
import com.hostelmanagement.web.student.dto.SubmitPaymentResponse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/student/payments")
@PreAuthorize("hasRole('STUDENT')")
@Validated
public class StudentPaymentController {

  private final StudentPaymentService studentPaymentService;

  public StudentPaymentController(StudentPaymentService studentPaymentService) {
    this.studentPaymentService = studentPaymentService;
  }

  public record GatewayPaymentRequest(@NotNull Long bookingId, @NotNull PaymentMethod paymentMethod) {}

  public record VerifyGatewayPaymentRequest(@NotNull Long bookingId) {}

  public static class SubmitReceiptRequest {
    @NotNull private Long bookingId;
    @NotNull private PaymentMethod paymentMethod;
    @NotBlank private String transactionReference;
    @NotNull private MultipartFile receipt;

    public Long getBookingId() {
      return bookingId;
    }

    public void setBookingId(Long bookingId) {
      this.bookingId = bookingId;
    }

    public PaymentMethod getPaymentMethod() {
      return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
      this.paymentMethod = paymentMethod;
    }

    public String getTransactionReference() {
      return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
      this.transactionReference = transactionReference;
    }

    public MultipartFile getReceipt() {
      return receipt;
    }

    public void setReceipt(MultipartFile receipt) {
      this.receipt = receipt;
    }
  }

  @PostMapping("/submit")
  public ResponseEntity<SubmitPaymentResponse> submitReceipt(
      @AuthenticationPrincipal JwtUser user, @ModelAttribute @Validated SubmitReceiptRequest request) {
    return ResponseEntity.ok(
        studentPaymentService.submitReceipt(
            user.userId(),
            request.getBookingId(),
            request.getPaymentMethod(),
            request.getTransactionReference(),
            request.getReceipt()));
  }

  @PostMapping("/gateway/initiate")
  public ResponseEntity<PaymentGatewayInitResponse> initiateGatewayPayment(
      @AuthenticationPrincipal JwtUser user, @RequestBody @Validated GatewayPaymentRequest request) {
    return ResponseEntity.ok(
        studentPaymentService.initiateGatewayPayment(
            user.userId(), request.bookingId(), request.paymentMethod()));
  }

  @PostMapping("/gateway/verify")
  public ResponseEntity<SubmitPaymentResponse> verifyGatewayPayment(
      @AuthenticationPrincipal JwtUser user,
      @RequestBody @Validated VerifyGatewayPaymentRequest request) {
    return ResponseEntity.ok(studentPaymentService.verifyGatewayPayment(user.userId(), request.bookingId()));
  }
}
