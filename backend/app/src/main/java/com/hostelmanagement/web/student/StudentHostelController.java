package com.hostelmanagement.web.student;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hostelmanagement.security.JwtUser;
import com.hostelmanagement.service.StudentHostelService;
import com.hostelmanagement.web.dto.HostelResponse;
import com.hostelmanagement.web.dto.RoomResponse;

@RestController
@RequestMapping("/api/student/hostels")
@PreAuthorize("hasRole('STUDENT')")
public class StudentHostelController {

  private final StudentHostelService studentHostelService;

  public StudentHostelController(StudentHostelService studentHostelService) {
    this.studentHostelService = studentHostelService;
  }

  @GetMapping
  public ResponseEntity<List<HostelResponse>> listHostels() {
    return ResponseEntity.ok(studentHostelService.listActiveHostels());
  }

  @GetMapping("/{hostelId}/rooms")
  public ResponseEntity<List<RoomResponse>> listRooms(
      @AuthenticationPrincipal JwtUser user, @PathVariable Long hostelId) {
    return ResponseEntity.ok(studentHostelService.listAvailableRooms(user.userId(), hostelId));
  }
}
