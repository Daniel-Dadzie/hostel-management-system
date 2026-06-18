package com.hostelmanagement.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import com.hostelmanagement.web.notification.NotificationMessage;

/**
 * Sends transactional notification emails off the main request thread.
 * Upgraded to support responsive HTML MimeMessages for professional branding.
 */
@Service
public class NotificationService {

  private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

  private static final DateTimeFormatter FMT =
      DateTimeFormatter.ofPattern("dd MMM yyyy 'at' HH:mm 'UTC'")
          .withZone(ZoneId.of("UTC"));

  private final Optional<JavaMailSender> mailSender;
  private final Optional<SimpMessagingTemplate> messagingTemplate;

  // ─── Professional HTML Email Wrapper ───
  private static final String HTML_WRAPPER = """
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; padding: 0; background-color: #f3f1ea; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: #0a4a30; padding: 28px 32px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
          .content { padding: 40px 32px; color: #334155; line-height: 1.6; font-size: 16px; }
          .content h2 { margin-top: 0; color: #0f6b46; font-size: 20px; font-weight: 600; }
          .content p { margin: 0 0 20px 0; }
          .data-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
          .data-row { margin-bottom: 12px; font-size: 15px; }
          .data-row:last-child { margin-bottom: 0; }
          .data-label { font-weight: 600; color: #64748b; display: inline-block; width: 90px; }
          .data-value { color: #0f172a; font-weight: 500; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { display: inline-block; background: #0f6b46; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px; }
          .footer { background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer p { margin: 0; color: #64748b; font-size: 13px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UniHostel Management</h1>
          </div>
          <div class="content">
            %s
          </div>
          <div class="footer">
            <p>This is an automated message from the University Hostel Management System.<br>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
      """;

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

  @Async("taskExecutor")
  public void sendBookingConfirmation(
      String email, String name, String hostel, String room, BigDecimal amount, Instant paymentDue) {

    log.info("[NOTIFICATION] Queuing booking-confirmation → {}", email);
    
    String content = """
        <h2>Application Received</h2>
        <p>Dear <strong>%s</strong>,</p>
        <p>Your room application has been successfully submitted and is awaiting payment verification.</p>
        
        <div class="data-box">
          <div class="data-row"><span class="data-label">Hostel:</span> <span class="data-value">%s</span></div>
          <div class="data-row"><span class="data-label">Room:</span> <span class="data-value">%s</span></div>
          <div class="data-row"><span class="data-label">Amount:</span> <span class="data-value" style="color: #0f6b46;">GHS %.2f</span></div>
          <div class="data-row"><span class="data-label">Deadline:</span> <span class="data-value" style="color: #b91c1c;">%s</span></div>
        </div>
        
        <p>Please complete your payment before the deadline to secure your allocation. Log in to the student portal to upload your payment receipt.</p>
        """.formatted(name, hostel, room, amount, FMT.format(paymentDue));

    send(email, "Room Booking Submitted – " + hostel + " Room " + room, String.format(HTML_WRAPPER, content));
  }

  @Async("taskExecutor")
  public void sendPaymentApproval(String email, String name, String hostel, String room) {
    log.info("[NOTIFICATION] Queuing payment-approval → {}", email);
    
    String content = """
        <h2>Room Confirmed! 🎉</h2>
        <p>Dear <strong>%s</strong>,</p>
        <p>Great news! Your payment has been verified by our administrative team and your room allocation is now fully confirmed.</p>
        
        <div class="data-box">
          <div class="data-row"><span class="data-label">Hostel:</span> <span class="data-value">%s</span></div>
          <div class="data-row"><span class="data-label">Room:</span> <span class="data-value">%s</span></div>
          <div class="data-row"><span class="data-label">Status:</span> <span class="data-value" style="color: #059669;">Approved & Secured</span></div>
        </div>
        
        <p>Please visit the main hostel office to collect your room key upon arrival. Welcome to your new home!</p>
        """.formatted(name, hostel, room);

    send(email, "Payment Approved – Room " + room + " Confirmed!", String.format(HTML_WRAPPER, content));
  }

