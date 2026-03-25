# Password Reset Security Improvements

This document details three major security enhancements to the password reset and authentication system implemented in this version.

## Overview

Three comprehensive improvements have been implemented:

1. **Scheduled Token Cleanup** - Automatic periodic removal of expired tokens
2. **Email Verification Infrastructure** - Support for optional email verification as a second factor
3. **Security Audit Logging** - Complete audit trail of password reset attempts and completions

---

## 1. Scheduled Token Cleanup

### Purpose
Automatically removes expired and used password reset tokens from the database on a scheduled basis to prevent token reuse attacks and maintain database hygiene.

### Implementation

**Service:** `com.hostelmanagement.service.TokenCleanupService`

Three scheduled cleanup jobs run daily:

| Time (UTC) | Job | Purpose |
|-----------|-----|---------|
| 2:00 AM | `cleanExpiredResetTokens()` | Clear expired password reset tokens |
| 2:15 AM | `cleanExpiredVerificationTokens()` | Clear expired email verification tokens |
| 2:30 AM | `cleanExpiredUsedResetTokens()` | Clear used/revoked reset tokens older than 24 hours |

### Database Operations

All cleanup methods are transactional and use efficient batch UPDATE operations:

```java
@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("""
  UPDATE Student s
  SET s.resetToken = null,
      s.resetTokenExpiry = null
  WHERE s.resetToken IS NOT NULL
    AND s.resetTokenExpiry IS NOT NULL
    AND s.resetTokenExpiry < :cutoff
""")
int clearExpiredResetTokens(@Param("cutoff") Instant cutoff);
```

### Logging

Each cleanup job logs:
- **Success**: Number of tokens cleared (INFO level)
- **Empty result**: No expired tokens found (DEBUG level)  
- **Errors**: Full exception with ERROR level

Example log output:
```
[TOKEN CLEANUP] Cleared 5 expired password reset tokens
[TOKEN CLEANUP] No expired email verification tokens found
[TOKEN CLEANUP] Failed to clean used reset tokens: <exception>
```

### Configuration

Cron expressions use UTC timezone for predictable execution across deployments:
- `0 0 2 * * ?` = Every day at 02:00 UTC
- `0 15 2 * * ?` = Every day at 02:15 UTC
- `0 30 2 * * ?` = Every day at 02:30 UTC

---

## 2. Email Verification Infrastructure

### Purpose
Provides the technical foundation for optional email verification as a second factor during password reset, improving account security.

### Data Model

**New Student Entity Fields:**

```java
@Column(name = "email_verification_token")
private String emailVerificationToken;

@Column(name = "email_verification_token_expiry")
private Instant emailVerificationTokenExpiry;

@Column(name = "is_email_verified", nullable = false)
private boolean isEmailVerified = false;

@Column(name = "last_password_reset_at")
private Instant lastPasswordResetAt;

@Column(name = "last_password_reset_attempt_at")
private Instant lastPasswordResetAttemptAt;
```

**Database Indexes:**
- `idx_students_email_verification_token` - Fast token lookups

### Repository Methods

New query methods in `StudentRepository`:

```java
Optional<Student> findByEmailVerificationToken(String emailVerificationToken);

@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("""
  UPDATE Student s
  SET s.emailVerificationToken = null,
      s.emailVerificationTokenExpiry = null
  WHERE s.emailVerificationToken IS NOT NULL
    AND s.emailVerificationTokenExpiry IS NOT NULL
    AND s.emailVerificationTokenExpiry < :cutoff
""")
int clearExpiredEmailVerificationTokens(@Param("cutoff") Instant cutoff);
```

### Migration

**File:** `db/migration/V19__add_email_verification_and_audit_fields.sql`

```sql
ALTER TABLE students ADD COLUMN email_verification_token VARCHAR(255);
ALTER TABLE students ADD COLUMN email_verification_token_expiry TIMESTAMP;
ALTER TABLE students ADD COLUMN is_email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE students ADD COLUMN last_password_reset_at TIMESTAMP;
ALTER TABLE students ADD COLUMN last_password_reset_attempt_at TIMESTAMP;

CREATE INDEX idx_students_email_verification_token ON students(email_verification_token);

-- Backfill existing users as verified (they're already registered)
UPDATE students SET is_email_verified = TRUE WHERE id IS NOT NULL;
```

### Optional Implementation Path

To enable email verification as a second factor:

1. **Update Registration Flow**
   ```java
   // In AuthService.register()
   student.setEmailVerified(false);
   // Generate email verification token
   byte[] tokenBytes = new byte[32];
   SECURE_RANDOM.nextBytes(tokenBytes);
   String verificationToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
   student.setEmailVerificationToken(verificationToken);
   student.setEmailVerificationTokenExpiry(Instant.now().plusSeconds(86400)); // 24 hours
   ```

