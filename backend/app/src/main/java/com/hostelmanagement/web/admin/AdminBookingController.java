package com.hostelmanagement.web.admin;

import com.hostelmanagement.domain.BookingStatus;
import com.hostelmanagement.service.AdminBookingService;
import com.hostelmanagement.web.admin.dto.AdminBookingResponse;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

  private final AdminBookingService adminBookingService;

  public AdminBookingController(AdminBookingService adminBookingService) {
    this.adminBookingService = adminBookingService;
  }

  @GetMapping
  public ResponseEntity<List<AdminBookingResponse>> list(
      @RequestParam(required = false) BookingStatus status) {
    return ResponseEntity.ok(adminBookingService.list(status));
  }

  public record UpdateStatusRequest(@NotNull BookingStatus status) {}

  @PatchMapping("/{id}/status")
  public ResponseEntity<AdminBookingResponse> updateStatus(
      @PathVariable Long id, @RequestBody UpdateStatusRequest request) {
    return ResponseEntity.ok(adminBookingService.updateStatus(id, request.status()));
  }
}
