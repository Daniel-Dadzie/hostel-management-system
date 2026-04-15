# Redis Caching - Quick Reference Card

## 🚀 Print This & Keep It Handy During Peak Season

---

## Essential Commands

### Check System Health
```bash
# Is Redis running?
redis-cli ping
# Output: PONG ✓

# Cache statistics
curl -H "Auth: Bearer $TOKEN" \
  localhost:8080/api/admin/cache/statistics

# Cache health
curl -H "Auth: Bearer $TOKEN" \
  localhost:8080/api/admin/cache/health
```

### Manual Cache Operations
```bash
# Warm hostels (before prime time)
curl -X POST -H "Auth: Bearer $TOKEN" \
  localhost:8080/api/admin/cache/warm/hostels

# Warm specific hostel rooms
curl -X POST -H "Auth: Bearer $TOKEN" \
  localhost:8080/api/admin/cache/warm/hostels/5/rooms

# Refresh all caches (after DB changes)
curl -X POST -H "Auth: Bearer $TOKEN" \
  localhost:8080/api/admin/cache/refresh/rooms

# Emergency wipe (use carefully!)
curl -X POST -H "Auth: Bearer $TOKEN" \
  localhost:8080/api/admin/cache/clear-all
```

---

## Redis Direct Commands

### Monitoring
```bash
redis-cli
> DBSIZE                    # Total cache entries
> KEYS "available-rooms*"   # List room cache keys
> MEMORY USAGE "key_name"   # Size of specific entry
> MONITOR                   # Watch operations in real-time
> INFO memory               # Memory stats
```

### Troubleshooting
```bash
redis-cli
> GET "available-rooms:::1-123"    # View cached data
> TTL "available-rooms:::1-123"    # Check expiration
> FLUSHALL                         # ⚠️ Clear entire cache!
```

---

## Performance Expectations

| Scenario | Response Time | Cache Hit Rate | Status |
|----------|---------------|----------------|--------|
| Normal (day) | < 10ms | > 95% | ✅ Good |
| Peak (7-9 AM) | < 5ms | > 99% | ✅ Excellent |
| Hot spot (10-4 PM) | < 3ms | > 99.5% | ✅ Optimal |
| Cache down | 50-100ms | N/A | ⚠️ Accept slowdown |

---

## Diagnosis Flow

### "Students complaining slow"

1. **Check cache health:**
   ```bash
   curl localhost:8080/api/admin/cache/health
   # Status: UP or DOWN?
   ```

2. **If DOWN:** Start Redis
   ```bash
   docker restart hostel-redis
   # or systemctl start redis-server
   ```

3. **If UP but slow:** Warm cache
   ```bash
   curl -X POST -H "Auth: Bearer $TOKEN" \
     localhost:8080/api/admin/cache/warm/hostels
   ```

4. **Still slow?** Check DB
   ```bash
   # Database might be bottleneck, not cache
   mysql> SHOW PROCESSLIST;
   # Look for long-running queries
   ```

---

## Emergency Situations

### 🔥 "Cache broken, room availability wrong"

**Option 1: Quick fix (60 sec)**
```bash
# Refresh cache immediately
curl -X POST -H "Auth: Bearer $TOKEN" \
  localhost:8080/api/admin/cache/refresh/rooms
```

**Option 2: Nuclear option (5 min)**
```bash
# Clear cache, restart backend
redis-cli FLUSHALL
systemctl restart hostel-backend
# Backend will warm cache on startup
```

### 🔥 "Redis out of memory"

**Check:**
```bash
redis-cli
> INFO memory
# used_memory_human: ??M / maxmemory: ??M
```

**Fix:**
```bash
# Restart Redis (clears memory)
docker restart hostel-redis

# Or increase limit
redis-cli CONFIG SET maxmemory 1gb
```

### 🔥 "Redis connection pool exhausted"

**Symptom:** "Pool exhausted" errors

**Fix:**
```bash
# Update pool config in application.yml:
#   max-active: 64 (from 8)
# Then restart backend

systemctl restart hostel-backend
```

---

## Monitoring Checklist (Next to your desk)

**Before 7 AM - Semester Start:**
- [ ] Redis running (`redis-cli ping`)
- [ ] Backend started successfully
- [ ] Cache health: UP (`/api/admin/cache/health`)
- [ ] Cache stats reasonable (`/api/admin/cache/statistics`)
- [ ] Warm cache for peak (`/api/admin/cache/warm/hostels`)

**During Peak Hours (7 AM - 6 PM):**
- [ ] Every hour: Check `redis-cli DBSIZE` (should be < 5000)
- [ ] Monitor: `redis-cli INFO memory` (should be < 100MB)
- [ ] Every 2 hours: Check hit rate (should be > 99%)

**If Issue Detected:**
- [ ] Run health check: `curl localhost:8080/api/admin/cache/health`
- [ ] Check logs: `tail -f backend-logs.txt | grep -i cache`
- [ ] Warm cache: `curl -X POST localhost:8080/api/admin/cache/warm/hostels`

**After Peak (6 PM):**
- [ ] Verify students got through (check booking counts)
- [ ] Review cache statistics
- [ ] Check for any errors in logs

---

## Important URLs (Bookmark These!)

| Purpose | URL |
|---------|-----|
| Cache Health | `localhost:8080/api/admin/cache/health` |
| Cache Stats | `localhost:8080/api/admin/cache/statistics` |
| Warm Cache | `POST localhost:8080/api/admin/cache/warm/hostels` |
| Redis CLI | `redis-cli` (commandline) |
| Backend Logs | `/var/log/hostel-backend/app.log` |
| Redis Logs | `docker logs hostel-redis` |

---

## Team Contact Info

**Backend Team Lead:** [Phone/Email]
**DevOps Engineer:** [Phone/Email]  
**Database Admin:** [Phone/Email]

---

## Quick Decision Tree

```
Student reports slow response
    ↓
Check cache health: curl localhost:8080/api/admin/cache/health
    ↓
    ├─ Status: DOWN → Restart Redis (docker restart hostel-redis)
    │
    ├─ Status: UP, Hit Rate < 95%
    │   → Warm cache (POST .../cache/warm/hostels)
    │
    ├─ Status: UP, Hit Rate > 99%, Still slow?
    │   → Check database performance
    │   → Check network latency
    │
    └─ Still broken after all above
        → Call Backend Lead
        → Disable cache: CACHE_TYPE=none
```

---

**Last Updated:** 2025-04-15
**Version:** 1.0
**Print & Laminate!**
