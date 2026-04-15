package com.hostelmanagement.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hostelmanagement.domain.Booking;
import com.hostelmanagement.domain.BookingStatus;
import com.hostelmanagement.domain.Payment;
import com.hostelmanagement.domain.PaymentMethod;
import com.hostelmanagement.domain.PaymentStatus;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.BookingRepository;
import com.hostelmanagement.repository.PaymentRepository;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
class StudentPaymentServiceTest {

  private static final String SIGNING_SECRET = "test_webhook_secret";
  private static final String REFERENCE = "HMS-12-1711111111111";

  @Mock private BookingRepository bookingRepository;
  @Mock private PaymentRepository paymentRepository;
  @Mock private BookingService bookingService;
  @Mock private PdfAllocationLetterService pdfAllocationLetterService;

  private StudentPaymentService service;
  private Payment payment;

  @SuppressWarnings({"java:S1144", "unused"}) // Invoked by JUnit lifecycle.
  @BeforeEach
  void setUp() {
    service =
        new StudentPaymentService(
            bookingRepository,
            paymentRepository,
            bookingService,
            pdfAllocationLetterService,
            new ObjectMapper(),
            "https://api.paystack.co",
            "sk_test_key",
            SIGNING_SECRET,
            "http://localhost:3000/student/payments");

    Student student = new Student();
    setId(student, 7L);

    Booking booking = new Booking();
    setId(booking, 12L);
    booking.setStudent(student);
    booking.setStatus(BookingStatus.PENDING_PAYMENT);

    payment = new Payment();
    payment.setStudent(student);
    payment.setBooking(booking);
    payment.setAmount(new BigDecimal("100.00"));
    payment.setPaymentMethod(PaymentMethod.MTN_MOMO);
    payment.setTransactionReference(REFERENCE);
    payment.setStatus(PaymentStatus.PENDING);
  }

  @Test
  void webhookSuccess_withValidSignature_shouldCompletePaymentAndApproveBooking() {
    when(paymentRepository.findByTransactionReference(REFERENCE)).thenReturn(Optional.of(payment));
    String payload = successPayload(REFERENCE, 10000);

    service.handlePaystackWebhook(payload, sign(payload, SIGNING_SECRET));

    assertThat(payment.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
    verify(paymentRepository, times(1)).save(payment);
    verify(bookingService, times(1)).updateStatus(12L, BookingStatus.APPROVED);
  }

  @Test
  void webhook_withInvalidSignature_shouldRejectRequest() {
    String payload = successPayload(REFERENCE, 10000);

    assertThatThrownBy(() -> service.handlePaystackWebhook(payload, "invalid-signature"))
        .isInstanceOf(AccessDeniedException.class)
        .hasMessage("Invalid webhook signature");

    verifyNoInteractions(bookingService);
    verify(paymentRepository, never()).findByTransactionReference(REFERENCE);
    verify(paymentRepository, never()).save(payment);
  }

  @Test
  void webhookReplay_successThenFailed_shouldNotDowngradeCompletedPayment() {
    when(paymentRepository.findByTransactionReference(REFERENCE)).thenReturn(Optional.of(payment));
    String successPayload = successPayload(REFERENCE, 10000);
    service.handlePaystackWebhook(successPayload, sign(successPayload, SIGNING_SECRET));

    String failedPayload = failedPayload(REFERENCE, 10000);
    service.handlePaystackWebhook(failedPayload, sign(failedPayload, SIGNING_SECRET));

    assertThat(payment.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
    verify(paymentRepository, times(1)).save(payment);
    verify(bookingService, times(1)).updateStatus(12L, BookingStatus.APPROVED);
  }

  @Test
  void webhookSuccess_withMismatchedAmount_shouldIgnoreEvent() {
    when(paymentRepository.findByTransactionReference(REFERENCE)).thenReturn(Optional.of(payment));
    String payload = successPayload(REFERENCE, 5000);

    service.handlePaystackWebhook(payload, sign(payload, SIGNING_SECRET));

    assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PENDING);
    verify(paymentRepository, never()).save(payment);
    verifyNoInteractions(bookingService);
  }

  private static String successPayload(String reference, long amount) {
    return """
        {
          "event": "charge.success",
          "data": {
            "reference": "%s",
            "amount": %d,
            "currency": "GHS",
            "metadata": {
              "bookingId": 12,
              "studentId": 7,
              "paymentMethod": "MTN_MOMO"
            }
          }
        }
        """
        .formatted(reference, amount);
  }

  private static String failedPayload(String reference, long amount) {
    return """
        {
          "event": "charge.failed",
          "data": {
            "reference": "%s",
            "amount": %d,
            "currency": "GHS",
            "metadata": {
              "bookingId": 12,
              "studentId": 7,
              "paymentMethod": "MTN_MOMO"
            }
          }
        }
        """
        .formatted(reference, amount);
  }

  private static String sign(String payload, String secret) {
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
      StringBuilder hex = new StringBuilder();
      for (byte b : hash) {
        String segment = Integer.toHexString(0xff & b);
        if (segment.length() == 1) {
          hex.append('0');
        }
        hex.append(segment);
      }
      return hex.toString();
    } catch (GeneralSecurityException ex) {
      throw new IllegalStateException("Unable to sign payload", ex);
    }
  }

  private static void setId(Object target, Long id) {
    try {
      Field field = target.getClass().getDeclaredField("id");
      field.setAccessible(true);
      field.set(target, id);
    } catch (ReflectiveOperationException ex) {
      throw new IllegalStateException("Unable to set id", ex);
    }
  }
}
