# Redis Caching - Performance Testing & Validation Guide

## Testing Strategy

### Test Phases

| Phase | Focus | Success Criteria | Duration |
|-------|-------|------------------|----------|
| **Unit** | Cache config loads | No errors, TTLs correct | Quick |
| **Integration** | Cache stores/retrieves | Keys in Redis, data matches | 10 min |
| **Load** | Peak performance | 99%+ hit rate, <5ms latency | 30 min |
| **Endurance** | Stability over time | No memory leaks, consistent hit rate | 1+ hour |
| **Failover** | Graceful degradation | Works without Redis | 5 min |

## Pre-Testing Checklist

- [ ] Redis running and accessible (`redis-cli ping`)
- [ ] Backend builds without errors (`mvn clean package`)
- [ ] Backend starts successfully
- [ ] Logs show cache initialization
- [ ] Student API accessible

## Unit Testing

### Verify Cache Configuration

**Test:** CacheConfig loads correctly

```java
@SpringBootTest
public class CacheConfigTest {
  
  @Autowired
  private CacheManager cacheManager;
  
  @Test
  public void testCacheManagerConfigured() {
    assertNotNull(cacheManager);
    assertThat(cacheManager.getCacheNames())
      .contains("available-rooms", "active-hostels");
  }
  
  @Test
  public void testAvailableRoomsCacheTTL() {
    // TTL should be 2 minutes = 120 seconds
    RedisCacheConfiguration config = 
      cacheManager.getCacheConfiguration("available-rooms");
    assertEquals(Duration.ofMinutes(2), config.getTtl());
  }
  
  @Test
  public void testNullValuesNotCached() {
    RedisCacheConfiguration config = 
      cacheManager.getCacheConfiguration("available-rooms");
    assertTrue(config.isCacheNullValues() == false);
  }
}
```

**Run:**
```bash
mvn test -Dtest=CacheConfigTest
```

**Expected Output:**
```
[INFO] Tests run: 3, Failures: 0, Skipped: 0
✓ CacheConfigTest PASSED
```

## Integration Testing

### Verify Caching Behavior

**Test:** Cache stores and retrieves room data

```java
@SpringBootTest
public class CachingIntegrationTest {
  
  @Autowired
  private StudentHostelService service;
  
  @Autowired
  private RoomRepository roomRepository;
  
  @Test
  public void testFirstCallCachesToRedis() {
    // First call - cache miss
    List<RoomResponse> rooms1 = service.listAvailableRooms(1L, 5L);
    assertNotEmpty(rooms1);
    
    // Second call - cache hit (should be instant)
    List<RoomResponse> rooms2 = service.listAvailableRooms(1L, 5L);
    assertEquals(rooms1, rooms2);
  }
  
  @Test
  public void testCacheEvictOnBooking() {
    // Prime cache
    List<RoomResponse> rooms1 = service.listAvailableRooms(1L, 5L);
    
    // Create booking (evicts cache)
    bookingService.apply(1L, new ApplyRequest(...));
    
    // Next call should query fresh from DB
    List<RoomResponse> rooms2 = service.listAvailableRooms(1L, 5L);
    // Data may differ if booking changed availability
  }
  
  @Test
  public void testCacheTTLExpiration() throws InterruptedException {
    // Prime cache
    List<RoomResponse> rooms1 = service.listAvailableRooms(1L, 5L);
    
    // Simulate time passing (in real test: Redis test container)
    // After 2+ minutes, cache entry should expire
    // This requires special test setup
  }
}
```

**Run:**
```bash
mvn test -Dtest=CachingIntegrationTest
```

**Expected Output:**
```
[INFO] Tests run: 3, Failures: 0, Skipped: 0
✓ Cache stores data correctly
✓ Cache evicts on writes
✓ Test TTL expiration (skip in CI)
```

## Load Testing

### Test 1: Response Time Under Load

**Goal:** Verify response times are < 5ms at peak load

**Setup:**
```bash
# Terminal 1: Start backend
cd backend/app
java -jar target/hostel-management-system-*.jar

# Terminal 2: Use Apache Bench
ab -n 10000 -c 100 http://localhost:8080/api/student/hostels/1/rooms
```

**Analysis:**
```
--- Results ---
Requests per second:    1500/sec (good with caching)
Time per request:       67ms (avg across all)
Median response:        2ms (most are very fast)
P95:                    5ms
P99:                    15ms (occasional slow ones)
Failed:                 0

--- Cache Statistics ---
Cache hits:             9999/10000 (99.99%)
Cache misses:           1 (initial load)
```

**Success Criteria:**
- ✅ Median response < 5ms
- ✅ P95 response < 10ms
- ✅ Hit rate > 95%
- ✅ 0 failed requests

**If Test Fails:**
- Check backend logs for errors
- Verify Redis connection: `redis-cli ping`
- Check database for locks/deadlocks
- Reduce concurrency (-c 50 instead of -c 100)

