package com.hostelmanagement.service;

import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.StudentRepository;
import com.hostelmanagement.web.dto.UpdateUserProfileRequest;
import com.hostelmanagement.web.dto.UserProfileResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

  private final StudentRepository studentRepository;

  public UserProfileService(StudentRepository studentRepository) {
    this.studentRepository = studentRepository;
  }

  @Transactional(readOnly = true)
  public UserProfileResponse get(Long userId) {
    Student student =
        studentRepository
            .findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

    return toResponse(student);
  }

  @Transactional
  public UserProfileResponse update(Long userId, UpdateUserProfileRequest request) {
    Student student =
        studentRepository
            .findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

    student.setFullName(request.fullName());
    student.setPhone(request.phone());
    student.setProfileImagePath(request.profileImagePath());

    Student saved = studentRepository.save(student);
    return toResponse(saved);
  }

  private UserProfileResponse toResponse(Student student) {
    return new UserProfileResponse(
        student.getId(),
        student.getFullName(),
        student.getEmail(),
        student.getPhone(),
        student.getGender(),
        student.getProfileImagePath(),
        student.getRole().name());
  }
}
