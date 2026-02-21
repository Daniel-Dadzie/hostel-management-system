package com.hostelmanagement.service;

import com.hostelmanagement.domain.Gender;
import com.hostelmanagement.domain.Role;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.StudentRepository;
import com.hostelmanagement.security.JwtService;
import com.hostelmanagement.web.dto.AuthResponse;
import com.hostelmanagement.web.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private StudentRepository studentRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private JwtService jwtService;
    
    @InjectMocks
    private AuthService authService;

    @Test
    void register_shouldThrowException_whenEmailExists() {
        // Given
        RegisterRequest request = new RegisterRequest("John", "john@test.com", "123", Gender.MALE, "pass");
        when(studentRepository.findByEmail("john@test.com")).thenReturn(Optional.of(new Student()));
        
        // When/Then
        assertThatThrownBy(() -> authService.register(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Email already registered");
    }

    @Test
    void register_shouldCreateStudent_whenEmailNotExists() {
        // Given
        RegisterRequest request = new RegisterRequest("John", "john@test.com", "123", Gender.MALE, "pass");
        when(studentRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pass")).thenReturn("encodedPass");
        when(studentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateToken(any(), any(), any())).thenReturn("token");
        
        // When
        AuthResponse response = authService.register(request);
        
        // Then
        assertThat(response.token()).isEqualTo("token");
        assertThat(response.role()).isEqualTo("STUDENT");
    }
}
