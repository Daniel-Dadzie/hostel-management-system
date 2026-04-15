# Redis Caching - Troubleshooting Guide

## Common Issues & Solutions

## Issue 1: "Connection refused: no further information"

### Symptoms
```
Spring Boot startup error:
io.lettuce.core.RedisConnectionException: Unable to connect to 127.0.0.1:6379
```

### Root Causes & Solutions

**1A: Redis not running**

Check if Redis is running:
```bash
# Linux/macOS
ps aux | grep redis

# Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*redis*"}

# Docker
docker ps | grep redis
```

If not running, start it:
```bash
# Docker (recommended)
docker run -d -p 6379:6379 --name hostel-redis redis:latest

# Linux systemd
sudo systemctl start redis-server
sudo systemctl status redis-server

# macOS Homebrew
brew services start redis
```

**1B: Wrong host/port in configuration**

Check `application.yml`:
```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}  # Default: localhost
      port: ${REDIS_PORT:6379}       # Default: 6379
```

Verify environment variables:
```bash
# Linux/macOS
echo "Host: $REDIS_HOST, Port: $REDIS_PORT"

# Windows PowerShell
Write-Host "Host: $env:REDIS_HOST, Port: $env:REDIS_PORT"
```

If wrong, set them:
```bash
# Linux/macOS
export REDIS_HOST=localhost
export REDIS_PORT=6379

# Windows PowerShell
$env:REDIS_HOST = "localhost"
$env:REDIS_PORT = "6379"

# Verify
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
```

**1C: Firewall blocking connection**

Check if port is accessible:
```bash
# Test connectivity
redis-cli ping
# If "Could not connect": firewall issue

# Linux firewall
sudo iptables -A INPUT -p tcp --dport 6379 -j ACCEPT
sudo ufw allow 6379

# macOS firewall
# Go to: System Preferences > Security & Privacy > Firewall Options
```

**1D: Redis bound to wrong interface**

Check Redis config:
```bash
redis-cli
> CONFIG GET bind
# Output: "127.0.0.1" or "0.0.0.0"

# If need to bind to other interfaces:
> CONFIG SET bind "0.0.0.0"
> CONFIG REWRITE  # Make persistent
```

---

## Issue 2: "Cache always empty - no cache hits"

### Symptoms
```
- All requests hit database (50ms each)
- Redis shows no keys
- Cache hit rate = 0%
```

### Root Causes & Solutions

**2A: Caching not enabled**

Verify @EnableCaching is in code:
```bash
grep -r "@EnableCaching" backend/app/src/main/java
# Should find: CacheConfig.java
```

Check `application.yml`:
```yaml
spring:
  cache:
    type: ${CACHE_TYPE:redis}  # Must be "redis", not "none"
```

If missing, set environment variable:
```bash
export CACHE_TYPE=redis
```

Restart backend:
```bash
# Kill old process
pkill -f "hostel-management-system"
# Or Ctrl+C

# Restart
java -jar target/hostel-management-system-*.jar
```

**2B: @Cacheable annotation missing or wrong**

Check the service method:
```bash
grep -A5 "listAvailableRooms" \
  backend/app/src/main/java/com/hostelmanagement/service/StudentHostelService.java
```

Should have:
```java
@Cacheable(value = "available-rooms", key = "#hostelId + '-' + #studentId")
public List<RoomResponse> listAvailableRooms(Long studentId, Long hostelId) {
```

If missing, add the annotation and rebuild:
```bash
# Edit file, add @Cacheable
# Rebuild
mvn clean package -DskipTests
# Restart backend
```

**2C: Redis serialization error**

Check logs for serialization errors:
```bash
grep -i "serializ" backend-logs.txt

# Look for: "GenericJackson2JsonRedisSerializer"
# If errors about "NotSerializableException": problem!
```

Verify models have getters/setters:
```java
public class RoomResponse {
    private Long id;
    private String name;
    
    // Must have getters & setters for JSON serialization
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}
```

**2D: Null values affecting cache**

Check if returning null:
```java
@Cacheable(value = "available-rooms")
public List<RoomResponse> listAvailableRooms(...) {
    List<RoomResponse> result = roomRepository.findAvailable();
    // If result is empty, returns null?
    return result;  // Must return empty list, not null
}
```

