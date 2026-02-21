package com.hostelmanagement.web.student;

import com.hostelmanagement.security.JwtUser;
import com.hostelmanagement.service.BookingService;
import com.hostelmanagement.web.dto.ApplyRequest;
import com.hostelmanagement.web.dto.BookingResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentBookingController {

  private final BookingService bookingService;

  public StudentBookingController(BookingService bookingService) {
    this.bookingService = bookingService;
  }

  @PostMapping("/apply")
  public ResponseEntity<BookingResponse> apply(
      @AuthenticationPrincipal JwtUser user, @Valid @RequestBody ApplyRequest request) {
    return ResponseEntity.ok(bookingService.apply(user.userId(), request));
  }

  @GetMapping("/booking")
  public ResponseEntity<BookingResponse> myBooking(@AuthenticationPrincipal JwtUser user) {
    return ResponseEntity.ok(bookingService.getLatestForStudent(user.userId()));
  }
}
