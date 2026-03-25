package com.hostelmanagement.service;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.hostelmanagement.domain.Gender;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.StudentRepository;
import com.hostelmanagement.security.JwtService;
import com.hostelmanagement.security.PasswordResetRateLimiter;
import com.hostelmanagement.security.SecurityAuditLogger;
import com.hostelmanagement.web.dto.AuthResponse;
import com.hostelmanagement.web.dto.RegisterRequest;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private StudentRepository studentRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private JwtService jwtService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private PasswordResetRateLimiter passwordResetRateLimiter;

    @Mock
    private SecurityAuditLogger securityAuditLogger;
    
    private AuthService authService;

    @SuppressWarnings({"java:S1144", "unused"}) // Invoked by JUnit lifecycle.
    @BeforeEach
    void setUp() {
        authService = new AuthService(
            studentRepository,
            passwordEncoder,
            jwtService,
            notificationService,
            passwordResetRateLimiter,
            securityAuditLogger,
            "http://localhost:5173",
            60L
        );
    }

    @Test
    void register_shouldThrowException_whenEmailExists() {
        // Given
        RegisterRequest request = new RegisterRequest("John", "john@test.com", "123", Gender.MALE, null, "pass");
        when(studentRepository.findByEmail("john@test.com")).thenReturn(Optional.of(new Student()));
        
        // When/Then
        assertThatThrownBy(() -> authService.register(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Email already registered");
    }

    @Test
    void register_shouldCreateStudent_whenEmailNotExists() {
        // Given
        RegisterRequest request = new RegisterRequest("John", "john@test.com", "123", Gender.MALE, null, "pass");
        when(studentRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pass")).thenReturn("encodedPass");
        when(studentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateAccessToken(any(), any(), any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");
        
        // When
        AuthResponse response = authService.register(request);
        
        // Then
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
        assertThat(response.role()).isEqualTo("STUDENT");
    }

    @Test
    void forgotPassword_shouldDoNothing_whenEmailDoesNotExist() {
        when(passwordResetRateLimiter.tryAcquire(any(), anyLong())).thenReturn(true);
        when(studentRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        authService.forgotPassword("missing@test.com");

        verify(studentRepository, never()).save(any());
        verify(notificationService, never()).sendPasswordReset(any(), any(), any(), any(Instant.class));
    }

    @Test
    void forgotPassword_shouldStoreTokenAndSendEmail_whenEmailExists() {
        when(passwordResetRateLimiter.tryAcquire(any(), anyLong())).thenReturn(true);
        Student student = new Student();
        student.setEmail("john@test.com");
        student.setFullName("John Doe");
        when(studentRepository.findByEmail("john@test.com")).thenReturn(Optional.of(student));

        authService.forgotPassword("john@test.com");

        assertThat(student.getResetToken()).isNotBlank();
        assertThat(student.getResetTokenExpiry()).isNotNull();
        verify(studentRepository).save(student);
        verify(notificationService).sendPasswordReset(
            eq("john@test.com"),
            eq("John Doe"),
            contains("/reset-password?token="),
            any(Instant.class)
        );
    }
}
