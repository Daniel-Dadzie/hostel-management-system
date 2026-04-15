# Redis Caching - Pre-Season Deployment Checklist

## ⚠️ CRITICAL: Complete Before Semester Starts

---

## 1. Infrastructure Setup (2-3 days before)

### 1.1 Redis Installation & Configuration

**Development/Testing:**
- [ ] Install Redis
  - [ ] Docker: `docker run -d -p 6379:6379 redis:latest`
  - [ ] Or native installation via package manager
- [ ] Verify accessible: `redis-cli ping` → PONG ✓
- [ ] Check memory: `redis-cli INFO memory`
- [ ] Set memory limit: 256MB minimum
- [ ] Configure maxmemory policy: `allkeys-lru`

**Production:**
- [ ] Provision Redis (managed service or VM)
  - [ ] Option A: Azure Cache for Redis (recommended)
  - [ ] Option B: Self-hosted Docker
  - [ ] Option C: Kubernetes StatefulSet
- [ ] Configure firewall rules
  - [ ] Allow backend to reach Redis
  - [ ] Block external access (only internal)
- [ ] Set up persistent storage
  - [ ] Enable AOF (Append-Only File) for durability
  - [ ] Configure backups (`BGSAVE` daily)
  - [ ] Test disaster recovery
- [ ] Monitor:
  - [ ] Prometheus exporter for metrics
  - [ ] AlertManager for alerts
  - [ ] Dashboard in Grafana
- [ ] Document:
  - [ ] Redis host/port/password
  - [ ] Memory allocated
  - [ ] Backup location
  - [ ] Health check procedure

### 1.2 Backend Configuration

- [ ] Update `application.yml`:
  ```yaml
  spring:
    data:
      redis:
        host: ${REDIS_HOST:localhost}
        port: ${REDIS_PORT:6379}
        password: ${REDIS_PASSWORD:}
    cache:
      type: ${CACHE_TYPE:redis}
  ```

- [ ] Update environment variables in deployment:
  ```bash
  REDIS_HOST=redis.production.internal
  REDIS_PORT=6379
  CACHE_TYPE=redis
  # Optional:
  REDIS_PASSWORD=<strong-password>
  ```

- [ ] Verify Spring dependencies in `pom.xml`:
  ```xml
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
  </dependency>
  ```

---

## 2. Code Validation (1 week before)

### 2.1 Review Cache Implementation

- [ ] Verify `CacheConfig.java` exists
  - [ ] @EnableCaching present
  - [ ] TTLs configured (available-rooms: 2 min, active-hostels: 10 min)
  - [ ] Serialization: GenericJackson2JsonRedisSerializer

- [ ] Check `@Cacheable` annotations:
  ```bash
  grep -r "@Cacheable" backend/app/src/main/java
  ```
  - [ ] `StudentHostelService.listAvailableRooms()` – CRITICAL
  - [ ] Should have `key="#hostelId + '-' + #studentId"`

- [ ] Check `@CacheEvict` annotations:
  ```bash
  grep -r "@CacheEvict" backend/app/src/main/java
  ```
  - [ ] `BookingService.apply()` – CRITICAL
  - [ ] `BookingService.updateStatus()` – IMPORTANT
  - [ ] `BookingService.expirePendingPayments()` – IMPORTANT
  - [ ] All should clear "available-rooms" cache

- [ ] Verify `CacheWarmingService.java`:
  ```bash
  grep -r "CacheWarmingService" backend/app/src/main/java
  ```
  - [ ] Scheduled warming (7 AM - 10 PM hourly)
  - [ ] Methods: `warmActiveHostelsOnStartup()`, `warmRoomsForHostel()`

- [ ] Check `AdminCacheController.java`:
  - [ ] GET `/api/admin/cache/statistics` – Statistics
  - [ ] GET `/api/admin/cache/health` – Health check
  - [ ] POST `/api/admin/cache/warm/hostels` – Warm all
  - [ ] POST `/api/admin/cache/warm/hostels/{id}/rooms` – Warm hostel
  - [ ] POST `/api/admin/cache/refresh/rooms` – Full refresh

### 2.2 Test Cache Annotations

```bash
# 1. Build project
cd backend/app
mvn clean package -DskipTests

# 2. Check for compilation errors related to cache
grep -i "error" mvn-build.log | head -20

# 3. Verify no warnings about serialization
grep -i "serialization\|warning" mvn-build.log | grep -i cache
```

---

## 3. Testing (3-5 days before)

### 3.1 Unit Tests

```bash
# Run cache-related tests
mvn test -Dtest=CacheConfig* -DskipIntegration
mvn test -Dtest=*Cache*Test

# Check results
# ✓ CacheConfigTest PASSED
# ✓ CachingIntegrationTest PASSED
```

