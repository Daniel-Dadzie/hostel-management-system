package com.hostelmanagement.service;

import com.hostelmanagement.domain.Booking;
import com.hostelmanagement.domain.BookingStatus;
import com.hostelmanagement.domain.Payment;
import com.hostelmanagement.domain.PaymentMethod;
import com.hostelmanagement.domain.PaymentStatus;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.BookingRepository;
import com.hostelmanagement.repository.PaymentRepository;
import com.hostelmanagement.web.student.dto.PaymentGatewayInitResponse;
import com.hostelmanagement.web.student.dto.SubmitPaymentResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.GeneralSecurityException;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StudentPaymentService {

  private static final long MAX_RECEIPT_SIZE_BYTES = 10L * 1024 * 1024;
  private static final String RECEIPTS_DIR = "uploads/payment-receipts";
  private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder().build();
  
  // Paystack Keys
  private static final String REF_KEY = "reference";
  private static final String AMOUNT_KEY = "amount";
  private static final String CURRENCY_KEY = "currency";
  private static final String METADATA_KEY = "metadata";
  private static final String BOOKING_ID_KEY = "bookingId";
  private static final String STUDENT_ID_KEY = "studentId";
  private static final String PAYMENT_METHOD_KEY = "paymentMethod";

  private final BookingRepository bookingRepository;
  private final PaymentRepository paymentRepository;
  private final BookingService bookingService;
  private final PdfAllocationLetterService pdfAllocationLetterService;
  private final ObjectMapper objectMapper;
  
  private final String paystackBaseUrl;
  private final String paystackSecretKey;
  private final String paystackWebhookSecret;
  private final String paystackCallbackUrl;

  public StudentPaymentService(
      BookingRepository bookingRepository,
      PaymentRepository paymentRepository,
      BookingService bookingService,
      PdfAllocationLetterService pdfAllocationLetterService,
      ObjectMapper objectMapper,
      @Value("${app.payments.paystack.base-url:https://api.paystack.co}") String paystackBaseUrl,
      @Value("${app.payments.paystack.secret-key:}") String paystackSecretKey,
      @Value("${app.payments.paystack.webhook-secret:}") String paystackWebhookSecret,
      @Value("${app.payments.paystack.callback-url:http://localhost:3000/student/payments}") String paystackCallbackUrl) {
    
    this.bookingRepository = bookingRepository;
    this.paymentRepository = paymentRepository;
    this.bookingService = bookingService;
    this.pdfAllocationLetterService = pdfAllocationLetterService;
    this.objectMapper = objectMapper;
    this.paystackBaseUrl = paystackBaseUrl;
    this.paystackSecretKey = paystackSecretKey;
    this.paystackWebhookSecret = paystackWebhookSecret;
    this.paystackCallbackUrl = paystackCallbackUrl;
  }

  @Transactional
  public SubmitPaymentResponse submitReceipt(
      Long studentId,
      Long bookingId,
      PaymentMethod paymentMethod,
      String transactionReference,
      MultipartFile receipt) {
      
    Payment payment = validateAndGetStudentPayment(studentId, bookingId);

    if (payment.getStatus() == PaymentStatus.COMPLETED) {
      throw new IllegalArgumentException("A payment receipt has already been submitted and approved for this booking.");
    }

    if (receipt == null || receipt.isEmpty()) {
      throw new IllegalArgumentException("Receipt file is required");
    }
    if (receipt.getSize() > MAX_RECEIPT_SIZE_BYTES) {
      throw new IllegalArgumentException("Receipt file is too large. Maximum size is 10MB");
    }

    String normalizedReference = normalizeReference(transactionReference);
    String storedPath = storeReceipt(studentId, bookingId, receipt);

    payment.setPaymentMethod(paymentMethod);
    payment.setTransactionReference(normalizedReference);
    payment.setReceiptFilename(receipt.getOriginalFilename());
    payment.setReceiptContentType(receipt.getContentType());
    payment.setReceiptStoragePath(storedPath);
    payment.setStatus(PaymentStatus.PENDING);
    payment.setPaidAt(Instant.now());
    paymentRepository.save(payment);

    return new SubmitPaymentResponse(
        bookingId,
        payment.getBooking().getStatus(),
        payment.getStatus(),
        payment.getPaymentMethod(),
        payment.getAmount(),
        payment.getTransactionReference(),
        payment.getReceiptFilename(),
        payment.getPaidAt(),
        "Payment proof submitted successfully. Awaiting admin confirmation.");
  }

  @Transactional
  public PaymentGatewayInitResponse initiateGatewayPayment(
      Long studentId, Long bookingId, PaymentMethod paymentMethod) {
      
    Payment payment = validateAndGetStudentPayment(studentId, bookingId);
    Student student = payment.getStudent();

    ensurePaystackConfigured();

    String reference = "HMS-" + bookingId + "-" + Instant.now().toEpochMilli();
    long amountInPesewas = toMinorUnits(payment.getAmount());

    List<String> channels = switch (paymentMethod) {
      case MTN_MOMO, TELECEL_CASH -> List.of("mobile_money");
      case VISA_CARD, BANK_CARD -> List.of("card");
    };

    Map<String, Object> payload = Map.of(
        "email", student.getEmail(),
        AMOUNT_KEY, amountInPesewas,
        CURRENCY_KEY, "GHS",
        REF_KEY, reference,
        "callback_url", paystackCallbackUrl,
        "channels", channels,
        METADATA_KEY, Map.of(
            BOOKING_ID_KEY, bookingId,
            STUDENT_ID_KEY, studentId,
            PAYMENT_METHOD_KEY, paymentMethod.name()
        )
    );

    JsonNode data = callPaystack("/transaction/initialize", payload);

    payment.setPaymentMethod(paymentMethod);
    payment.setTransactionReference(reference);
    payment.setStatus(PaymentStatus.PENDING);
    paymentRepository.save(payment);

    return new PaymentGatewayInitResponse(
        bookingId,
        paymentMethod,
        reference,
        data.path("authorization_url").asText(),
        data.path("access_code").asText(),
        "Gateway initialized. Complete payment and then verify payment status.");
  }

  @Transactional
  public SubmitPaymentResponse verifyGatewayPayment(Long studentId, Long bookingId) {
    Payment payment = validateAndGetStudentPaymentForVerification(studentId, bookingId);

    ensurePaystackConfigured();

    if (payment.getTransactionReference() == null || payment.getTransactionReference().isBlank()) {
      throw new IllegalArgumentException("No gateway transaction found for this booking");
    }

    if (payment.getStatus() == PaymentStatus.COMPLETED && payment.getBooking().getStatus() == BookingStatus.APPROVED) {
      return new SubmitPaymentResponse(
          bookingId,
          payment.getBooking().getStatus(),
          payment.getStatus(),
          payment.getPaymentMethod(),
          payment.getAmount(),
          payment.getTransactionReference(),
          payment.getReceiptFilename(),
          payment.getPaidAt(),
          "Payment already verified.");
    }

    JsonNode data = callPaystack("/transaction/verify/" + payment.getTransactionReference(), null);
    validateGatewayPayloadForPayment(data, payment);
    String gatewayStatus = data.path("status").asText("").toLowerCase(Locale.ROOT);

    if (!"success".equals(gatewayStatus)) {
      return new SubmitPaymentResponse(
          bookingId,
          payment.getBooking().getStatus(),
          payment.getStatus(),
          payment.getPaymentMethod(),
          payment.getAmount(),
          payment.getTransactionReference(),
          payment.getReceiptFilename(),
          payment.getPaidAt(),
          "Payment not yet successful. Please complete payment and try verify again.");
    }

    payment.setStatus(PaymentStatus.COMPLETED);
    payment.setPaidAt(Instant.now());
    paymentRepository.save(payment);

    Booking approved = bookingService.updateStatus(bookingId, BookingStatus.APPROVED);

    return new SubmitPaymentResponse(
        bookingId,
        approved.getStatus(),
        payment.getStatus(),
        payment.getPaymentMethod(),
        payment.getAmount(),
        payment.getTransactionReference(),
        payment.getReceiptFilename(),
        payment.getPaidAt(),
        "Payment verified successfully and booking approved.");
  }

  /**
   * Generates a PDF allocation letter for a student's booking. 
   * Validates that the student owns the booking and payment is completed.
   */
  public byte[] generateAllocationLetterPdf(Long studentId, Long bookingId) {
    try {
      Booking booking = bookingRepository.findById(bookingId)
          .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

      if (!booking.getStudent().getId().equals(studentId)) {
        throw new AccessDeniedException("You can only access your own booking");
      }

      Payment payment = paymentRepository.findByBookingId(bookingId)
          .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));

      if (payment.getStatus() != PaymentStatus.COMPLETED) {
        throw new IllegalArgumentException("Allocation letter is only available after successful payment");
      }

      return pdfAllocationLetterService.generateAllocationLetterPdf(booking.getStudent(), booking, payment);
      
    } catch (Exception ex) { // FIXED: Changed IOException to Exception to fix maven compilation error
      throw new IllegalArgumentException("Unable to generate allocation letter: " + ex.getMessage());
    }
  }

  /**
   * Generates a payment receipt PDF for a student's payment. 
   * Validates that the student owns the booking and payment is completed.
   */
  public byte[] generatePaymentReceiptPdf(Long studentId, Long bookingId) {
    try {
      Booking booking = bookingRepository.findById(bookingId)
          .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

      if (!booking.getStudent().getId().equals(studentId)) {
        throw new AccessDeniedException("You can only access your own booking");
      }

      Payment payment = paymentRepository.findByBookingId(bookingId)
          .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));

      if (payment.getStatus() != PaymentStatus.COMPLETED && payment.getStatus() != PaymentStatus.PENDING) {
        throw new IllegalArgumentException("Receipt is only available for pending or completed payments");
      }

      return pdfAllocationLetterService.generatePaymentReceiptPdf(booking.getStudent(), payment, booking);
      
    } catch (Exception ex) { // FIXED: Changed IOException to Exception to fix maven compilation error
      throw new IllegalArgumentException("Unable to generate receipt: " + ex.getMessage());
    }
  }

  // --- Webhook & Helper Methods ---

  @Transactional
  public void handlePaystackWebhook(String payload, String signature) {
    requireValidWebhookSignature(payload, signature);

    try {
      JsonNode root = objectMapper.readTree(payload);
      String event = root.path("event").asText();
      JsonNode data = root.path("data");

      switch (event) {
        case "charge.success" -> handleSuccessfulCharge(data);
        case "charge.failed", "transaction.failed" -> handleFailedPaymentEvent(data);
        default -> { /* Ignore other events */ }
      }
    } catch (IOException ex) {
      throw new IllegalArgumentException("Unable to parse webhook payload");
    }
  }

  private void handleSuccessfulCharge(JsonNode data) {
    String reference = getReference(data);
    if (reference == null) return;

    paymentRepository.findByTransactionReference(reference).ifPresent(payment -> {
      if (!isEventConsistentWithPayment(data, payment) || !canTransitionToCompleted(payment)) {
        return;
      }
      payment.setStatus(PaymentStatus.COMPLETED);
      payment.setPaidAt(Instant.now());
      paymentRepository.save(payment);

      if (payment.getBooking().getStatus() == BookingStatus.PENDING_PAYMENT) {
        bookingService.updateStatus(payment.getBooking().getId(), BookingStatus.APPROVED);
      }
    });
  }

  private void handleFailedPaymentEvent(JsonNode data) {
    String reference = getReference(data);
    if (reference == null) return;

    paymentRepository.findByTransactionReference(reference).ifPresent(payment -> {
      if (!isEventConsistentWithPayment(data, payment) || !canTransitionToCancelled(payment)) {
        return;
      }
      payment.setStatus(PaymentStatus.CANCELLED);
      paymentRepository.save(payment);
    });
  }

  private Payment validateAndGetStudentPayment(Long studentId, Long bookingId) {
    Booking booking = bookingRepository.findById(bookingId)
        .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

    if (!booking.getStudent().getId().equals(studentId)) {
      throw new IllegalArgumentException("You can only pay for your own booking");
    }

    if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
      throw new IllegalArgumentException("Payment is only allowed for pending bookings");
    }

    return paymentRepository.findByBookingId(bookingId)
        .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));
  }

  private Payment validateAndGetStudentPaymentForVerification(Long studentId, Long bookingId) {
    Booking booking = bookingRepository.findById(bookingId)
        .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

    if (!booking.getStudent().getId().equals(studentId)) {
      throw new IllegalArgumentException("You can only verify your own booking payment");
    }

    if (!(booking.getStatus() == BookingStatus.PENDING_PAYMENT || booking.getStatus() == BookingStatus.APPROVED)) {
      throw new IllegalArgumentException("Payment verification is unavailable for this booking status");
    }

    return paymentRepository.findByBookingId(bookingId)
        .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));
  }

  private void ensurePaystackConfigured() {
    if (paystackSecretKey == null || paystackSecretKey.isBlank()) {
      throw new IllegalArgumentException("Payment gateway is not configured. Set PAYSTACK_SECRET_KEY.");
    }
  }

  private long toMinorUnits(BigDecimal amount) {
    if (amount == null) return 0L;
    return amount.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValue();
  }

  private JsonNode callPaystack(String path, Map<String, Object> payload) {
    try {
      HttpRequest.Builder builder = HttpRequest.newBuilder()
          .uri(URI.create(paystackBaseUrl + path))
          .header("Authorization", "Bearer " + paystackSecretKey)
          .header("Content-Type", "application/json");

      if (payload == null) {
        builder.GET();
      } else {
        builder.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)));
      }

      HttpResponse<String> response = HTTP_CLIENT.send(builder.build(), HttpResponse.BodyHandlers.ofString());
      JsonNode root = objectMapper.readTree(response.body());

      if (response.statusCode() < 200 || response.statusCode() >= 300 || !root.path("status").asBoolean(false)) {
        String message = root.path("message").asText("Unable to process payment with gateway");
        throw new IllegalArgumentException(message);
      }

      return root.path("data");
    } catch (InterruptedException ex) {
      Thread.currentThread().interrupt();
      throw new IllegalArgumentException("Payment gateway request failed. Please try again.");
    } catch (IOException ex) {
      throw new IllegalArgumentException("Payment gateway request failed. Please try again.");
    }
  }

  private static String normalizeReference(String transactionReference) {
    String normalized = transactionReference == null ? "" : transactionReference.trim();
    if (normalized.length() < 4 || normalized.length() > 120) {
      throw new IllegalArgumentException("Transaction reference must be between 4 and 120 characters");
    }
    return normalized;
  }

  private static String storeReceipt(Long studentId, Long bookingId, MultipartFile receipt) {
    String original = receipt.getOriginalFilename();
    String safeOriginal = (original == null || original.isBlank()) 
        ? "receipt.bin" 
        : original.replaceAll("[^a-zA-Z0-9._-]", "_");

    String extension = "";
    int dot = safeOriginal.lastIndexOf('.');
    if (dot >= 0) {
      extension = safeOriginal.substring(dot).toLowerCase(Locale.ROOT);
    }

    if (!(extension.equals(".jpg") || extension.equals(".jpeg") || extension.equals(".png") || extension.equals(".pdf"))) {
      throw new IllegalArgumentException("Receipt must be a JPG, PNG, or PDF file");
    }

    String targetFileName = "receipt_" + studentId + "_" + bookingId + "_" + Instant.now().toEpochMilli() + extension;

    try {
      Path dir = Path.of(RECEIPTS_DIR);
      Files.createDirectories(dir);
      Path target = dir.resolve(targetFileName);
      Files.copy(receipt.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
      return target.toString().replace('\\', '/');
    } catch (IOException ex) {
      throw new IllegalArgumentException("Unable to store receipt file. Please try again");
    }
  }

  private void requireValidWebhookSignature(String payload, String signature) {
    if (signature == null || signature.isBlank()) {
      throw new AccessDeniedException("Missing webhook signature");
    }
    String secret = resolveWebhookSecret();
    if (secret == null || secret.isBlank()) {
      throw new IllegalArgumentException("Webhook secret is not configured");
    }
    if (!verifyPaystackSignature(payload, signature, secret)) {
      throw new AccessDeniedException("Invalid webhook signature");
    }
  }

  private String resolveWebhookSecret() {
    return (paystackWebhookSecret != null && !paystackWebhookSecret.isBlank()) 
        ? paystackWebhookSecret 
        : paystackSecretKey;
  }

  private String getReference(JsonNode data) {
    String reference = data.path(REF_KEY).asText(null);
    return (reference == null || reference.isBlank()) ? null : reference;
  }

  private boolean canTransitionToCompleted(Payment payment) {
    return payment.getStatus() == PaymentStatus.PENDING
        && (payment.getBooking().getStatus() == BookingStatus.PENDING_PAYMENT
            || payment.getBooking().getStatus() == BookingStatus.APPROVED);
  }

  private boolean canTransitionToCancelled(Payment payment) {
    return payment.getStatus() == PaymentStatus.PENDING
        && payment.getBooking().getStatus() == BookingStatus.PENDING_PAYMENT;
  }

  private void validateGatewayPayloadForPayment(JsonNode data, Payment payment) {
    if (!Objects.equals(data.path(REF_KEY).asText(""), payment.getTransactionReference())) {
      throw new IllegalArgumentException("Gateway payment reference mismatch");
    }
    if (data.path(AMOUNT_KEY).asLong(-1) != toMinorUnits(payment.getAmount())) {
      throw new IllegalArgumentException("Gateway payment amount mismatch");
    }
    if (!"GHS".equals(data.path(CURRENCY_KEY).asText("").toUpperCase(Locale.ROOT))) {
      throw new IllegalArgumentException("Gateway payment currency mismatch");
    }

    JsonNode metadata = data.path(METADATA_KEY);
    if (!metadata.isMissingNode() && !metadata.isNull()) {
      Long bookingId = parseLongMetadata(metadata, BOOKING_ID_KEY);
      if (bookingId != null && !Objects.equals(bookingId, payment.getBooking().getId())) {
        throw new IllegalArgumentException("Gateway payment booking metadata mismatch");
      }

      Long studentId = parseLongMetadata(metadata, STUDENT_ID_KEY);
      if (studentId != null && !Objects.equals(studentId, payment.getStudent().getId())) {
        throw new IllegalArgumentException("Gateway payment student metadata mismatch");
      }

      String paymentMethod = metadata.path(PAYMENT_METHOD_KEY).asText("");
      if (!paymentMethod.isBlank() && payment.getPaymentMethod() != null
          && !payment.getPaymentMethod().name().equals(paymentMethod)) {
        throw new IllegalArgumentException("Gateway payment method metadata mismatch");
      }
    }
  }

  private boolean isEventConsistentWithPayment(JsonNode data, Payment payment) {
    if (!Objects.equals(data.path(REF_KEY).asText(""), payment.getTransactionReference())) return false;
    if (data.path(AMOUNT_KEY).asLong(-1) != toMinorUnits(payment.getAmount())) return false;
    if (!"GHS".equals(data.path(CURRENCY_KEY).asText("").toUpperCase(Locale.ROOT))) return false;

    JsonNode metadata = data.path(METADATA_KEY);
    if (metadata.isMissingNode() || metadata.isNull()) return true;

    Optional<Long> bookingId = parseLongMetadataOptional(metadata, BOOKING_ID_KEY);
    if (bookingId.isPresent() && !Objects.equals(bookingId.get(), payment.getBooking().getId())) return false;

    Optional<Long> studentId = parseLongMetadataOptional(metadata, STUDENT_ID_KEY);
    if (studentId.isPresent() && !Objects.equals(studentId.get(), payment.getStudent().getId())) return false;

    String paymentMethod = metadata.path(PAYMENT_METHOD_KEY).asText("");
    return paymentMethod.isBlank()
        || payment.getPaymentMethod() == null
        || payment.getPaymentMethod().name().equals(paymentMethod);
  }

  private Long parseLongMetadata(JsonNode metadata, String field) {
    return parseLongMetadataOptional(metadata, field).orElse(null);
  }

  private Optional<Long> parseLongMetadataOptional(JsonNode metadata, String field) {
    JsonNode node = metadata.path(field);
    if (node.isMissingNode() || node.isNull()) return Optional.empty();
    if (node.isNumber()) return Optional.of(node.asLong());
    
    String value = node.asText("").trim();
    if (value.isEmpty()) return Optional.empty();
    
    try {
      return Optional.of(Long.valueOf(value));
    } catch (NumberFormatException ex) {
      throw new IllegalArgumentException("Invalid webhook metadata field: " + field);
    }
  }

  private boolean verifyPaystackSignature(String payload, String signature, String secret) {
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
      mac.init(secretKeySpec);
      byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

      StringBuilder hexString = new StringBuilder();
      for (byte b : hash) {
        String hex = Integer.toHexString(0xff & b);
        if (hex.length() == 1) hexString.append('0');
        hexString.append(hex);
      }

      return java.security.MessageDigest.isEqual(
          hexString.toString().toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8),
          signature.toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8));
    } catch (GeneralSecurityException ex) {
      return false;
    }
  }
}