Verify configuration disables null caching:
```bash
grep -A10 "disableCachingNullValues" \
  backend/app/src/main/java/com/hostelmanagement/config/CacheConfig.java
```

---

## Issue 3: "Redis memory growing unbounded"

### Symptoms
```
- Redis memory: 100MB → 500MB → 1GB (keeps growing)
- No errors in logs
- Redis not respecting TTL
```

### Root Causes & Solutions

**3A: TTL not configured**

Check Redis entry:
```bash
redis-cli
> KEYS "available-rooms*" | head -1
"available-rooms:::1-123"

> TTL "available-rooms:::1-123"
-1  # (no expiration - BAD!)
```

Fix: Verify CacheConfig sets TTLs:
```java
// In CacheConfig.java
@Bean
public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
    RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
        .entryTtl(Duration.ofMinutes(2))  // MUST have TTL
        ...
}
```

If not present, add TTL and restart:
```bash
# Edit CacheConfig.java
# Add .entryTtl(Duration.ofMinutes(2))

mvn clean package -DskipTests
systemctl restart hostel-backend
```

**3B: Unbounded cache keys (one per user+hostel combo)**

Check key count:
```bash
redis-cli
> DBSIZE
16500  # Too many!

> KEYS "available-rooms*" | wc -l
16000  # Different user combos

# Each user sorting creates new key!
```

This is normal but can be optimized:
```bash
# Monitor key growth during load test
watch -n 5 'redis-cli DBSIZE'

# If > 100k keys: Consider warming strategy
# Run manual warm instead of each user creating cache key
```

**3C: Eviction policy not set**

Check Redis memory policy:
```bash
redis-cli
> CONFIG GET maxmemory
0  # 0 means unlimited (bad!)

> CONFIG GET maxmemory-policy
"noeviction"  # Don't evict (bad!)
```

Set reasonable limits:
```bash
redis-cli
> CONFIG SET maxmemory 256mb
> CONFIG SET maxmemory-policy "allkeys-lru"
> CONFIG REWRITE  # Make persistent
```

Verify:
```bash
> CONFIG GET maxmemory
256mb

> CONFIG GET maxmemory-policy
"allkeys-lru"
```

**3D: Caching large objects**

Check object sizes:
```bash
# In Redis
> MEMORY USAGE "available-rooms:::1-123"
50000  # 50KB per entry - very large!
```

Optimize by caching less data:
```java
// Instead of caching entire response
@Cacheable("available-rooms")
public List<PartialRoomData> listAvailableRooms() {
    // Cache only: id, name, capacity (not full details)
}
```

---

## Issue 4: "Stale data - cache not invalidating"

### Symptoms
```
- Student applies for room
- Availability still shows room available (should be gone)
- Cache not evicted after write
```

### Root Causes & Solutions

**4A: @CacheEvict missing on write operations**

Check BookingService:
```bash
grep -B2 "@CacheEvict" backend/app/src/main/java/com/hostelmanagement/service/BookingService.java
```

Should see:
```java
@CacheEvict(value = "available-rooms", allEntries = true)
public BookingResponse apply(Long studentId, ApplyRequest request) {
    // Apply booking
    // Cache evicted AFTER method returns
}
```

If missing, add it:
```java
// BEFORE: No annotation
public BookingResponse apply(Long studentId, ApplyRequest request) {

// AFTER: With annotation
@CacheEvict(value = "available-rooms", allEntries = true)
public BookingResponse apply(Long studentId, ApplyRequest request) {
```

Methods that need @CacheEvict:
- `BookingService.apply()` – Create booking
- `BookingService.updateStatus()` – Approve/reject  
- `BookingService.expirePendingPayments()` – Expire booking

**4B: @CacheEvict timing issue**

@CacheEvict on @Transactional methods:
```java
@Transactional
@CacheEvict("available-rooms", allEntries = true)
public void updateStatus(Long bookingId, BookingStatus status) {
    // Cache evicted BEFORE transaction commits
    // Brief window: cache cleared but DB not updated yet
    // If student refreshes immediately: might see fresh data
}
```

Option A: Delay cache eviction (simple):
```java
@Transactional
public void updateStatus(Long bookingId, BookingStatus status) {
    bookingRepository.updateStatus(bookingId, status);
}

// Separate method for cache clear
@CacheEvict(value = "available-rooms", allEntries = true)
public void updateStatusAndClear(Long bookingId, BookingStatus status) {
    updateStatus(bookingId, status);
}
```