2. **Add Verification Endpoint**
   ```java
   @PostMapping("/verify-email")
   public ResponseEntity<String> verifyEmail(@RequestParam String token) {
       authService.verifyEmail(token);
       return ResponseEntity.ok("Email verified successfully");
   }
   ```

3. **Update NotificationService**
   ```java
   @Async("taskExecutor")
   public void sendEmailVerification(String email, String name, String verificationUrl, Instant expiresAt) {
       // Send email with verification link
   }
   ```

4. **Frontend Integration**
   - Add email verification confirmation page
   - Redirect after successful registration to verification page
   - Optional: Add "Resend Verification" button

### Backward Compatibility

- **Existing students**: Backfilled with `is_email_verified = true`
- **No breaking changes**: Email verification is optional and not enforced
- **Gradual rollout**: Can enable for new registrations while maintaining access for existing users

---

## 3. Security Audit Logging

### Purpose
Creates a comprehensive audit trail of all password reset attempts and completions for security monitoring, compliance, and forensic analysis.

### Implementation

**Service:** `com.hostelmanagement.security.SecurityAuditLogger`

Provides structured logging methods for security events:

```java
public void logPasswordResetRequest(String email, String ipAddress, boolean success, String reason)
public void logPasswordResetCompletion(String email, String ipAddress, boolean success, String reason)
public void logEmailVerificationRequest(String email, boolean success)
public void logEmailVerificationCompletion(String email, boolean success, String reason)
public void logInvalidTokenAttempt(String tokenType, String tokenHash, String email)
public void logRateLimitExceeded(String email, String ipAddress)
public void logSuspiciousActivity(String activityType, String email, String details)
```

### Audit Log Format

All logs follow a structured format with masked email addresses:

```
[AUTH-AUDIT] EVENT_TYPE | EMAIL=***@domain | IP=address | STATUS=... | TIMESTAMP=... | [Details]
```

**Privacy:** Email addresses are masked to show only the domain part:
- Input: `student@uni.edu.gh`
- Logged: `***@uni.edu.gh`

### Integration with AuthService

**Password Reset Request:**
```java
@Transactional
public void forgotPassword(String email) {
    String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
    
    if (!passwordResetRateLimiter.tryAcquire(normalizedEmail, resetRateLimitSeconds)) {
        securityAuditLogger.logRateLimitExceeded(normalizedEmail, null);
        throw new IllegalArgumentException("Please wait...");
    }
    
    // ... generate token ...
    
    try {
        student.setLastPasswordResetAttemptAt(Instant.now());
        studentRepository.save(student);
        notificationService.sendPasswordReset(...);
        securityAuditLogger.logPasswordResetRequest(normalizedEmail, null, true, null);
    } catch (Exception e) {
        securityAuditLogger.logPasswordResetRequest(normalizedEmail, null, false, e.getMessage());
        throw e;
    }
}
```

**Password Reset Completion:**
```java
@Transactional
public void resetPassword(String token, String newPassword) {
    Student student = studentRepository.findByResetToken(token)
        .orElseThrow(() -> {
            securityAuditLogger.logInvalidTokenAttempt("PASSWORD_RESET", token, null);
            return new IllegalArgumentException("Invalid token");
        });
    
    if (student.getResetTokenExpiry().isBefore(Instant.now())) {
        securityAuditLogger.logPasswordResetCompletion(student.getEmail(), null, false, "Token expired");
        throw new IllegalArgumentException("Token has expired");
    }
    
    try {
        student.setPassword(passwordEncoder.encode(newPassword));
        student.setResetToken(null);
        student.setResetTokenExpiry(null);
        student.setLastPasswordResetAt(Instant.now());
        studentRepository.save(student);
        
        securityAuditLogger.logPasswordResetCompletion(student.getEmail(), null, true, null);
    } catch (Exception e) {
        securityAuditLogger.logPasswordResetCompletion(student.getEmail(), null, false, e.getMessage());
        throw e;
    }
}
```

### Audit Timestamps

New fields in Student entity track password reset activity:

| Field | Purpose |
|-------|---------|
| `lastPasswordResetAttemptAt` | Timestamp of last password reset request (successful or not) |
| `lastPasswordResetAt` | Timestamp of last successful password reset |

These enable queries like:
- "Find students who never reset their password"
- "Find students with multiple failed reset attempts"
- "Generate password reset activity reports"

### Logging Configuration

Configure the audit logger in `application.yml`:

```yaml
logging:
  level:
    com.hostelmanagement.audit: INFO  # Audit events
    com.hostelmanagement: WARN         # General app logs
```

### Log Examples

**Successful password reset request:**
```
[AUTH-AUDIT] PASSWORD_RESET_REQUEST | EMAIL=***@uni.edu.gh | IP=unknown | STATUS=SUCCESS | TIMESTAMP=2024-01-15T10:30:45Z
```

