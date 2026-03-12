package com.hostelmanagement.scheduler;

import com.hostelmanagement.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PasswordResetTokenCleanupScheduler {

  private static final Logger log = LoggerFactory.getLogger(PasswordResetTokenCleanupScheduler.class);

  private final AuthService authService;

  public PasswordResetTokenCleanupScheduler(AuthService authService) {
    this.authService = authService;
  }

  @Scheduled(fixedDelayString = "${app.auth.reset-token-cleanup-ms:3600000}")
  public void cleanupExpiredResetTokens() {
    int cleaned = authService.clearExpiredResetTokens();
    if (cleaned > 0) {
      log.info("[AUTH] Cleared {} expired password reset token(s)", cleaned);
    }
  }
}
