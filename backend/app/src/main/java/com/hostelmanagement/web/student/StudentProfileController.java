package com.hostelmanagement.web.student;

import com.hostelmanagement.security.JwtUser;
import com.hostelmanagement.service.StudentProfileService;
import com.hostelmanagement.web.student.dto.StudentProfileResponse;
import com.hostelmanagement.web.student.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/profile")
@PreAuthorize("hasRole('STUDENT')")
public class StudentProfileController {

  private final StudentProfileService profileService;

  public StudentProfileController(StudentProfileService profileService) {
    this.profileService = profileService;
  }

  @GetMapping
  public ResponseEntity<StudentProfileResponse> me(@AuthenticationPrincipal JwtUser user) {
    return ResponseEntity.ok(profileService.get(user.userId()));
  }

  @PutMapping
  public ResponseEntity<StudentProfileResponse> update(
      @AuthenticationPrincipal JwtUser user, @Valid @RequestBody UpdateProfileRequest request) {
    return ResponseEntity.ok(profileService.update(user.userId(), request));
  }
}
