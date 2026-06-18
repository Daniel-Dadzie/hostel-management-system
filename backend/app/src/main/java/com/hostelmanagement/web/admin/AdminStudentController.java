package com.hostelmanagement.web.admin;

import com.hostelmanagement.domain.Student;
import com.hostelmanagement.service.AdminStudentService;
import com.hostelmanagement.web.dto.StudentDTO;
import com.hostelmanagement.web.dto.UserProfileResponse;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/students")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentController {

    private final AdminStudentService adminStudentService;

    public AdminStudentController(AdminStudentService adminStudentService) {
        this.adminStudentService = adminStudentService;
    }

    @GetMapping
    public ResponseEntity<List<UserProfileResponse>> getAllStudents() {
        return ResponseEntity.ok(adminStudentService.findAll().stream()
            .map(this::toResponse)
            .toList());
    }

    @PostMapping
    public ResponseEntity<UserProfileResponse> createStudent(@RequestBody StudentDTO studentDTO) {
        return ResponseEntity.ok(toResponse(adminStudentService.save(studentDTO)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfileResponse> updateStudent(@PathVariable Long id, @RequestBody StudentDTO studentDTO) {
        return ResponseEntity.ok(toResponse(adminStudentService.update(id, studentDTO)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        adminStudentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private UserProfileResponse toResponse(Student student) {
        return new UserProfileResponse(
            student.getId(),
            student.getFullName(),
            student.getEmail(),
            student.getPhone(),
            student.getGender(),
            student.getProfileImagePath(),
            student.getRole().name()
        );
    }
}