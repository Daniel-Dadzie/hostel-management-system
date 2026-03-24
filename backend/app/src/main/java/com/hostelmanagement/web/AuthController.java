package com.hostelmanagement.web;

import com.hostelmanagement.service.AuthService;
import com.hostelmanagement.web.dto.AuthResponse;
import com.hostelmanagement.web.dto.ForgotPasswordRequest;
import com.hostelmanagement.web.dto.LoginRequest;
import com.hostelmanagement.web.dto.RefreshTokenRequest;
import com.hostelmanagement.web.dto.RegisterRequest;
import com.hostelmanagement.web.dto.ResetPasswordRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(authService.register(request));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    authService.forgotPassword(request.email());
    // Always return success to prevent email enumeration
    return ResponseEntity.ok("If an account exists with this email, a password reset link has been sent");
  }

  @PostMapping("/reset-password")
  public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request.token(), request.newPassword());
    return ResponseEntity.ok("Password has been reset successfully");
  }

  @PostMapping("/refresh")
  public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
    return ResponseEntity.ok(authService.refreshToken(request.refreshToken()));
  }
}
