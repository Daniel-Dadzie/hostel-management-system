package com.hostelmanagement.service;

import com.hostelmanagement.domain.Gender;
import com.hostelmanagement.domain.Role;
import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.StudentRepository;
import com.hostelmanagement.web.dto.StudentDTO;
import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminStudentService {

    private final StudentRepository studentRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminStudentService(StudentRepository studentRepo, PasswordEncoder passwordEncoder) {
        this.studentRepo = studentRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Student> findAll() {
        return studentRepo.findAll();
    }

    @Transactional
    public Student save(StudentDTO studentDTO) {
        String email = normalizeEmail(studentDTO.getEmail());
        if (studentRepo.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        Student student = new Student();
        student.setFullName(normalizeName(studentDTO.getFullName()));
        student.setEmail(email);
        student.setGender(Gender.FEMALE);
        student.setRole(Role.STUDENT);
        student.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

        return studentRepo.save(student);
    }

    public void delete(Long id) {
        studentRepo.deleteById(id);
    }

    @Transactional
    public Student update(Long id, StudentDTO studentDTO) {
        Student student = studentRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        String email = normalizeEmail(studentDTO.getEmail());

        if (!student.getEmail().equalsIgnoreCase(email) && studentRepo.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        student.setFullName(normalizeName(studentDTO.getFullName()));
        student.setEmail(email);

        return studentRepo.save(student);
    }

    private String normalizeName(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required");
        }
        return value.trim();
    }

    private String normalizeEmail(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        return value.trim().toLowerCase();
    }
}