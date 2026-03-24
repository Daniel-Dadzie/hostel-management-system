package com.hostelmanagement.service;

import com.hostelmanagement.domain.Role;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.StudentRepository;
import com.hostelmanagement.security.PasswordResetRateLimiter;
import com.hostelmanagement.security.JwtService;
import com.hostelmanagement.web.dto.AuthResponse;
import com.hostelmanagement.web.dto.LoginRequest;
import com.hostelmanagement.web.dto.RefreshTokenRequest;
import com.hostelmanagement.web.dto.RegisterRequest;
import java.security.SecureRandom;
import java.time.Instant;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private final StudentRepository studentRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final NotificationService notificationService;
  private final PasswordResetRateLimiter passwordResetRateLimiter;
  private final String frontendUrl;
  private final long resetRateLimitSeconds;

  private static final SecureRandom SECURE_RANDOM = new SecureRandom();

  public AuthService(
      StudentRepository studentRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      NotificationService notificationService,
      PasswordResetRateLimiter passwordResetRateLimiter,
      @Value("${app.frontend-url}") String frontendUrl,
      @Value("${app.auth.reset-rate-limit-seconds:60}") long resetRateLimitSeconds) {
    this.studentRepository = studentRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.notificationService = notificationService;
    this.passwordResetRateLimiter = passwordResetRateLimiter;
    this.frontendUrl = frontendUrl;
    this.resetRateLimitSeconds = resetRateLimitSeconds;
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    String email = request.email().trim().toLowerCase(Locale.ROOT);
    if (studentRepository.findByEmail(email).isPresent()) {
      throw new IllegalArgumentException("Email already registered");
    }

    Student s = new Student();
    s.setFullName(request.fullName());
    s.setEmail(email);
    s.setPhone(request.phone());
    s.setGender(request.gender());
    s.setProfileImagePath(request.profileImagePath());
    s.setPassword(passwordEncoder.encode(request.password()));
    s.setRole(Role.STUDENT);

    Student saved = studentRepository.save(s);
    String accessToken = jwtService.generateAccessToken(saved.getId(), saved.getEmail(), saved.getRole());
    String refreshToken = jwtService.generateRefreshToken(saved.getId());
    return new AuthResponse(accessToken, refreshToken, saved.getRole().name());
  }

  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest request) {
    String email = request.email().trim().toLowerCase(Locale.ROOT);
    Student s =
        studentRepository
            .findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

    if (!passwordEncoder.matches(request.password(), s.getPassword())) {
      throw new IllegalArgumentException("Invalid email or password");
    }

    String accessToken = jwtService.generateAccessToken(s.getId(), s.getEmail(), s.getRole());
    String refreshToken = jwtService.generateRefreshToken(s.getId());
    return new AuthResponse(accessToken, refreshToken, s.getRole().name());
  }

  @Transactional
  public void forgotPassword(String email) {
    String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

    // Redis-backed when available; falls back to in-memory per-instance limiter.
    if (!passwordResetRateLimiter.tryAcquire(normalizedEmail, resetRateLimitSeconds)) {
      throw new IllegalArgumentException("Please wait before requesting another password reset");
    }

    studentRepository.findByEmail(normalizedEmail).ifPresent(student -> {
      // Generate cryptographically secure token
      byte[] tokenBytes = new byte[32];
      SECURE_RANDOM.nextBytes(tokenBytes);
      String resetToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
      Instant expiry = Instant.now().plusSeconds(3600);

      student.setResetToken(resetToken);
      student.setResetTokenExpiry(expiry);
      studentRepository.save(student);

      String baseUrl = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
      String resetUrl =
          baseUrl
              + "/reset-password?token="
              + URLEncoder.encode(resetToken, StandardCharsets.UTF_8);
      notificationService.sendPasswordReset(student.getEmail(), student.getFullName(), resetUrl, expiry);
    });
  }

  @Transactional
  public void resetPassword(String token, String newPassword) {
    // Validate password strength
    if (newPassword == null || newPassword.length() < 8) {
      throw new IllegalArgumentException("Password must be at least 8 characters long");
    }
    
    Student student = studentRepository.findByResetToken(token)
        .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));
    
    // Check if token is expired
    if (student.getResetTokenExpiry() == null || student.getResetTokenExpiry().isBefore(Instant.now())) {
      throw new IllegalArgumentException("Reset token has expired");
    }
    
    // Update password
    student.setPassword(passwordEncoder.encode(newPassword));
    // Clear reset token
    student.setResetToken(null);
    student.setResetTokenExpiry(null);
    studentRepository.save(student);
  }

  @Transactional
  public int clearExpiredResetTokens() {
    return studentRepository.clearExpiredResetTokens(Instant.now());
  }

  /**
   * Refresh access token using a valid refresh token.
   * Generates new access and refresh tokens for the user.
   */
  @Transactional(readOnly = true)
  public AuthResponse refreshToken(String refreshToken) {
    JwtService.RefreshTokenData tokenData = jwtService.parseRefreshToken(refreshToken);
    
    Student student = studentRepository.findById(tokenData.userId())
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
    
    String newAccessToken = jwtService.generateAccessToken(
        student.getId(), student.getEmail(), student.getRole());
    String newRefreshToken = jwtService.generateRefreshToken(student.getId());
    
    return new AuthResponse(newAccessToken, newRefreshToken, student.getRole().name());
  }
}