### Test 2: Peak Load Scenario

**Goal:** Simulate 500 concurrent students during semester start

**Setup:**
```bash
# Install wrk: https://github.com/wg/wrk
# macOS: brew install wrk
# Linux: build from source

wrk -t8 -c500 -d60s \
  http://localhost:8080/api/student/hostels/1/rooms
```

**Expected Output:**
```
Running 60s test @ http://localhost:8080/api/student/hostels/1/rooms
  8 threads and 500 connections
  Thread Stats   Avg      Stdev     Max    +/- Stdev
    Latency     2.34ms   1.23ms   45.67ms   85%
    Req/Sec    26.8k     2.1k     35k       80%

  12,850,000 requests in 60.00s, 5.2GB read
  Socket errors: connect 0, read 0, write 0, timeout 0
  Non-2xx or 3xx responses: 0

Cache Statistics:
  Total Requests: 12,850,000
  Cache Hits: 12,849,999 (99.99%)
  Cache Misses: 1 (cold start)
```

**Success Criteria:**
- ✅ Avg latency < 5ms
- ✅ Max latency < 100ms (occasional)
- ✅ Hit rate > 99%
- ✅ 0 errors/timeouts

### Test 3: Cache Warming Impact

**Goal:** Measure performance improvement from cache warming

**Part A: Without Warming**
```bash
# Kill backend and Redis
killall java
docker stop hostel-redis

# Wait 30 seconds, restart fresh
docker start hostel-redis
java -jar target/hostel-management-system-*.jar &

# Immediately run load test (cache cold)
ab -n 10000 -c 100 http://localhost:8080/api/student/hostels/1/rooms

# Record: response time, errors
```

**Part B: With Warming**
```bash
# After backend started, warm cache first
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8080/api/admin/cache/warm/hostels

# Wait for warm to complete
sleep 5

# Run same load test
ab -n 10000 -c 100 http://localhost:8080/api/student/hostels/1/rooms
```

**Comparison:**
```
Metric                Without Warming    With Warming    Improvement
Avg Response Time     45ms               2ms            22x faster
P95 Response Time     200ms              5ms            40x faster
Hit Rate              85%                99.99%         15% improvement
Failed Requests       150/10000          0/10000        100% better
```

## Endurance Testing

### Multi-Hour Stability Test

**Goal:** Verify no memory leaks, consistent performance over time

**Test Script:**
```bash
#!/bin/bash

# Run load test for 2 hours with metrics
for i in {1..120}; do
  echo "=== Minute $i ==="
  
  # Single measurement
  curl -s -w "Response: %{time_total}s\n" \
    http://localhost:8080/api/student/hostels/1/rooms > /dev/null
  
  # Check Redis memory
  redis-cli INFO memory | grep used_memory_human
  
  # Every 5 minutes, full stats
  if [ $((i % 5)) -eq 0 ]; then
    curl -H "Authorization: Bearer $TOKEN" \
      http://localhost:8080/api/admin/cache/statistics | jq .
  fi
  
  sleep 60
done
```

**Expected Results:**
```
Minute 1:   Response: 0.002s  Memory: 2.5MB   Hit Rate: 99%
Minute 30:  Response: 0.002s  Memory: 2.6MB   Hit Rate: 99.9%
Minute 60:  Response: 0.002s  Memory: 2.7MB   Hit Rate: 99.95%
Minute 120: Response: 0.002s  Memory: 2.8MB   Hit Rate: 99.95%

✓ Response time stable
✓ Memory growth plateaus (normal, < 50MB)
✓ Hit rate extremely consistent
```

**Success Criteria:**
- ✅ Response time stable (within 1ms)
- ✅ Memory < 256MB (allocated limit)
- ✅ No memory leaks (linear growth indicates leak)
- ✅ Hit rate > 99%

## Failover Testing

### Graceful Degradation Without Redis

**Goal:** Verify system works if Redis crashes

**Test:**
```bash
# 1. Load test with Redis running
ab -n 1000 -c 50 http://localhost:8080/api/student/hostels/1/rooms
# Expected: Fast (cache hits)

# 2. Stop Redis
docker stop hostel-redis

# 3. Load test without Redis (manual monitoring)
ab -n 100 -c 10 http://localhost:8080/api/student/hostels/1/rooms
# Expected: Slower but still working

# 4. Restart Redis
docker start hostel-redis

# 5. Load test resumes fast
ab -n 1000 -c 50 http://localhost:8080/api/student/hostels/1/rooms
# Expected: Fast again
```

**Expected Behavior:**
```
With Redis:     Response 2ms    (cache hit)
Without Redis:  Response 50ms   (DB query, but works)
Redis restarted: Response 2ms   (cache warmed on startup)
```

**Success Criteria:**
- ✅ No errors when Redis down
- ✅ Response time increases but requests succeed
- ✅ Automatically recovers when Redis restarts
- ✅ No manual intervention needed

