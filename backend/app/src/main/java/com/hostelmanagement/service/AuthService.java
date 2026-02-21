package com.hostelmanagement.service;

import com.hostelmanagement.domain.Role;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.StudentRepository;
import com.hostelmanagement.security.JwtService;
import com.hostelmanagement.web.dto.AuthResponse;
import com.hostelmanagement.web.dto.LoginRequest;
import com.hostelmanagement.web.dto.RegisterRequest;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private final StudentRepository studentRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(
      StudentRepository studentRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.studentRepository = studentRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
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
    s.setPassword(passwordEncoder.encode(request.password()));
    s.setRole(Role.STUDENT);

    Student saved = studentRepository.save(s);
    String token = jwtService.generateToken(saved.getId(), saved.getEmail(), saved.getRole());
    return new AuthResponse(token, saved.getRole().name());
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

    String token = jwtService.generateToken(s.getId(), s.getEmail(), s.getRole());
    return new AuthResponse(token, s.getRole().name());
  }
}