Option B: Post-commit eviction (complex):
```java
@Transactional
public void updateStatus(Long bookingId, BookingStatus status) {
    bookingRepository.updateStatus(bookingId, status);
    
    // Schedule cache evict after transaction commits
    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronizationAdapter() {
            @Override
            public void afterCommit() {
                cacheManager.getCache("available-rooms").clear();
            }
        }
    );
}
```

**4C: Testing cache invalidation**

Manual test:
```bash
# 1. Read rooms (cache primed)
curl http://localhost:8080/api/student/hostels/1/rooms | jq '.[] | select(.id==5)'
# Output: {"id":5, "available":true}

# 2. Apply for room 5
curl -X POST http://localhost:8080/api/student/bookings/apply \
  -H "Content-Type: application/json" \
  -d '{"roomId":5}'

# 3. Check Redis keys (should be reduced)
redis-cli DBSIZE
# Before: 50 keys
# After: 0 keys (all cleared)

# 4. Read rooms again (fresh from DB)
curl http://localhost:8080/api/student/hostels/1/rooms | jq '.[] | select(.id==5)'
# Output: {"id":5, "available":false}
```

---

## Issue 5: "High database load despite Redis"

### Symptoms
```
- Database still getting 300+ queries/sec
- Redis has 5000+ different cache keys
- Response times not improving
```

### Root Causes & Solutions

**5A: Too many different cache keys**

Each user+hostel combination creates unique key:
```
available-rooms:::1-1
available-rooms:::2-1
available-rooms:::3-1
... (thousands of combinations)
```

Check:
```bash
redis-cli KEYS "available-rooms*" | wc -l
# If > 1000: This is the problem
```

Solution: Implement cache warming:
```bash
# Manual warm (admin runs at 6:50 AM)
curl -X POST http://localhost:8080/api/admin/cache/warm/hostels

# Verify keys decreased
redis-cli KEYS "available-rooms*" | wc -l
# After warm: ~10 keys (per hostel)
```

**5B: Cache warming not running**

Check if scheduled warming is active:
```bash
grep "CACHE-WARMING" backend-logs.txt | tail -20
# Should see lines every hour (7 AM-10 PM)

# Example output:
# 2025-04-15 08:00:00 ⚡ CACHE-WARMING: Running scheduled cache warm
# 2025-04-15 09:00:00 ⚡ CACHE-WARMING: Running scheduled cache warm
```

If not seeing:
```bash
# Check logs for errors
grep "Error" backend-logs.txt | grep -i cache

# Force manual warm
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8080/api/admin/cache/warm/hostels/1/rooms
```

**5C: Database query still being logged despite cache**

Enable debug logging:
```yaml
# application.yml
logging:
  level:
    org.springframework.cache: DEBUG
    com.hostelmanagement.service: DEBUG
```

Restart and check logs:
```bash
grep "Cacheable" backend-logs.txt
# Output should show: "Cache hit" or "Cache miss"
```

If all "Cache miss": Caching not working properly!

---

## Issue 6: "Redis connection pool exhausted"

### Symptoms
```
Error: io.lettuce.core.RedisCommandExecutionException: 
Pool exhausted; cannot get a resource within 2 seconds
```

### Root Causes & Solutions

**6A: Too many concurrent connections**

Check connection pool:
```java
// In application.yml, add pool config
spring:
  data:
    redis:
      lettuce:
        pool:
          max-active: 20      # Default: 8
          max-idle: 10        # Default: 8
          min-idle: 5
```

Default pool (8) too small for 100+ concurrent requests!

Update and restart:
```yaml
spring:
  data:
    redis:
      lettuce:
        pool:
          max-active: 64      # For 100+ concurrent users
          max-idle: 32
          min-idle: 8
```

**6B: Connections not returned (leak)**

Check if connections being properly closed:
```bash
redis-cli
> INFO clients
connected_clients: 64 (all 64 connections active)
# If this number keeps growing: connection leak!

> CLIENT LIST
# Shows all open connections - check for ones with no activity
```

