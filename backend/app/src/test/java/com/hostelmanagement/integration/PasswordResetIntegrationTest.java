package com.hostelmanagement.integration;

import com.hostelmanagement.domain.Gender;
import com.hostelmanagement.domain.Role;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.StudentRepository;
import com.hostelmanagement.scheduler.PasswordResetTokenCleanupScheduler;
import com.hostelmanagement.service.AuthService;
import com.hostelmanagement.service.NotificationService;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class PasswordResetIntegrationTest {

  @Autowired
  private AuthService authService;

  @Autowired
  private StudentRepository studentRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Autowired
  private PasswordResetTokenCleanupScheduler cleanupScheduler;

  @MockBean
  @SuppressWarnings("unused")
  private NotificationService notificationService;

  @Test
  void forgotAndResetPassword_shouldPersistToken_andThenUpdatePassword() {
    String email = "student+" + UUID.randomUUID() + "@test.com";
    createStudent(email, "OldPassword123");

    authService.forgotPassword(email);

    Student afterForgot = studentRepository.findByEmail(email).orElseThrow();
    assertThat(afterForgot.getResetToken()).isNotBlank();
    assertThat(afterForgot.getResetTokenExpiry()).isAfter(Instant.now());

    String issuedToken = afterForgot.getResetToken();
    authService.resetPassword(issuedToken, "NewPassword123");

    Student afterReset = studentRepository.findByEmail(email).orElseThrow();
    assertThat(afterReset.getResetToken()).isNull();
    assertThat(afterReset.getResetTokenExpiry()).isNull();
    assertThat(passwordEncoder.matches("NewPassword123", afterReset.getPassword())).isTrue();
  }

  @Test
  void cleanupScheduler_shouldClearOnlyExpiredTokens() {
    Student expired = createStudent("expired+" + UUID.randomUUID() + "@test.com", "Password123");
    expired.setResetToken("expired-token");
    expired.setResetTokenExpiry(Instant.now().minusSeconds(600));
    studentRepository.save(expired);

    Student active = createStudent("active+" + UUID.randomUUID() + "@test.com", "Password123");
    active.setResetToken("active-token");
    active.setResetTokenExpiry(Instant.now().plusSeconds(600));
    studentRepository.save(active);

    cleanupScheduler.cleanupExpiredResetTokens();

    Student expiredAfter = studentRepository.findByEmail(expired.getEmail()).orElseThrow();
    Student activeAfter = studentRepository.findByEmail(active.getEmail()).orElseThrow();

    assertThat(expiredAfter.getResetToken()).isNull();
    assertThat(expiredAfter.getResetTokenExpiry()).isNull();

    assertThat(activeAfter.getResetToken()).isEqualTo("active-token");
    assertThat(activeAfter.getResetTokenExpiry()).isAfter(Instant.now());
  }

  private Student createStudent(String email, String rawPassword) {
    Student s = new Student();
    s.setFullName("Integration Test User");
    s.setEmail(email);
    s.setPhone("0000000000");
    s.setGender(Gender.MALE);
    s.setPassword(passwordEncoder.encode(rawPassword));
    s.setRole(Role.STUDENT);
    return studentRepository.save(s);
  }
}
