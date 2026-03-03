package com.hostelmanagement.config;

import java.time.Duration;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

/**
 * Per-cache TTL configuration for Redis.
 *
 * <p>Cache names:
 * <ul>
 *   <li>{@code active-hostels} – list of active hostels; rarely changes → 10 min TTL.</li>
 *   <li>{@code available-rooms} – available rooms per hostel/gender; changes on every
 *       booking/cancellation → explicit {@code @CacheEvict} on writes + 2 min safety-net TTL.</li>
 * </ul>
 *
 * <p><b>Note on eviction ordering:</b> {@code @CacheEvict} on {@code @Transactional} methods
 * evicts <em>after the method returns but before the transaction commits</em>. For this
 * application this is acceptable — the 2 min TTL acts as a safety net. A production
 * implementation would use {@code TransactionSynchronizationManager.registerSynchronization}
 * to evict strictly post-commit.
 */
@Configuration
public class CacheConfig {

  @Bean
  public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
    RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()
        .disableCachingNullValues()
        .serializeValuesWith(
            RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));

    return builder -> builder
        .withCacheConfiguration("active-hostels", base.entryTtl(Duration.ofMinutes(10)))
        .withCacheConfiguration("available-rooms", base.entryTtl(Duration.ofMinutes(2)));
  }
}