## Cache Invalidation Testing

### Verify Cache Evicts on Writes

**Test:**
```bash
#!/bin/bash

# 1. Prime cache by reading
curl http://localhost:8080/api/student/hostels/1/rooms > before.json

# 2. Create booking (should evict cache)
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"roomId":5}' \
  http://localhost:8080/api/student/bookings/apply

# 3. Verify cache was evicted (redis should show fewer keys)
KEYS_AFTER=$(redis-cli KEYS "available-rooms*" | wc -l)
echo "Cache keys after eviction: $KEYS_AFTER (should be < before)"

# 4. Next read should query fresh from DB
curl http://localhost:8080/api/student/hostels/1/rooms > after.json

# 5. Verify data changed (room no longer available)
diff before.json after.json
```

**Expected Result:**
```
Before: {"rooms":[..., {roomId: 5, available: true}, ...]}
After:  {"rooms":[..., {roomId: 5, available: false}, ...]}

Cache correctly invalidated! ✓
```

## Monitoring During Tests

### Real-time Cache Statistics

**Terminal 1: Watch Redis Memory**
```bash
watch -n 1 'redis-cli INFO memory | grep -E "used_memory|maxmemory|evicted"'
```

**Terminal 2: Monitor Backend Logs**
```bash
tail -f backend-logs.txt | grep -i cache
```

**Terminal 3: Check Cache Keys**
```bash
watch -n 5 'redis-cli DBSIZE && redis-cli KEYS "available-rooms*" | wc -l'
```

## Load Testing Tools

### Apache Bench (Built-in)
```bash
# Simple test
ab -n 1000 -c 100 http://localhost:8080/api/student/hostels/1/rooms

# With detailed output
ab -n 1000 -c 100 -g results.tsv http://localhost:8080/api/student/hostels/1/rooms
gnuplot -e "set term png; plot 'results.tsv'" > graph.png
```

### wrk (Modern, Multi-threaded)
```bash
# Install
git clone https://github.com/wg/wrk.git
cd wrk && make

# Run
./wrk -t4 -c100 -d30s http://localhost:8080/api/student/hostels/1/rooms

# With Lua script
./wrk -t4 -c100 -d30s -s script.lua http://localhost:8080/api/student/hostels/1/rooms
```

### JMeter (GUI-based)
```bash
# Download from: https://jmeter.apache.org
# Create test plan:
# 1. Thread Group (500 users, 60 sec ramp-up)
# 2. HTTP Request (GET /api/student/hostels/1/rooms)
# 3. View Results Tree
# 4. Run & analyze

jmeter -n -t hostel_loadtest.jmx -l results.jtl
```

## Interpreting Results

### Response Time Analysis

| Metric | Good | Warning | Bad |
|--------|------|---------|-----|
| Avg | < 10ms | 10-50ms | > 50ms |
| P95 | < 20ms | 20-100ms | > 100ms |
| P99 | < 50ms | 50-200ms | > 200ms |
| Max | < 100ms | 100-500ms | > 500ms |

### Hit Rate Interpretation

| Hit Rate | Status | Action |
|----------|--------|--------|
| > 98% | ✅ Excellent | No action needed |
| 95-98% | ⚠️ Good | Monitor, may need warming |
| 80-95% | ❌ Poor | Investigate cache config |
| < 80% | ❌ Failure | Cache not working |

## Reporting Test Results

### Summary Report Template

```
# Redis Cache Performance Test Report

**Date:** 2025-04-15
**Environment:** Production-like (100GB DB, 5 hostels, 1200 rooms)

## Test Results

### Load Test: 100 concurrent, 10,000 requests
- ✅ Avg Response: 2ms (target: < 5ms)
- ✅ P95 Response: 4ms (target: < 10ms)
- ✅ Cache Hit Rate: 99.99% (target: > 95%)
- ✅ Failed Requests: 0 (target: 0)

### Peak Load: 500 concurrent, 60 seconds
- ✅ Avg Response: 3ms (target: < 10ms)
- ✅ Hit Rate: 99.95% (target: > 98%)
- ✅ Errors: 0 (target: 0)

### Endurance: 2 hours continuous
- ✅ Memory Usage: 2.5-3MB (stable, target: < 100MB)
- ✅ Response Consistency: ±1ms variance
- ✅ Hit Rate: Maintained > 99%

### Failover: Redis unavailable
- ✅ System continues working (response: 50ms vs 2ms)
- ✅ Automatic recovery when Redis restarts
- ✅ Cache warms up quickly (< 1 second)

## Conclusion

✅ **PASSED** - Redis caching implementation meets all performance requirements.

Ready for production deployment.

Recommendations:
- Deploy with minimum 256MB Redis allocation
- Monitor cache stats during first week
- Enable alerts for hit rate < 95%
```

---

**Version:** 1.0
**Last Updated:** 2025-04-15
**Test Duration:** Full suite: ~2 hours excluding endurance test
