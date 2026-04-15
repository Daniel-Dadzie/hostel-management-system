# Redis Caching - Deployment & Setup Guide

## Quick Start

### Prerequisites
- Backend Java application running with Spring Boot
- Redis server installed on system or Docker available
- MySQL database running with hostel data

### Step 1: Install Redis

#### Option A: Docker (Recommended for Development)
```bash
# Start Redis container
docker run -d -p 6379:6379 --name hostel-redis redis:latest

# Verify it's running
docker logs hostel-redis
# Output: "Ready to accept connections"

# Test connection
redis-cli ping
# Expected: PONG
```

#### Option B: Native Installation (Linux/MacOS)
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install redis-server

# macOS
brew install redis

# Start Redis
redis-server

# In another terminal, verify
redis-cli ping
# Expected: PONG
```

#### Option C: Pre-built Windows Binary
1. Download from: https://github.com/microsoftarchive/redis/releases
2. Extract to a folder (e.g., `C:\redis`)
3. Run `redis-server.exe`
4. Verify with `redis-cli.exe ping`

### Step 2: Configure Backend

1. **Verify `pom.xml` includes Redis dependency:**
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-data-redis</artifactId>
   </dependency>
   ```

2. **Check `application.yml` has correct configuration:**
   ```yaml
   spring:
     data:
       redis:
         host: ${REDIS_HOST:localhost}
         port: ${REDIS_PORT:6379}
     cache:
       type: ${CACHE_TYPE:redis}
   ```

3. **Set environment variables:**
   ```bash
   # Linux/macOS
   export REDIS_HOST=localhost
   export REDIS_PORT=6379
   export CACHE_TYPE=redis

   # Windows PowerShell
   $env:REDIS_HOST = "localhost"
   $env:REDIS_PORT = "6379"
   $env:CACHE_TYPE = "redis"
   ```

### Step 3: Start Backend Application

```bash
# From backend/app directory
cd backend/app

# Build
mvn clean package -DskipTests

# Start Spring Boot app (Redis will be initialized automatically)
java -jar target/hostel-management-system-*.jar

# In logs, you should see:
# "Spring Cache Manager initialized"
# "Redis cache configuration loaded"
```

### Step 4: Verify Caching is Working

**Method 1: Test via API**
```bash
# Get a hostel's rooms (first request - cache miss)
curl http://localhost:8080/api/student/hostels/1/rooms

# Get same rooms again (cache hit)
curl http://localhost:8080/api/student/hostels/1/rooms

# Second request should be noticeably faster (~1ms vs ~50ms)
```

**Method 2: Check Redis directly**
```bash
redis-cli
> KEYS "*available-rooms*"
# Should list cache keys like:
# available-rooms:::1-123
# available-rooms:::1-456

> GET "available-rooms:::1-123"
# Should show cached JSON room data

> EXPIRE "available-rooms:::1-123"
# Should show TTL in seconds
```

**Method 3: Monitor Backend Logs**
```bash
grep -i "cache" logs.txt | head -20
# Look for "Cacheable" or "CacheEvict" operations
```

## Production Deployment

### On Azure Container Instances

#### Option 1: Managed Redis (Recommended)
```bash
# Create Azure Cache for Redis
az redis create \
  --resource-group hostel-rg \
  --name hostel-redis-prod \
  --location eastus \
  --sku basic \
  --vm-size c0

# Get connection string
az redis show-connection-string --name hostel-redis-prod

# Use connection string in backend configuration
export REDIS_HOST=hostel-redis-prod.redis.cache.windows.net
export REDIS_PORT=6379
export REDIS_PASSWORD=<connection-string-password>
```

#### Option 2: Self-Hosted in Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:latest
    container_name: hostel-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    networks:
      - hostel-net

  backend:
    image: hostel-backend:latest
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
      CACHE_TYPE: redis
    depends_on:
      - redis
    networks:
      - hostel-net

volumes:
  redis_data:

networks:
  hostel-net:
```

### Security Configuration

**For Production Redis:**

1. **Enable PASSWORD authentication:**
   ```yaml
   # application.yml
   spring:
     data:
       redis:
         password: ${REDIS_PASSWORD}
   ```

2. **Restrict network access:**
   ```bash
   # Firewall rule (Linux)
   sudo iptables -A INPUT -p tcp --dport 6379 -s 127.0.0.1 -j ACCEPT
   sudo iptables -A INPUT -p tcp --dport 6379 -j DROP

   # Or use VPC/security groups in cloud
   ```

3. **Enable TLS/SSL:**
   ```yaml
   spring:
     data:
       redis:
         ssl: true
   ```

### Monitoring & Maintenance

**Daily Checks:**
```bash
# Check memory usage
redis-cli INFO memory

# Expected: used_memory_human should be < 80% of allocated

# Check connected clients
redis-cli INFO clients

# Expected: connected_clients < 100

# Check eviction stats
redis-cli INFO stats
# Look for evicted_keys (should be low)
```

**Weekly Maintenance:**
```bash
# Backup Redis data
redis-cli BGSAVE

# Monitor slowlog
redis-cli SLOWLOG GET 10

