package com.hostelmanagement.service;

import com.hostelmanagement.domain.Announcement;
import com.hostelmanagement.repository.AnnouncementRepository;
import com.hostelmanagement.web.admin.dto.UpsertAnnouncementRequest;
import com.hostelmanagement.web.dto.AnnouncementResponse;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing announcements.
 * Handles creation, retrieval, and deletion of announcements visible to students.
 */
@Service
@Transactional
public class AnnouncementService {

  private final AnnouncementRepository announcementRepository;

  public AnnouncementService(AnnouncementRepository announcementRepository) {
    this.announcementRepository = announcementRepository;
  }

  /**
   * Get all active announcements visible to students.
   */
  @Transactional(readOnly = true)
  public List<AnnouncementResponse> listActive() {
    return announcementRepository.findAllActive().stream()
        .map(AnnouncementResponse::from)
        .toList();
  }

  /**
   * Create a new announcement.
   *
   * @param request Announcement details
   * @return Created announcement
   */
  public AnnouncementResponse create(UpsertAnnouncementRequest request) {
    Instant expiresAt = null;
    if (request.expiresAt() != null && !request.expiresAt().isBlank()) {
      try {
        LocalDate expiryDate = LocalDate.parse(request.expiresAt());
        expiresAt = expiryDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
      } catch (Exception e) {
        // Invalid date format - treat as no expiry
      }
    }

    Announcement announcement = new Announcement(request.title(), request.body(), expiresAt);
    Announcement saved = announcementRepository.save(announcement);
    return AnnouncementResponse.from(saved);
  }

  /**
   * Delete an announcement by ID.
   *
   * @param id Announcement ID
   */
  public void delete(Long id) {
    announcementRepository.deleteById(id);
  }

  /**
   * Get all announcements (including inactive) for admin view.
   */
  @Transactional(readOnly = true)
  public List<AnnouncementResponse> listAll() {
    return announcementRepository.findAll().stream()
        .sorted((a, b) -> b.getPublishedAt().compareTo(a.getPublishedAt()))
        .map(AnnouncementResponse::from)
        .toList();
  }
}