Fix: Use try-with-resources or Spring abstractions:
```java
// Bad: Connection might leak
Redis redis = redisConnectionFactory.getConnection();
redis.get("key");  // If exception thrown, never returned

// Good: Spring handles it
@Autowired
private RedisTemplate<String, Object> redisTemplate;

// Spring automatically manages connections
redisTemplate.opsForValue().get("key");
```

---

## Issue 7: "Cache working during dev, not in production"

### Symptoms
```
- Development: Cache working perfectly (99% hit rate)
- Production: Cache has 50% hit rate
- Different behavior
```

### Root Causes & Solutions

**7A: Different hostels/data in production**

Check cache key distribution:
```bash
redis-cli
> KEYS "available-rooms*"
# In dev: 10 keys per hostel
# In prod: 5000+ keys (many users, different filtering)
```

Solution: Implement cache warming in production:
```bash
# Before semester starts
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://production-api/api/admin/cache/warm/hostels
```

**7B: Redis memory limit lower than dev**

Check allocated memory:
```bash
# Production Redis
redis-cli
> INFO memory
used_memory_human: 200M
maxmemory: 256M  # Limit reached!

> CONFIG GET maxmemory-policy
"noeviction"  # Won't evict, just rejects new writes!
```

Fix: Increase Redis memory:
```bash
# Docker
docker run -d -p 6379:6379 \
  --memory 512m \
  redis:latest

# Or update existing
redis-cli
> CONFIG SET maxmemory 1gb
> CONFIG SET maxmemory-policy "allkeys-lru"
```

**7C: Different timing/load**

Check peak hours configuration:
```java
// CacheWarmingService.java
@Scheduled(cron = "0 0 7-22 * * *")  // 7 AM - 10 PM
public void warmAvailableRoomsScheduled() {
```

This might not match production timezone!

Fix:
```java
// Update timezone for production
@Scheduled(cron = "0 0 7-22 * * *", zone = "Asia/Kolkata")
// Or use fixed delay
@Scheduled(fixedDelay = 3600000)  // Every hour
```

---

## Emergency Troubleshooting

### If everything is broken

**Step 1: Disable caching immediately**
```bash
# Stop backend
systemctl stop hostel-backend

# Disable cache
export CACHE_TYPE=none

# Restart backend
systemctl start hostel-backend

# Verify it works
curl http://localhost:8080/api/student/hostels/1/rooms
# Should work even if slow
```

**Step 2: Restart Redis**
```bash
docker restart hostel-redis
# Or
sudo systemctl restart redis-server
```

**Step 3: Clear all caches**
```bash
redis-cli FLUSHALL
# Clears entire Redis instance
```

**Step 4: Re-enable caching**
```bash
export CACHE_TYPE=redis
systemctl restart hostel-backend
```

---

## Performance Debugging

### Slow requests despite Redis?

**Debug script:**
```bash
#!/bin/bash

echo "=== Debugging Slow Requests ==="

# 1. Check Redis connectivity
redis-cli ping
echo "✓ Redis ping OK"

# 2. Check cache hits
curl -s http://localhost:8080/api/student/hostels/1/rooms > /dev/null
echo "✓ API responds"

# 3. Measure time
time curl -s http://localhost:8080/api/student/hostels/1/rooms > /dev/null
# Should be < 50ms

# 4. Check Redis keys
redis-cli DBSIZE
# Should have keys

# 5. Check memory
redis-cli INFO memory | grep used_memory_human

# 6. Check database
mysql -u admin -p -e "SELECT COUNT(*) FROM rooms WHERE available=true;"
```

### Using Redis terminal interactively

```bash
redis-cli

# List all keys
> KEYS "*"

# Show specific key
> GET "available-rooms:::1-123"

# Check expiration
> TTL "available-rooms:::1-123"

# Monitor real-time operations
> MONITOR

# Get stats
> INFO
> INFO memory
> INFO stats
> INFO replication

# Exit
> QUIT
```

---

## Getting Help

**When reporting issues:**

1. Collect logs:
   ```bash
   journalctl -u hostel-backend -n 100 > backend-logs.txt
   redis-cli INFO > redis-info.txt
   ```

2. Run diagnostics:
   ```bash
   redis-cli ping
   curl http://localhost:8080/api/admin/cache/health
   ```

3. Share output with team

**Contact:** Backend Team / DevOps

---

**Version:** 1.0
**Last Updated:** 2025-04-15
**Document Status:** Production Ready