**Rate limit exceeded:**
```
[AUTH-AUDIT] RATE_LIMIT_EXCEEDED | EMAIL=***@uni.edu.gh | IP=192.168.1.5 | TIMESTAMP=2024-01-15T10:30:46Z
```

**Token expiry attempt:**
```
[AUTH-AUDIT] PASSWORD_RESET_COMPLETION | EMAIL=***@uni.edu.gh | IP=unknown | STATUS=FAILED | TIMESTAMP=2024-01-15T10:35:12Z - Reason: Token expired
```

**Invalid token attempt:**
```
[AUTH-AUDIT] INVALID_TOKEN_ATTEMPT | TOKEN_TYPE=PASSWORD_RESET | TOKEN_HASH=...4ab2c | EMAIL=***@uni.edu.gh | TIMESTAMP=2024-01-15T10:40:00Z
```

### Monitoring and Alerts

Use these logs to:
- Monitor suspicious activity (multiple failed resets)
- Generate compliance reports
- Alert on rate limit abuse
- Detect account takeover attempts
- Audit security incidents

---

## Security Benefits Summary

| Improvement | Benefit |
|------------|---------|
| **Token Cleanup** | Prevents token reuse, reduces database bloat, improves performance |
| **Email Verification** | Optional second factor authentication, improved account security |
| **Audit Logging** | Forensic trail, compliance requirement, threat detection, compliance audits |

---

## Implementation Checklist

- [x] Create TokenCleanupService with scheduled jobs
- [x] Add email verification fields to Student entity
- [x] Create StudentRepository query methods
- [x] Implement SecurityAuditLogger
- [x] Integrate audit logging in AuthService
- [x] Create database migration
- [ ] Configure audit logging level in application.yml (optional)
- [ ] Implement email verification workflow (optional, future work)
- [ ] Add email verification UI (optional, future work)
- [ ] Set up audit log monitoring/alerting (optional, future work)

---

## Testing

### Manual Testing

1. **Token Cleanup**
   - Create password reset with immediate timestamp
   - Wait for 2:00 AM UTC or manually trigger cleanup
   - Verify token is cleared from database

2. **Audit Logging**
   - Request password reset
   - Check logs for `[AUTH-AUDIT] PASSWORD_RESET_REQUEST` entry
   - Verify email is masked
   - Complete reset and verify `PASSWORD_RESET_COMPLETION` log

3. **Email Verification (when implemented)**
   - Register new student
   - Check for verification token in logs
   - Call verify endpoint with valid token
   - Verify marked as email verified

### Test Queries

```sql
-- Check password reset activity
SELECT id, email, lastPasswordResetAttemptAt, lastPasswordResetAt 
FROM students 
WHERE lastPasswordResetAttemptAt IS NOT NULL 
ORDER BY lastPasswordResetAttemptAt DESC;

-- Find expired verification tokens
SELECT id, email, emailVerificationTokenExpiry 
FROM students 
WHERE emailVerificationToken IS NOT NULL 
AND emailVerificationTokenExpiry < NOW();
```

---

## Files Modified

| File | Type | Changes |
|------|------|---------|
| `TokenCleanupService.java` | Created | Scheduled token cleanup service |
| `SecurityAuditLogger.java` | Created | Audit logging utility |
| `Student.java` | Modified | Added 5 new fields + getters/setters |
| `StudentRepository.java` | Modified | Added 3 query methods |
| `AuthService.java` | Modified | Integrated audit logging |
| `V19__add_email_verification_and_audit_fields.sql` | Created | Database migration |

---

## Deployment Notes

1. **Database Migration**: Run Flyway migration V19 automatically on startup
2. **Scheduled Tasks**: TokenCleanupService is auto-enabled; no configuration needed
3. **Logging**: Audit log output goes to standard application logging system
4. **No Breaking Changes**: Backward compatible with existing password reset flow

---

## Future Enhancements

1. **Persistent Audit Log**: Store audit events in database table instead of logs only
2. **Admin Dashboard**: View password reset activity and security metrics
3. **Email Verification**: Complete optional 2FA implementation for registrations
4. **Suspicious Activity Detection**: Automated alerts for multiple failed attempts
5. **Compliance Reports**: Generate audit reports for regulatory requirements
6. **IP Address Tracking**: Capture and log IP addresses of reset requests
7. **Rate Limit Analytics**: Dashboard showing rate limit patterns and abuse attempts

---

## Support

For questions or issues related to these improvements, refer to:
- `TokenCleanupService.java` - Implementation details
- `SecurityAuditLogger.java` - Available logging methods
- `AuthService.java` - Integration examples
- Database schema: `V19__add_email_verification_and_audit_fields.sql`
