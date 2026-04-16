package com.hostelmanagement.web;

import com.hostelmanagement.service.AnnouncementService;
import com.hostelmanagement.web.dto.AnnouncementResponse;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Student-facing endpoint for fetching announcements.
 * Only returns active, non-expired announcements.
 */
@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

  private final AnnouncementService announcementService;

  public AnnouncementController(AnnouncementService announcementService) {
    this.announcementService = announcementService;
  }

  /**
   * Get all active announcements visible to students.
   * Automatically excludes expired announcements.
   */
  @GetMapping
  public ResponseEntity<List<AnnouncementResponse>> listActive() {
    return ResponseEntity.ok(announcementService.listActive());
  }
}
