package com.hostelmanagement.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Security audit logger for authentication-related events.
 *
 * <p>Logs password reset attempts, email verification, and other sensitive
 * authentication events to an audit trail for security monitoring and compliance.
 */
@Component
public class SecurityAuditLogger {

  private static final Logger auditLog = LoggerFactory.getLogger("com.hostelmanagement.audit");
  private static final DateTimeFormatter TIMESTAMP_FMT = DateTimeFormatter.ISO_INSTANT;

  /**
   * Log a password reset attempt (initial request).
   *
   * @param email Email address that requested password reset
   * @param ipAddress IP address of the requester (optional)
   * @param success Whether the request was successful
   * @param reason Reason for failure (if unsuccessful)
   */
  public void logPasswordResetRequest(String email, String ipAddress, boolean success, String reason) {
    String timestamp = TIMESTAMP_FMT.format(Instant.now());
    String ip = ipAddress != null ? ipAddress : "unknown";
    String status = success ? "SUCCESS" : "FAILED";
    String detail = reason != null ? " - Reason: " + sanitizeReason(reason) : "";
    
    auditLog.info(
        "[AUTH-AUDIT] PASSWORD_RESET_REQUEST | EMAIL={} | IP={} | STATUS={} | TIMESTAMP={}{}",
        maskEmail(email), ip, status, timestamp, detail);
  }

  /**
   * Log a password reset completion attempt.
   *
   * @param email Email address that reset password
   * @param ipAddress IP address of the requester (optional)
   * @param success Whether the reset was successful
   * @param reason Reason for failure (if unsuccessful)
   */
  public void logPasswordResetCompletion(String email, String ipAddress, boolean success, String reason) {
    String timestamp = TIMESTAMP_FMT.format(Instant.now());
    String ip = ipAddress != null ? ipAddress : "unknown";
    String status = success ? "SUCCESS" : "FAILED";
    String detail = reason != null ? " - Reason: " + sanitizeReason(reason) : "";
    
    auditLog.warn(
        "[AUTH-AUDIT] PASSWORD_RESET_COMPLETION | EMAIL={} | IP={} | STATUS={} | TIMESTAMP={}{}",
        maskEmail(email), ip, status, timestamp, detail);
  }

  /**
   * Log an email verification request.
   *
   * @param email Email address being verified
   * @param success Whether the request was successful
   */
  public void logEmailVerificationRequest(String email, boolean success) {
    String timestamp = TIMESTAMP_FMT.format(Instant.now());
    String status = success ? "REQUESTED" : "FAILED";
    
    auditLog.info(
        "[AUTH-AUDIT] EMAIL_VERIFICATION_REQUEST | EMAIL={} | STATUS={} | TIMESTAMP={}",
        maskEmail(email), status, timestamp);
  }

  /**
   * Log an email verification completion.
   *
   * @param email Email address that was verified
   * @param success Whether the verification was successful
   * @param reason Reason for failure (if unsuccessful)
   */
  public void logEmailVerificationCompletion(String email, boolean success, String reason) {
    String timestamp = TIMESTAMP_FMT.format(Instant.now());
    String status = success ? "VERIFIED" : "FAILED";
    String detail = reason != null ? " - Reason: " + sanitizeReason(reason) : "";
    
    auditLog.warn(
        "[AUTH-AUDIT] EMAIL_VERIFICATION_COMPLETION | EMAIL={} | STATUS={} | TIMESTAMP={}{}",
        maskEmail(email), status, timestamp, detail);
  }

  /**
   * Log an invalid or expired token usage attempt.
   *
   * @param tokenType Type of token (e.g., "PASSWORD_RESET", "EMAIL_VERIFICATION")
   * @param tokenHash Hash of the token (for identification without exposing actual token)
   * @param email Email address associated with the token (optional)
   */
  public void logInvalidTokenAttempt(String tokenType, String tokenHash, String email) {
    String timestamp = TIMESTAMP_FMT.format(Instant.now());
    String emailStr = email != null ? maskEmail(email) : "unknown";
    
    auditLog.warn(
        "[AUTH-AUDIT] INVALID_TOKEN_ATTEMPT | TOKEN_TYPE={} | TOKEN_HASH={} | EMAIL={} | TIMESTAMP={}",
      tokenType, tokenFingerprint(tokenHash), emailStr, timestamp);
  }

  /**
   * Log rate limit exceeded on password reset.
   *
   * @param email Email address that exceeded rate limit
   * @param ipAddress IP address of the requester
   */
  public void logRateLimitExceeded(String email, String ipAddress) {
    String timestamp = TIMESTAMP_FMT.format(Instant.now());
    String ip = ipAddress != null ? ipAddress : "unknown";
    
    auditLog.warn(
        "[AUTH-AUDIT] RATE_LIMIT_EXCEEDED | EMAIL={} | IP={} | TIMESTAMP={}",
        maskEmail(email), ip, timestamp);
  }

  /**
   * Log a suspicious authentication activity.
   *
   * @param activityType Type of suspicious activity
   * @param email Email address involved (optional)
   * @param details Additional details about the activity
   */
  public void logSuspiciousActivity(String activityType, String email, String details) {
    String timestamp = TIMESTAMP_FMT.format(Instant.now());
    String emailStr = email != null ? maskEmail(email) : "unknown";
    
    auditLog.error(
        "[AUTH-AUDIT] SUSPICIOUS_ACTIVITY | TYPE={} | EMAIL={} | DETAILS={} | TIMESTAMP={}",
        activityType, emailStr, details, timestamp);
  }

  /**
   * Mask email for logging (show only domain).
   *
   * @param email Email address to mask
   * @return Masked email (e.g., "student@uni.edu.gh" -> "***@uni.edu.gh")
   */
  private static String maskEmail(String email) {
    if (email == null || !email.contains("@")) {
      return "***";
    }
    String[] parts = email.split("@");
    if (parts.length == 2) {
      return "***@" + parts[1];
    }
    return "***";
  }

  private static String tokenFingerprint(String token) {
    if (token == null || token.isBlank()) {
      return "none";
    }

    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hashBytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
      String hex = HexFormat.of().formatHex(hashBytes);
      return "sha256:" + hex.substring(0, 16);
    } catch (NoSuchAlgorithmException ex) {
      return "sha256:unavailable";
    }
  }

  private static String sanitizeReason(String reason) {
    String normalized = reason.replace('\n', ' ').replace('\r', ' ');
    if (normalized.length() > 120) {
      return normalized.substring(0, 120) + "...";
    }
    return normalized;
  }
}