  @Async("taskExecutor")
  public void sendPaymentReminder(String email, String name, String hostel, String room, Instant expiresAt) {
    log.info("[NOTIFICATION] Queuing payment-reminder → {}", email);
    
    String content = """
        <h2 style="color: #b91c1c;">Action Required: Payment Reminder</h2>
        <p>Dear <strong>%s</strong>,</p>
        <p>This is an automated reminder that your room booking for <strong>%s (Room %s)</strong> is pending payment and will expire soon.</p>
        
        <div class="data-box" style="border-left: 4px solid #b91c1c;">
          <div class="data-row"><span class="data-label" style="width: 120px;">Expires At:</span> <span class="data-value" style="color: #b91c1c;">%s</span></div>
        </div>
        
        <p>Please complete your payment immediately to secure your allocation. Log in to the student portal to upload your payment receipt.</p>
        <p><em>If you have already made your payment and submitted your receipt, please ignore this reminder.</em></p>
        """.formatted(name, hostel, room, FMT.format(expiresAt));

    send(email, "Action Required – Complete Your Booking for " + hostel, String.format(HTML_WRAPPER, content));
  }

  @Async("taskExecutor")
  public void sendPasswordReset(String email, String name, String resetUrl, Instant expiresAt) {
    log.info("[NOTIFICATION] Queuing password-reset → {}", email);
    
    String content = """
        <h2>Password Reset Request</h2>
        <p>Dear <strong>%s</strong>,</p>
        <p>We received a request to reset the password associated with your account. You can set a new password by clicking the secure button below:</p>
        
        <div class="btn-container">
          <a href="%s" class="btn">Reset My Password</a>
        </div>
        
        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
          <strong>Security Notice:</strong> This link will expire on <strong>%s</strong>. If you did not request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
        """.formatted(name, resetUrl, FMT.format(expiresAt));

    send(email, "Reset Your UniHostel Password", String.format(HTML_WRAPPER, content));
  }

  // ─── WebSocket/Real-time Notifications ──────────────────────────────────

  public void notifyPaymentApprovedViaWebSocket(Long studentId, Long bookingId, Long paymentId) {
    messagingTemplate.ifPresentOrElse(
        template -> {
          NotificationMessage message =
              NotificationMessage.paymentApproved(studentId, bookingId, paymentId);
          template.convertAndSendToUser(
              studentId.toString(), "/queue/notifications", message);
          template.convertAndSend(
              "/topic/students/" + studentId + "/notifications", message);
          log.info("[NOTIFICATION-WS] Sent payment-approval to student {} (booking: {}, payment: {})",
              studentId, bookingId, paymentId);
        },
        () -> log.debug("[NOTIFICATION-WS] WebSocket disabled, skipping real-time notification for student {}", studentId));
  }

  public void notifyBookingApprovedViaWebSocket(Long studentId, Long bookingId) {
    messagingTemplate.ifPresentOrElse(
        template -> {
          NotificationMessage message = NotificationMessage.bookingApproved(studentId, bookingId);
          template.convertAndSendToUser(
              studentId.toString(), "/queue/notifications", message);
          template.convertAndSend(
              "/topic/students/" + studentId + "/notifications", message);
          log.info("[NOTIFICATION-WS] Sent booking-approval to student {} (booking: {})", studentId, bookingId);
        },
        () -> log.debug("[NOTIFICATION-WS] WebSocket disabled, skipping real-time notification for student {}", studentId));
  }

  public void notifyBookingRejectedViaWebSocket(Long studentId, Long bookingId, String reason) {
    messagingTemplate.ifPresentOrElse(
        template -> {
          NotificationMessage message =
              NotificationMessage.bookingRejected(studentId, bookingId, reason);
          template.convertAndSendToUser(
              studentId.toString(), "/queue/notifications", message);
          template.convertAndSend(
              "/topic/students/" + studentId + "/notifications", message);
          log.info("[NOTIFICATION-WS] Sent booking-rejection to student {} (booking: {})", studentId, bookingId);
        },
        () -> log.debug("[NOTIFICATION-WS] WebSocket disabled, skipping real-time notification for student {}", studentId));
  }

  // ─── private helpers ────────────────────────────────────────────────────

  private void send(String to, String subject, String htmlBody) {
    mailSender.ifPresentOrElse(
        sender -> {
          try {
            // Use MimeMessage to support HTML emails instead of SimpleMailMessage
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true indicates this is HTML
            
            sender.send(message);
            log.info("[NOTIFICATION] Sent HTML Email '{}' → {}", subject, to);
          } catch (MessagingException | MailException e) {
            log.warn("[NOTIFICATION] Failed to send HTML Email '{}' → {}: {}", subject, to, e.getMessage());
          }
        },
        () -> log.info("[NOTIFICATION] (no SMTP) '{}' → {}\n[HTML Body Suppressed for Log Clarity]", subject, to));
  }
}