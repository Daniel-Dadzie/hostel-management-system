package com.hostelmanagement.web.dto;

import com.hostelmanagement.domain.Announcement;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * DTO for displaying announcements to students/frontend.
 */
public record AnnouncementResponse(
    Long id,
    String title,
    String body,
    String publishedAt,
    String expiresAt,
    String preview) {

  /**
   * Create from Announcement entity.
   * Generates a preview from the first 150 characters of body.
   */
  public static AnnouncementResponse from(Announcement announcement) {
    String body = announcement.getBody();
    String preview = body.length() > 150 ? body.substring(0, 150) + "..." : body;

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMM yyyy")
        .withZone(ZoneId.systemDefault());

    return new AnnouncementResponse(
        announcement.getId(),
        announcement.getTitle(),
        body,
        announcement.getPublishedAt() != null
            ? formatter.format(announcement.getPublishedAt())
            : null,
        announcement.getExpiresAt() != null
            ? formatter.format(announcement.getExpiresAt())
            : null,
        preview
    );
  }
}
