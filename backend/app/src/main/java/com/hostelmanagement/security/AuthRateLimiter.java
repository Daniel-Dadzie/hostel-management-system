package com.hostelmanagement.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Rate limiter for authentication endpoints (login, register).
 * Uses token-bucket algorithm with configurable limits.
 */
@Component
public class AuthRateLimiter {

  private static final Logger log = LoggerFactory.getLogger(AuthRateLimiter.class);

  private final Optional<StringRedisTemplate> redisTemplate;
  private final Map<String, RateLimitBucket> inMemoryBuckets = new ConcurrentHashMap<>();

  private final long maxAttempts;
  private final long windowSeconds;
  private final long lockoutSeconds;

  public AuthRateLimiter(
      @Autowired(required = false) StringRedisTemplate redisTemplate,
      @Value("${app.rate-limit.auth.max-attempts:5}") long maxAttempts,
      @Value("${app.rate-limit.auth.window-seconds:300}") long windowSeconds,
      @Value("${app.rate-limit.auth.lockout-seconds:900}") long lockoutSeconds) {
    this.redisTemplate = Optional.ofNullable(redisTemplate);
    this.maxAttempts = maxAttempts;
    this.windowSeconds = windowSeconds;
    this.lockoutSeconds = lockoutSeconds;
  }

  /**
   * Attempt to acquire a token for the given identifier (email/IP).
   * Returns true if the request is allowed, false if rate limited.
   */
  public boolean tryAcquire(String identifier) {
    if (windowSeconds <= 0 || maxAttempts <= 0) {
      return true; // Rate limiting disabled
    }

    if (redisTemplate.isPresent()) {
      return tryAcquireRedis(identifier);
    }

    return tryAcquireInMemory(identifier);
  }

  private boolean tryAcquireRedis(String identifier) {
    try {
      String key = "auth:ratelimit:" + identifier;

      // Check if currently locked out
      String lockKey = "auth:lockout:" + identifier;
      String lockValue = redisTemplate.get().opsForValue().get(lockKey);
      if (lockValue != null) {
        log.warn("[AUTH] Rate limit: Account {} is locked out", identifier);
        return false;
      }

      Long attempts = redisTemplate.get().opsForValue().increment(key);
      if (attempts == 1) {
        redisTemplate.get().expire(key, Duration.ofSeconds(windowSeconds));
      }

      if (attempts > maxAttempts) {
        // Lock the account
        redisTemplate.get().opsForValue().set(lockKey, "1", Duration.ofSeconds(lockoutSeconds));
        redisTemplate.get().delete(key);
        log.warn("[AUTH] Rate limit: Account {} exceeded max attempts and is locked out", identifier);
        return false;
      }

      return true;
    } catch (Exception ex) {
      log.warn("[AUTH] Redis rate limiter unavailable, falling back to in-memory: {}", ex.getMessage());
      return tryAcquireInMemory(identifier);
    }
  }

  private boolean tryAcquireInMemory(String identifier) {
    Instant now = Instant.now();
    RateLimitBucket bucket = inMemoryBuckets.computeIfAbsent(identifier, k -> new RateLimitBucket());

    // Check if locked out
    if (bucket.isLockedOut(now)) {
      return false;
    }

    // Reset bucket if window has expired
    if (bucket.isWindowExpired(now, windowSeconds)) {
      bucket.reset(now, windowSeconds);
    }

    // Check if max attempts exceeded
    if (bucket.getAttempts() >= maxAttempts) {
      bucket.lockOut(now, lockoutSeconds);
      log.warn("[AUTH] Rate limit: Account {} exceeded max attempts and is locked out", identifier);
      return false;
    }

    bucket.incrementAttempts();
    return true;
  }

  /**
   * Clear the rate limit for a specific identifier (e.g., after successful login).
   */
  public void clear(String identifier) {
    if (redisTemplate.isPresent()) {
      try {
        redisTemplate.get().delete("auth:ratelimit:" + identifier);
        redisTemplate.get().delete("auth:lockout:" + identifier);
      } catch (Exception ex) {
        log.warn("[AUTH] Failed to clear rate limit in Redis: {}", ex.getMessage());
      }
    }
    inMemoryBuckets.remove(identifier);
  }

  private static class RateLimitBucket {
    private long attempts = 0;
    private Instant windowStart;
    private Instant lockoutUntil;

    void reset(Instant now, long windowSeconds) {
      this.attempts = 0;
      this.windowStart = now.plusSeconds(windowSeconds);
    }

    void incrementAttempts() {
      this.attempts++;
    }

    boolean isWindowExpired(Instant now, long windowSeconds) {
      return windowStart == null || now.isAfter(windowStart.plusSeconds(windowSeconds));
    }

    boolean isLockedOut(Instant now) {
      return lockoutUntil != null && now.isBefore(lockoutUntil);
    }

    void lockOut(Instant now, long lockoutSeconds) {
      this.lockoutUntil = now.plusSeconds(lockoutSeconds);
    }

    long getAttempts() {
      return attempts;
    }
  }
}