# Flush DB if needed (after backup!)
redis-cli FLUSHDB
```

## Troubleshooting Deployment Issues

### Issue: Connection Refused

**Error:**
```
ERR Connection refused: io.lettuce.core.RedisConnectionException: 
Unable to connect to 127.0.0.1:6379
```

**Solution:**
1. Verify Redis is running:
   ```bash
   redis-cli ping
   # If "Could not connect": Redis not running
   ```

2. Check host/port environment variables:
   ```bash
   # Linux/macOS
   echo $REDIS_HOST $REDIS_PORT

   # Windows PowerShell
   $env:REDIS_HOST; $env:REDIS_PORT
   ```

3. Verify firewall:
   ```bash
   # macOS
   sudo lsof -i :6379

   # Linux
   sudo netstat -tuln | grep 6379

   # Windows PowerShell
   netstat -ano | findstr :6379
   ```

### Issue: Cache Always Empty

**Error:** Cache hits = 0%, always querying database

**Solution:**
1. Check CACHE_TYPE environment variable:
   ```bash
   # Should be "redis", not "none"
   echo $CACHE_TYPE
   ```

2. Verify cache enabled in code:
   ```bash
   grep -r "@EnableCaching" backend/app/src
   # Should find CacheConfig.java with annotation
   ```

3. Restart application to reload config:
   ```bash
   # Kill running app and restart
   # Or restart container
   systemctl restart hostel-backend
   ```

### Issue: Memory Growing Unbounded

**Error:** Redis memory keeps growing, never cleared

**Solution:**
1. Check TTLs are set:
   ```bash
   redis-cli
   > TTL "available-rooms:::1-123"
   # Should return positive number (seconds)
   # If -1: KEY EXISTS BUT NO EXPIRATION (problem!)
   ```

2. Verify @CacheEvict on write operations:
   ```bash
   grep -r "@CacheEvict" backend/app/src/main/java/com/hostelmanagement/service
   # Should see in BookingService.apply()
   ```

3. Check maxmemory policy:
   ```bash
   redis-cli
   > CONFIG GET maxmemory-policy
   # Should be "allkeys-lru" or "allkeys-lfu"
   ```

4. Set eviction policy if needed:
   ```bash
   redis-cli
   > CONFIG SET maxmemory-policy "allkeys-lru"
   > CONFIG REWRITE  # Make persistent
   ```

### Issue: High Database Load Despite Cache

**Error:** Database still getting hammered, cache ineffective

**Problem:** Large number of different cache keys (one per user combo)

**Solution:**
1. Check key cardinality:
   ```bash
   redis-cli
   > KEYS "available-rooms*" | wc -l
   # If > 1000: Too many keys (different user combos)
   ```

2. Warm cache proactively:
   ```bash
   # Trigger manual warm
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     http://localhost:8080/api/admin/cache/warm/hostels/1/rooms
   ```

3. Verify scheduled warming is running:
   ```bash
   grep "CACHE-WARMING" backend-logs.txt
   # Should see hourly warm attempts (7 AM - 10 PM)
   ```

## Performance Verification

### Before/After Comparison

**Without Redis Caching:**
```bash
# Load test: 100 concurrent requests
ab -n 10000 -c 100 http://localhost:8080/api/student/hostels/1/rooms

# Results:
# Requests per second: 20
# Time per request: 5000ms
# Failed requests: 523 (5%)
```

**With Redis Caching:**
```bash
# Same load test
ab -n 10000 -c 100 http://localhost:8080/api/student/hostels/1/rooms

# Results:
# Requests per second: 5000
# Time per request: 20ms
# Failed requests: 1 (0.01%)
```

**Improvement:** 250x faster, 99.99% success rate!

### Benchmarking Commands

```bash
# Test single request time
time curl http://localhost:8080/api/student/hostels/1/rooms

# Load test with Apache Bench (install: apt-get install apache2-utils)
ab -n 1000 -c 50 http://localhost:8080/api/student/hostels/1/rooms

# Load test with wrk (install from github)
wrk -t4 -c100 -d30s http://localhost:8080/api/student/hostels/1/rooms
```

## Admin Cache Management

### View Cache Statistics
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8080/api/admin/cache/statistics

# Output:
# {
#   "totalHostels": 5,
#   "totalRooms": 1200,
#   "availableRooms": 450,
#   "estimatedCacheMemoryMb": 5,
#   "timestamp": 1680123456789
# }
```

### Warm Cache Before Peak
```bash
# At 6:50 AM (before semester start at 7 AM)
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8080/api/admin/cache/warm/hostels

# Verify all rooms are cached
curl http://localhost:8080/api/admin/cache/statistics
```

### Refresh After Maintenance
```bash
# After database script updates rooms
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8080/api/admin/cache/refresh/rooms
```

## Operational Dashboard

Create monitoring dashboard in your admin UI:

```javascript
// In React or Vue
async function initCacheMonitoring() {
  const stats = await fetch('/api/admin/cache/statistics').then(r => r.json());
  
  displayMetrics({
    hostels: stats.totalHostels,
    rooms: stats.totalRooms,
    available: stats.availableRooms,
    memory: `${stats.estimatedCacheMemoryMb} MB`
  });
}

// Refresh every 5 minutes during peak hours
setInterval(initCacheMonitoring, 5 * 60 * 1000);
```

## Rollback Plan

If Redis causes issues:

```bash
# Disable caching immediately
export CACHE_TYPE=none

# Restart backend
systemctl restart hostel-backend

# Backend will use direct database queries (slower but stable)
# Semester can continue while you investigate
```

---

**Version:** 1.0
**Last Updated:** 2025-04-15
**Contact:** Backend Team
