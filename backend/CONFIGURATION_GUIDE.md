# Password Reset Security Configuration Guide

This document explains the configuration options for the new password reset security features.

## Application Configuration (application.yml)

### Audit Logging Configuration

Add the following to your `application.yml` to configure audit logging levels:

```yaml
logging:
  level:
    # Audit trail for authentication events
    com.hostelmanagement.audit: INFO
    
    # Token cleanup operations
    com.hostelmanagement.service.TokenCleanupService: INFO
    
    # General application logging
    com.hostelmanagement: WARN
    org.springframework: WARN
    org.hibernate: WARN
```

**Log Levels:**
- `DEBUG`: Detailed information (no expired tokens found, etc.)
- `INFO`: Important events (tokens cleared, reset requests, etc.)
- `WARN`: Warning events (payment approval, password changes, etc.)
- `ERROR`: Error failures (cleanup failures, exceptions, etc.)

### Example Full Configuration Block

```yaml
# Logging configuration
logging:
  level:
    # Security audit trail
    com.hostelmanagement.audit: INFO
    com.hostelmanagement.security: DEBUG
    
    # Service and repository operations
    com.hostelmanagement.service: INFO
    com.hostelmanagement.repository: WARN
    
    # Framework logging
    org.springframework: WARN
    org.springframework.boot.actuate: INFO
    org.hibernate: WARN
    org.hibernate.SQL: DEBUG  # Uncomment for SQL debugging
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE  # Uncomment for SQL parameter logging
  
  # Optional: Write audit logs to separate file
  # file:
  #   name: logs/application.log
  # logback:
  #   rollingpolicy:
  #     max-file-size: 10MB
  #     max-history: 10
```

## Environment-Specific Configurations

### Development Environment

```yaml
# application-dev.yml
logging:
  level:
    com.hostelmanagement.audit: DEBUG
    com.hostelmanagement.security: DEBUG
    org.hibernate.SQL: DEBUG

# Enable SMTP simulation (optional)
spring:
  mail:
    # Leave empty or use mock SMTP for development
    # NotificationService will log emails instead of sending
```

**Output:** Detailed logs with all password reset attempts and token operations for debugging.

### Production Environment

```yaml
# application-prod.yml
logging:
  level:
    com.hostelmanagement.audit: INFO
    com.hostelmanagement.security: WARN
    com.hostelmanagement.service: WARN
    org.springframework: WARN
  
  file:
    name: /var/log/hostel-management/application.log
    max-size: 10MB
    max-history: 30
    
  # Optional: Use external service for centralized logging
  # Pattern to use with aggregation tools like ELK, Splunk, CloudWatch, etc.
```

**Output:** Only important events logged, aggregated for monitoring.

## Optional Email Verification Configuration

If you plan to implement email verification, add these properties:

```yaml
app:
  auth:
    # Enable email verification (default: false)
    require-email-verification: false
    
    # Email verification token expiry in seconds (default: 86400 = 24 hours)
    email-verification-expiry-seconds: 86400
    
    # After registration, redirect to verification screen percentage
    # (0-100, useful for A/B testing gradual rollout)
    verification-rollout-percentage: 0
```

### Gradual Rollout Strategy

Sample configuration for gradual email verification rollout:

```yaml
# Stage 1: Testing with small percentage
app:
  auth:
    verification-rollout-percentage: 5  # Only 5% of new users

---
# Stage 2: Increase rollout
app:
  auth:
    verification-rollout-percentage: 50  # Half of new users

---
# Stage 3: Full rollout
app:
  auth:
    require-email-verification: true
    verification-rollout-percentage: 100
```

## Docker/Container Configuration

For containerized deployments, use environment variables:

```bash
# Set via environment variables
docker run \
  -e LOGGING_LEVEL_COM_HOSTELMANAGEMENT_AUDIT=INFO \
  -e LOGGING_LEVEL_COM_HOSTELMANAGEMENT_SECURITY=WARN \
  -e APP_AUTH_REQUIRE_EMAIL_VERIFICATION=false \
  -e APP_AUTH_EMAIL_VERIFICATION_EXPIRY_SECONDS=86400 \
  hostel-management:latest
```

Or in `docker-compose.yml`:

```yaml
services:
  app:
    environment:
      LOGGING_LEVEL_COM_HOSTELMANAGEMENT_AUDIT: INFO
      LOGGING_LEVEL_COM_HOSTELMANAGEMENT_SECURITY: WARN
      APP_AUTH_REQUIRE_EMAIL_VERIFICATION: "false"
      SPRING_MAIL_HOST: smtp.gmail.com
      SPRING_MAIL_PORT: 587
```

