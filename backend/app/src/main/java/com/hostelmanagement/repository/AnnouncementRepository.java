package com.hostelmanagement.repository;

import com.hostelmanagement.domain.Announcement;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
  /**
   * Find all active announcements ordered by most recent first.
   * Excludes expired announcements.
   */
  @Query("SELECT a FROM Announcement a WHERE a.active = true AND (a.expiresAt IS NULL OR a.expiresAt > CURRENT_TIMESTAMP) ORDER BY a.publishedAt DESC")
  List<Announcement> findAllActive();

  /**
   * Find announcements by active status.
   */
  List<Announcement> findByActiveOrderByPublishedAtDesc(boolean active);
}
