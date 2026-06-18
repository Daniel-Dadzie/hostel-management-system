package com.hostelmanagement.service;

import com.hostelmanagement.domain.Student;
import com.hostelmanagement.repository.StudentRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminStudentService {

    private final StudentRepository studentRepo;

    public AdminStudentService(StudentRepository studentRepo) {
        this.studentRepo = studentRepo;
    }

    public List<Student> findAll() {
        return studentRepo.findAll();
    }

    public Student save(Student student) {
        return studentRepo.save(student);
    }

    public void delete(Long id) {
        studentRepo.deleteById(id);
    }

    public Student update(Long id, Student studentDetails) {
        Student student = studentRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        
        student.setFullName(studentDetails.getFullName());
        student.setEmail(studentDetails.getEmail());
        
        return studentRepo.save(student);
    }
}