package com.hostelmanagement.service;

import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hostelmanagement.repository.StudentRepository;

/**
 * Scheduled service for cleaning up expired authentication tokens.
 *
 * <p>Runs periodically to remove expired password reset tokens and email verification tokens
 * from the database to maintain data hygiene and prevent token reuse attacks.
 */
@Service
public class TokenCleanupService {

  private static final Logger log = LoggerFactory.getLogger(TokenCleanupService.class);

  private final StudentRepository studentRepository;

  public TokenCleanupService(StudentRepository studentRepository) {
    this.studentRepository = studentRepository;
  }

  /**
   * Clean up expired password reset tokens.
   *
   * <p>Runs daily at 2:00 AM UTC. Removes all reset tokens that have expired,
   * preventing their potential reuse and cleaning up the database.
   */
  @Scheduled(cron = "0 0 2 * * ?", zone = "UTC")
  @Transactional
  public void cleanExpiredResetTokens() {
    try {
      Instant now = Instant.now();
      int deleted = studentRepository.clearExpiredResetTokens(now);
      
      if (deleted > 0) {
        log.info("[TOKEN CLEANUP] Cleared {} expired password reset tokens", deleted);
      } else {
        log.debug("[TOKEN CLEANUP] No expired password reset tokens found");
      }
    } catch (Exception ex) {
      log.error("[TOKEN CLEANUP] Failed to clean expired reset tokens", ex);
    }
  }

  /**
   * Clean up expired email verification tokens.
   *
   * <p>Runs daily at 2:15 AM UTC. Removes all verification tokens that have expired,
   * ensuring unverified emails are eventually cleaned up.
   */
  @Scheduled(cron = "0 15 2 * * ?", zone = "UTC")
  @Transactional
  public void cleanExpiredVerificationTokens() {
    try {
      Instant now = Instant.now();
      int deleted = studentRepository.clearExpiredEmailVerificationTokens(now);
      
      if (deleted > 0) {
        log.info("[TOKEN CLEANUP] Cleared {} expired email verification tokens", deleted);
      } else {
        log.debug("[TOKEN CLEANUP] No expired email verification tokens found");
      }
    } catch (Exception ex) {
      log.error("[TOKEN CLEANUP] Failed to clean expired verification tokens", ex);
    }
  }

  /**
   * Clean up expired one-time password reset tokens (tokens that were used).
   *
   * <p>Runs daily at 2:30 AM UTC. Removes all one-time use tokens that have expired.
   * These are kept briefly to prevent double-usage attacks.
   */
  @Scheduled(cron = "0 30 2 * * ?", zone = "UTC")
  @Transactional
  public void cleanExpiredUsedResetTokens() {
    try {
      Instant now = Instant.now();
      int deleted = studentRepository.clearUsedResetTokensOlderthan(now);
      
      if (deleted > 0) {
        log.info("[TOKEN CLEANUP] Cleared {} used (revoked) password reset tokens", deleted);
      } else {
        log.debug("[TOKEN CLEANUP] No old used reset tokens found");
      }
    } catch (Exception ex) {
      log.error("[TOKEN CLEANUP] Failed to clean used reset tokens", ex);
    }
  }
}