Success criteria:
- [ ] All cache tests pass
- [ ] No serialization errors
- [ ] No connection timeouts

### 3.2 Integration Tests

```bash
# Start Redis
docker run -d -p 6379:6379 redis:latest

# Start backend
java -jar target/hostel-management-system-*.jar

# Test manually
curl http://localhost:8080/api/student/hostels/1/rooms
# Should work

# Check Redis
redis-cli KEYS "available-rooms*"
# Should have keys
```

Success criteria:
- [ ] API returns data
- [ ] Redis stores cache entries
- [ ] Cache has correct TTL

### 3.3 Load Testing

```bash
# Install Apache Bench
apt-get install apache2-utils

# Run load test
ab -n 1000 -c 100 http://localhost:8080/api/student/hostels/1/rooms

# Expected:
# Requests per second: > 100
# Failed requests: 0
# Response time avg: < 10ms
```

Success criteria:
- [ ] Response time < 10ms
- [ ] 0 failed requests
- [ ] High throughput (> 100 req/sec)

### 3.4 Failover Testing

```bash
# Test with Redis running
ab -n 100 -c 50 http://localhost:8080/api/student/hostels/1/rooms
# Expect: Fast (2-5ms)

# Stop Redis
docker stop hostel-redis

# Test without Redis
ab -n 50 -c 10 http://localhost:8080/api/student/hostels/1/rooms
# Expect: Slow (50-100ms) but working

# Restart Redis
docker start hostel-redis

# Test again
ab -n 100 -c 50 http://localhost:8080/api/student/hostels/1/rooms
# Expect: Fast again (2-5ms)
```

Success criteria:
- [ ] System works without Redis (graceful degradation)
- [ ] No errors or crashes
- [ ] Automatic recovery when Redis restarted

---

## 4. Production Deployment (Day before)

### 4.1 Pre-deployment Verification

- [ ] Backend built successfully:
  ```bash
  mvn clean package -DskipTests
  # Check WAR/JAR file size is reasonable (50-100MB)
  ```

- [ ] All environment variables documented:
  ```
  REDIS_HOST=prod-redis.internal
  REDIS_PORT=6379
  CACHE_TYPE=redis
  REDIS_PASSWORD=***secret***
  ```

- [ ] Database backup created:
  ```bash
  mysqldump hostel_db > backup-2025-04-15.sql
  ```

- [ ] Rollback plan documented:
  ```bash
  # If Redis breaks: set CACHE_TYPE=none
  # If cache causes data issues: disable via feature flag
  ```

### 4.2 Staged Rollout

**Stage 1: Pre-Production (2 days before)**
- [ ] Deploy to staging environment
- [ ] Run full test suite
- [ ] Verify cache statistics endpoint
- [ ] Monitor for 12+ hours
- [ ] Get sign-off from backend team

**Stage 2: Limited Production (1 day before)**
- [ ] Deploy to 1 server (if cluster)
- [ ] Monitor closely (every 15 min)
- [ ] Run load test from production IPs
- [ ] Verify database queries decrease significantly
- [ ] Get sign-off from DevOps

**Stage 3: Full Production (Start of semester)**
- [ ] Verify Redis running and healthy
- [ ] Deploy to all backend servers
- [ ] Warm cache before peak hours (6:50 AM)
- [ ] Monitor continuously during peak
- [ ] Be ready to rollback if needed

---

## 5. Monitoring Setup (Day of deployment)

### 5.1 Configure Alerts

Set up alerts for:
- [ ] Redis connection failures
  - Alert if: Cannot ping Redis
  - Action: Restart Redis, notify team
  
- [ ] Memory pressure
  - Alert if: Used memory > 80% capacity
  - Action: Check large keys, clear cache if needed

- [ ] Cache hit rate drop
  - Alert if: Cache hit rate < 90% for 5+ minutes
  - Action: Investigate, may need manual warm

- [ ] High database load
  - Alert if: Database queries > 500/sec
  - Action: Check if cache is working, warm if needed

- [ ] High latency
  - Alert if: API response > 100ms (average)
  - Action: Check database performance

### 5.2 Create Dashboard

Display these metrics in real-time:
- [ ] Cache hit rate (%)
- [ ] Cache hit/miss count
- [ ] Redis memory usage (MB)
- [ ] Database queries per second
- [ ] API response time (avg, p95, p99)
- [ ] Connected users

---

## 6. Operational Readiness (During peak season)

### 6.1 Daily Checks (Start of each day)

