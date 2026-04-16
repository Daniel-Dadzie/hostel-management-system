package com.hostelmanagement.web.admin;

import com.hostelmanagement.service.AnnouncementService;
import com.hostelmanagement.web.admin.dto.UpsertAnnouncementRequest;
import com.hostelmanagement.web.dto.AnnouncementResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/announcements")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnnouncementController {

  private final AnnouncementService announcementService;

  public AdminAnnouncementController(AnnouncementService announcementService) {
    this.announcementService = announcementService;
  }

  /**
   * Get all announcements (including inactive) for admin dashboard.
   */
  @GetMapping
  public ResponseEntity<List<AnnouncementResponse>> list() {
    return ResponseEntity.ok(announcementService.listAll());
  }

  /**
   * Create a new announcement.
   */
  @PostMapping
  public ResponseEntity<AnnouncementResponse> create(@Valid @RequestBody UpsertAnnouncementRequest request) {
    return ResponseEntity.ok(announcementService.create(request));
  }

  /**
   * Delete an announcement by ID.
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    announcementService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
