package com.hostelmanagement.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import org.springframework.mail.MailException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import com.hostelmanagement.web.notification.NotificationMessage;

/**
 * Sends transactional notification emails off the main request thread.
 *
 * <p>All public methods are annotated {@code @Async("taskExecutor")} so they run in the
 * background thread pool ({@link com.hostelmanagement.config.AsyncConfig}) and never block
 * the student's HTTP response.
 *
 * <p>SMTP is optional. If {@code spring.mail.host} is not set, Spring Boot will not
 * auto-configure {@link JavaMailSender} and the service falls back to structured log-only mode.
 * This means the app starts and runs normally in dev/CI environments without an SMTP server.
 *
 * <p>Also provides WebSocket/STOMP notification methods for real-time browser notifications
 * when admins approve payments or bookings.
 */
@Service
public class NotificationService {

  private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

  private static final DateTimeFormatter FMT =
      DateTimeFormatter.ofPattern("dd MMM yyyy 'at' HH:mm 'UTC'")
          .withZone(ZoneId.of("UTC"));

  /* nullable – JavaMailSender is only configured when spring.mail.host is set */
  private final Optional<JavaMailSender> mailSender;

  /* nullable – SimpMessagingTemplate is optional for WebSocket notifications */
  private final Optional<SimpMessagingTemplate> messagingTemplate;