```bash
#!/bin/bash
echo "Daily Cache Health Check"

# 1. Redis reachable?
redis-cli ping || echo "ERROR: Redis not reachable!"

# 2. Backend running?
curl -s http://localhost:8080/api/admin/cache/health | jq .

# 3. Cache stats
curl -s -H "Auth: Bearer $TOKEN" \
  http://localhost:8080/api/admin/cache/statistics | jq .

# 4. Warm cache before peak (run at 6:50 AM)
curl -X POST -H "Auth: Bearer $TOKEN" \
  http://localhost:8080/api/admin/cache/warm/hostels
```

Success checklist:
- [ ] Redis: UP
- [ ] Cache health: UP  
- [ ] Cache statistics: Reasonable (< 10 hostels, > 99% hit rate expected)
- [ ] Cache warmed successfully before 7 AM

### 6.2 During Peak Hours (7 AM - 6 PM)

Monitor every 30 minutes:
- [ ] `redis-cli DBSIZE` – Total cache entries
- [ ] `redis-cli INFO memory` – Memory usage
- [ ] Cache hit rate from admin endpoint
- [ ] Database queries per second
- [ ] API response times

Action items:
- If memory > 80%: Check for cache key explosion, consider refresh
- If hit rate < 98%: Warm cache for specific hostel if needed
- If response time > 50ms: Check database for slow queries
- If errors appear: Check logs, restart services if needed

### 6.3 After Peak (6 PM)

- [ ] Review daily statistics
- [ ] Check error logs
- [ ] Verify all bookings processed successfully
- [ ] Document any issues encountered
- [ ] Plan next day adjustments

---

## 7. Escalation Procedures

### 7.1 Issue Severity Levels

| Level | Issue | Time to Fix | Escalate To |
|-------|-------|------------|------------|
| 🟢 Low | Cache hit rate 95-99% | Next business day | Backend team lead |
| 🟡 Medium | Cache hit rate dropping, slow response | < 1 hour | DevOps + Database |
| 🔴 High | Cache completely down, students can't book | < 15 min | All hands on deck |

### 7.2 Escalation Contacts

```
Tier 1 (First response): [On-call DevOps]
Tier 2 (If not resolved): [DevOps Team Lead]
Tier 3 (Critical): [CTO / Backend Lead]

Escalation time: 15 min between tiers
```

---

## 8. Documentation

### 8.1 Knowledge Base

- [ ] Setup guide: `REDIS_DEPLOYMENT_GUIDE.md`
- [ ] Testing guide: `REDIS_TESTING_GUIDE.md`
- [ ] Troubleshooting: `REDIS_TROUBLESHOOTING_GUIDE.md`
- [ ] Quick reference: `REDIS_QUICK_REFERENCE.md`
- [ ] Implementation guide: `REDIS_CACHING_GUIDE.md`

### 8.2 Runbook

Create runbook with:
- [ ] How to start Redis
- [ ] How to warm cache
- [ ] How to clear cache emergency
- [ ] How to disable caching
- [ ] How to monitor health
- [ ] Who to call for help

---

## 9. Sign-off

```
Component                Status    Owner              Date
─────────────────────────────────────────────────────────
Infrastructure Setup     ☐ READY  [DevOps Lead]      ____
Code Review             ☐ READY  [Backend Lead]     ____
Testing Complete        ☐ READY  [QA Lead]          ____
Pre-prod Validation     ☐ READY  [DevOps Lead]      ____
Monitoring Configured   ☐ READY  [DevOps Lead]      ____
Documentation Done      ☐ READY  [Tech Writer]      ____
Team Training           ☐ READY  [Backend Lead]     ____
─────────────────────────────────────────────────────────
READY FOR PRODUCTION    ☐ YES    [CTO/Lead]         ____
```

---

## 10. Post-Deployment Review

**Schedule:** 1 week after deployment

- [ ] Review actual vs. expected performance metrics
- [ ] Analyze error logs for patterns
- [ ] Gather team feedback
- [ ] Document lessons learned
- [ ] Plan optimizations for next semester

---

## Emergency Contact Tree

```
Problem: System Down / No Response
├─ Call: [On-call DevOps]
├─ Then: [Backend Lead]
└─ Escalate: [CTO]

Problem: Slow Response / High Latency
├─ Call: [DevOps Lead]
├─ Then: [Database Admin]
└─ Escalate: [Backend Lead]

Problem: Data Corruption / Wrong Data
├─ Call: [Backend Lead]
├─ Then: [Database Admin]
└─ Stop: All writes, restore from backup
```

---

**Deployment Checklist Status:** [  ] COMPLETE

**Approved by:** _________________ (CTO/Lead)

**Date:** _________________ 

**Expected Go-Live:** [Semester start date]

---

**Version:** 1.0
**Document Owner:** DevOps Team
**Last Updated:** 2025-04-15