## Database Connection Configuration

Ensure your database connection has proper settings:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/hostel_management
    username: root
    password: ${DB_PASSWORD}
    hikari:
      maximumPoolSize: 10
      idleTimeout: 300000
  
  jpa:
    hibernate:
      ddl-auto: validate  # Use 'validate' in production
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        # Enable batch processing for cleanup operations
        jdbc:
          batch_size: 20
          fetch_size: 50
```

## Email Configuration

Required for sending password reset emails:

```yaml
spring:
  mail:
    host: smtp.gmail.com  # or your SMTP server
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
          connectiontimeout: 5000
          timeout: 5000
          writetimeout: 5000
```

**Gmail Configuration Example:**

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-hostel-email@gmail.com
    password: your-app-password  # Use app-specific password for Gmail
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
```

**Note:** For Gmail, generate an [App Password](https://support.google.com/accounts/answer/185833) instead of using your regular password.

## Task Executor Configuration (for Async Emails)

Configuration for background email sending (already configured, shown for reference):

```yaml
# In com.hostelmanagement.config.AsyncConfig
# Already set up with:
# - Core pool size: 4 threads
# - Max pool size: 20 threads
# - Queue capacity: 100 tasks
# - Thread name prefix: "async-"

# Optional: Configure timeout for async tasks
spring:
  task:
    execution:
      pool:
        core-size: 4
        max-size: 20
        queue-capacity: 100
      thread-name-prefix: "async-"
```

## Monitoring and Alerting

### Log File Rotation

For production, configure log rotation:

```yaml
logging:
  file:
    name: /var/log/hostel-management/app.log
  logback:
    rollingpolicy:
      max-file-size: 10MB
      max-history: 30  # Keep 30 days of logs
      total-size-cap: 5GB
```

### External Log Aggregation

Configure for services like ELK, Splunk, CloudWatch:

```yaml
# Example: AWS CloudWatch
logging:
  level:
    com.hostelmanagement.audit: INFO
  
  # Add CloudWatch appender to logback-spring.xml
  # Configure via environment variables
  aws:
    cloudwatch:
      log-group: /hostel-management/prod
      log-stream: application
```

## Troubleshooting Configuration

### Issue: Token cleanup not running

**Solution:** Verify scheduled task is enabled:

```yaml
spring:
  task:
    scheduling:
      enabled: true  # Ensure scheduling is enabled
      pool:
        size: 2  # Number of scheduler threads
```

### Issue: Too many logs

**Solution:** Increase log level to WARN:

```yaml
logging:
  level:
    com.hostelmanagement.audit: WARN  # Only failures
    com.hostelmanagement: WARN
```

### Issue: Emails not sending in development

**Solution:** Enable log-only mode (no SMTP configured):

```yaml
spring:
  mail:
    # Don't configure host/port - NotificationService uses log-only fallback
    
logging:
  level:
    com.hostelmanagement.service.NotificationService: INFO
```

Emails will be logged instead of sent for development.

## Verification

To verify configuration is working:

1. **Check Audit Logging:**
   ```bash
   # Request password reset via API
   curl -X POST http://localhost:8080/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"student@uni.edu.gh"}'
   
   # Check logs for audit entry
   grep "PASSWORD_RESET_REQUEST" logs/application.log
   ```

2. **Verify Token Cleanup Schedule:**
   ```bash
   # Look for startup message
   grep "TOKEN CLEANUP" logs/application.log
   
   # Or check at 2:00+ AM UTC
   tail -f logs/application.log | grep "TOKEN CLEANUP"
   ```

3. **Test Email Sending:**
   ```bash
   # Check logs for email notification
   grep "NOTIFICATION" logs/application.log
   ```

---

## Configuration Quick Reference

| Setting | Default | Purpose |
|---------|---------|---------|
| `logging.level.com.hostelmanagement.audit` | INFO | Audit log detail level |
| `app.auth.reset-rate-limit-seconds` | 60 | Rate limit window for password resets |
| `app.frontend-url` | http://localhost:5173 | Frontend URL for reset links |
| `spring.mail.host` | - | SMTP server (optional) |
| `spring.task.scheduling.enabled` | true | Enable token cleanup scheduling |

---

## Support

For issues with configuration, check:
1. `application.yml` syntax (YAML format)
2. `java -jar application.jar --help` for available properties
3. Application startup logs for configuration errors
4. Docker logs: `docker logs <container-id>`