  public NotificationService(
      @Autowired(required = false) JavaMailSender mailSender,
      @Autowired(required = false) SimpMessagingTemplate messagingTemplate) {
    this.mailSender = Optional.ofNullable(mailSender);
    this.messagingTemplate = Optional.ofNullable(messagingTemplate);
    if (mailSender == null) {
      log.info("[NOTIFICATION] SMTP not configured – emails will be logged only.");
    }
    if (messagingTemplate == null) {
      log.info("[NOTIFICATION] WebSocket not configured – real-time notifications disabled.");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Called after a student's room application is created ({@code PENDING_PAYMENT}).
   * Tells the student their booking details and payment deadline.
   */
  @Async("taskExecutor")
  public void sendBookingConfirmation(
      String email,
      String name,
      String hostel,
      String room,
      BigDecimal amount,
      Instant paymentDue) {

    log.info("[NOTIFICATION] Queuing booking-confirmation → {}", email);
    send(
        email,
        "Room Booking Submitted – " + hostel + " Room " + room,
        bookingConfirmationBody(name, hostel, room, amount, paymentDue));
  }

  /**
   * Called after an admin approves a student's payment ({@code APPROVED}).
   * Confirms the room is fully secured.
   */
  @Async("taskExecutor")
  public void sendPaymentApproval(String email, String name, String hostel, String room) {
    log.info("[NOTIFICATION] Queuing payment-approval → {}", email);
    send(
        email,
        "Payment Approved – Room " + room + " Confirmed!",
        paymentApprovalBody(name, hostel, room));
  }

  /**
   * Called as a reminder before booking expires.
   * Warns the student that payment is due soon.
   */
  @Async("taskExecutor")
  public void sendPaymentReminder(
      String email,
      String name,
      String hostel,
      String room,
      Instant expiresAt) {
    log.info("[NOTIFICATION] Queuing payment-reminder → {}", email);
    send(
        email,
        "Payment Reminder – Complete Your Booking for " + hostel,
        paymentReminderBody(name, hostel, room, expiresAt));
  }

  /**
   * Called after an admin approves a student's password-reset token is generated for an account.
   */
  @Async("taskExecutor")
  public void sendPasswordReset(String email, String name, String resetUrl, Instant expiresAt) {
    log.info("[NOTIFICATION] Queuing password-reset → {}", email);
    send(
        email,
        "Password Reset Request",
        passwordResetBody(name, resetUrl, expiresAt));
  }

  // ─── WebSocket/Real-time Notifications ──────────────────────────────────

  /**
   * Sends a real-time WebSocket notification to a student when their payment is approved.
   * Used for instant browser notifications without page refresh.
   *
   * @param studentId the student to notify
   * @param bookingId the booking ID
   * @param paymentId the payment ID
   */
  public void notifyPaymentApprovedViaWebSocket(Long studentId, Long bookingId, Long paymentId) {
    messagingTemplate.ifPresentOrElse(
        template -> {
          NotificationMessage message =
              NotificationMessage.paymentApproved(studentId, bookingId, paymentId);
          template.convertAndSendToUser(
              studentId.toString(), "/queue/notifications", message);
          log.info(
              "[NOTIFICATION-WS] Sent payment-approval to student {} (booking: {}, payment: {})",
              studentId, bookingId, paymentId);
        },
        () ->
            log.debug(
                "[NOTIFICATION-WS] WebSocket disabled, skipping real-time notification for student {}",
                studentId));
  }

  /**
   * Sends a real-time WebSocket notification to a student when their booking is approved.
   *
   * @param studentId the student to notify
   * @param bookingId the booking ID
   */
  public void notifyBookingApprovedViaWebSocket(Long studentId, Long bookingId) {
    messagingTemplate.ifPresentOrElse(
        template -> {
          NotificationMessage message = NotificationMessage.bookingApproved(studentId, bookingId);
          template.convertAndSendToUser(
              studentId.toString(), "/queue/notifications", message);
          log.info(
              "[NOTIFICATION-WS] Sent booking-approval to student {} (booking: {})",
              studentId, bookingId);
        },
        () ->
            log.debug(
                "[NOTIFICATION-WS] WebSocket disabled, skipping real-time notification for student {}",
                studentId));
  }

  /**
   * Sends a real-time WebSocket notification to a student when their booking is rejected.
   *
   * @param studentId the student to notify
   * @param bookingId the booking ID
   * @param reason optional rejection reason
   */
  public void notifyBookingRejectedViaWebSocket(Long studentId, Long bookingId, String reason) {
    messagingTemplate.ifPresentOrElse(
        template -> {
          NotificationMessage message =
              NotificationMessage.bookingRejected(studentId, bookingId, reason);
          template.convertAndSendToUser(
              studentId.toString(), "/queue/notifications", message);
          log.info(
              "[NOTIFICATION-WS] Sent booking-rejection to student {} (booking: {})",
              studentId, bookingId);
        },
        () ->
            log.debug(
                "[NOTIFICATION-WS] WebSocket disabled, skipping real-time notification for student {}",
                studentId));
  }

  // ─── private helpers ────────────────────────────────────────────────────

  private void send(String to, String subject, String body) {
    mailSender.ifPresentOrElse(
        sender -> {
          try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            sender.send(msg);
            log.info("[NOTIFICATION] Sent '{}' → {}", subject, to);
          } catch (MailException e) {
            log.warn("[NOTIFICATION] Failed to send '{}' → {}: {}", subject, to, e.getMessage());
          }
        },
        () -> log.info("[NOTIFICATION] (no SMTP) '{}' → {}\n{}", subject, to, body));
  }

  private static String bookingConfirmationBody(
      String name, String hostel, String room, BigDecimal amount, Instant dueAt) {
    return """
        Dear %s,

        Your room application has been successfully submitted.

        Booking Details:
          Hostel   : %s
          Room     : %s
          Amount   : GHS %.2f
          Pay by   : %s

        Please complete your payment before the deadline to secure your allocation.
        Log in to the student portal to upload your payment receipt.

        University Hostel Management System
        """.formatted(name, hostel, room, amount, FMT.format(dueAt));
  }

  private static String paymentApprovalBody(String name, String hostel, String room) {
    return """
        Dear %s,

        Great news! Your payment has been verified and your room allocation is now confirmed.

          Hostel : %s
          Room   : %s

        Please visit the hostel office to collect your key.
        Welcome to your new home!

        University Hostel Management System
        """.formatted(name, hostel, room);
  }

  private static String paymentReminderBody(String name, String hostel, String room, Instant expiresAt) {
    return """
        Dear %s,

        This is a reminder that your room booking for %s (Room %s) will expire soon.

        Please complete your payment immediately to secure your allocation.
        Your booking will expire at: %s

        Log in to the student portal to upload your payment receipt.
        If you have already made payment, please ignore this reminder.

        University Hostel Management System
        """.formatted(name, hostel, room, FMT.format(expiresAt));
  }

  private static String passwordResetBody(String name, String resetUrl, Instant expiresAt) {
    return """
        Dear %s,

        We received a request to reset your password.

        Reset your password using this secure link:
        %s

        This link expires at: %s

        If you did not request this change, you can ignore this email safely.

        University Hostel Management System
        """.formatted(name, resetUrl, FMT.format(expiresAt));
  }
}
