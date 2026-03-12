package com.hostelmanagement.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class PasswordResetRateLimiter {

  private static final Logger log = LoggerFactory.getLogger(PasswordResetRateLimiter.class);

  private final Optional<StringRedisTemplate> redisTemplate;
  private final Map<String, Instant> inMemoryWindow = new ConcurrentHashMap<>();

  public PasswordResetRateLimiter(@Autowired(required = false) StringRedisTemplate redisTemplate) {
    this.redisTemplate = Optional.ofNullable(redisTemplate);
  }

  public boolean tryAcquire(String email, long windowSeconds) {
    if (windowSeconds <= 0) {
      return true;
    }

    if (redisTemplate.isPresent()) {
      try {
        String key = "auth:pwdreset:ratelimit:" + email;
        Boolean acquired =
            redisTemplate.get().opsForValue().setIfAbsent(key, "1", Duration.ofSeconds(windowSeconds));
        return Boolean.TRUE.equals(acquired);
      } catch (Exception ex) {
        log.warn("[AUTH] Redis rate limiter unavailable, falling back to in-memory: {}", ex.getMessage());
      }
    }

    Instant now = Instant.now();
    Instant lastRequest = inMemoryWindow.get(email);
    if (lastRequest != null && now.isBefore(lastRequest.plusSeconds(windowSeconds))) {
      return false;
    }

    inMemoryWindow.put(email, now);
    return true;
  }
}
