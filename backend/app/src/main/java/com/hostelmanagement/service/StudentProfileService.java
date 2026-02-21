package com.hostelmanagement.service;

import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.StudentRepository;
import com.hostelmanagement.web.student.dto.StudentProfileResponse;
import com.hostelmanagement.web.student.dto.UpdateProfileRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentProfileService {

  private final StudentRepository studentRepository;

  public StudentProfileService(StudentRepository studentRepository) {
    this.studentRepository = studentRepository;
  }

  @Transactional(readOnly = true)
  public StudentProfileResponse get(Long studentId) {
    Student s = studentRepository.findById(studentId).orElseThrow(() -> new IllegalArgumentException("Student not found"));
    return new StudentProfileResponse(s.getId(), s.getFullName(), s.getEmail(), s.getPhone(), s.getGender());
  }

  @Transactional
  public StudentProfileResponse update(Long studentId, UpdateProfileRequest request) {
    Student s = studentRepository.findById(studentId).orElseThrow(() -> new IllegalArgumentException("Student not found"));
    s.setFullName(request.fullName());
    s.setPhone(request.phone());
    Student saved = studentRepository.save(s);
    return new StudentProfileResponse(saved.getId(), saved.getFullName(), saved.getEmail(), saved.getPhone(), saved.getGender());
  }
}
