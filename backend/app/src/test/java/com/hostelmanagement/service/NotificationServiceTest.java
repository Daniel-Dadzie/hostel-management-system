package com.hostelmanagement.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.math.BigDecimal;
import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

  @Mock
  private JavaMailSender mailSender;

  // ─── sendBookingConfirmation ──────────────────────────────────────────────

  @Test
  void sendBookingConfirmation_withMailSender_shouldSendEmailWithBookingDetails() {
    NotificationService service = new NotificationService(mailSender);

    service.sendBookingConfirmation(
        "student@test.com",
        "John Doe",
        "Legon Hall",
        "A101",
        new BigDecimal("500.00"),
        Instant.parse("2025-09-30T12:00:00Z"));

    ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());
    SimpleMailMessage sent = captor.getValue();

    assertThat(sent.getTo()).containsExactly("student@test.com");
    assertThat(sent.getSubject()).contains("Legon Hall").contains("A101");
    assertThat(sent.getText()).contains("John Doe");
    assertThat(sent.getText()).contains("500.00");
    assertThat(sent.getText()).contains("A101");
  }

  @Test
  void sendBookingConfirmation_withoutMailSender_shouldNotThrow() {
    NotificationService service = new NotificationService(null);

    service.sendBookingConfirmation(
        "student@test.com",
        "Jane Doe",
        "Pentagon Hall",
        "B202",
        new BigDecimal("450.00"),
        Instant.now().plusSeconds(3600));

    verify(mailSender, never()).send(any(SimpleMailMessage.class));
  }

  // ─── sendPaymentApproval ──────────────────────────────────────────────────

  @Test
  void sendPaymentApproval_withMailSender_shouldSendConfirmationEmail() {
    NotificationService service = new NotificationService(mailSender);

    service.sendPaymentApproval("student@test.com", "Alice", "Legon Hall", "C303");

    ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());
    SimpleMailMessage sent = captor.getValue();

    assertThat(sent.getTo()).containsExactly("student@test.com");
    assertThat(sent.getSubject()).contains("C303").contains("Confirmed");
    assertThat(sent.getText()).contains("Alice");
    assertThat(sent.getText()).contains("Legon Hall");
  }

  // ─── sendPaymentReminder ─────────────────────────────────────────────────

  @Test
  void sendPaymentReminder_withMailSender_shouldSendReminderEmail() {
    NotificationService service = new NotificationService(mailSender);
    Instant expiresAt = Instant.parse("2025-10-01T09:00:00Z");

    service.sendPaymentReminder("student@test.com", "Bob", "Akosombo Hall", "D404", expiresAt);

    ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());
    SimpleMailMessage sent = captor.getValue();

    assertThat(sent.getTo()).containsExactly("student@test.com");
    assertThat(sent.getSubject()).contains("Akosombo Hall");
    assertThat(sent.getText()).contains("Bob");
    assertThat(sent.getText()).contains("D404");
  }

  // ─── sendPasswordReset ───────────────────────────────────────────────────

  @Test
  void sendPasswordReset_withMailSender_shouldSendResetLinkEmail() {
    NotificationService service = new NotificationService(mailSender);
    String resetUrl = "http://localhost:5173/reset-password?token=abc123";
    Instant expiresAt = Instant.now().plusSeconds(3600);

    service.sendPasswordReset("student@test.com", "Carol", resetUrl, expiresAt);

    ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mailSender).send(captor.capture());
    SimpleMailMessage sent = captor.getValue();

    assertThat(sent.getTo()).containsExactly("student@test.com");
    assertThat(sent.getSubject()).containsIgnoringCase("password reset");
    assertThat(sent.getText()).contains("Carol");
    assertThat(sent.getText()).contains(resetUrl);
  }

  @Test
  void sendPasswordReset_withoutMailSender_shouldNotThrow() {
    NotificationService service = new NotificationService(null);

    service.sendPasswordReset(
        "student@test.com",
        "Dave",
        "http://localhost:5173/reset-password?token=xyz",
        Instant.now().plusSeconds(3600));

    verify(mailSender, never()).send(any(SimpleMailMessage.class));
  }
}
