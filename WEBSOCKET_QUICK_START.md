# WebSocket Real-Time Notifications - Quick Setup

## 📋 Prerequisites

- Backend built: `backend/app/target/backendapp-0.0.1-SNAPSHOT.jar`
- Frontend dependencies installed: `npm install` in frontend folder
- Backend running on `localhost:8080`
- Frontend running on `localhost:5173`

## 🚀 Quick Start (5 minutes)

### Step 1: Backend Build
```bash
cd backend/app
mvnw clean package -Dmaven.test.skip=true
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: 45s
```

### Step 2: Start Backend
```bash
cd backend/app
java -jar target/backendapp-0.0.1-SNAPSHOT.jar
```

**Expected Output:**
```
Starting backendapp
Tomcat started on port(s): 8080 (http) with context path ''
WebSocket support enabled
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
```

**Expected Output:**
```
added X packages
```

### Step 4: Start Frontend
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## ✅ Real-Time Notification Test (2 minutes)

### Test Setup
- **Browser 1 (Student):** http://localhost:5173 - Login as student
- **Browser 2 (Admin):** http://localhost:5173 - Login as admin (or same browser, different window)

### Step-by-Step Test

**1. Student Side - Get Ready**
```
1. Open Browser 1
2. Navigate to http://localhost:5173
3. Login as a student
4. Open DevTools (F12) → Console tab
5. You should see: "[Notification] WebSocket connected - subscribing to notifications"
```

**2. Admin Side - Approve a Payment**
```
1. Open Browser 2 (or new tab)
2. Login as admin
3. Go to Admin Dashboard → Bookings & Payments tab
4. Find a booking with "PENDING_PAYMENT" status
5. Click "Approve" button
6. Status should change to "APPROVED"
```

**3. Check Student Side**
```
1. Look at Browser 1
2. You should see:
   ✅ Green toast notification: "Payment Approved - Your room allocation is confirmed!"
   ✅ Console shows: "[Notification] Received: {type: 'PAYMENT_APPROVED', ...}"
```

---

## 🔍 Verification Checklist

### Backend Console Logs

Look for these messages indicating successful setup:

```
✅ [WebSocket] Starting WebSocket message broker configuration
✅ [STOMP] WebSocket endpoint registered at /ws-notifications
✅ [NOTIFICATION-WS] Sent payment-approval to student XXX
```

### Frontend Console Logs

In browser DevTools (F12 → Console), you should see:

```
✅ [WebSocket] Connected to STOMP server
✅ [WebSocket] Subscribed to /user/queue/notifications
✅ [Notification] Received: {...}
```

### Network Tab (F12 → Network)

1. Filter by "WS" (WebSocket)
2. Should see connection to:
   ```
   ws://localhost:5173/ws-notifications
   ```
3. Status should be "101 Web Socket Protocol Handshake"

---

## 🧪 Detailed Test Scenarios

### Scenario 1: Single Notification
**Expected:** Student receives one toast

```
Admin: Approve 1 payment → Student: Sees 1 green toast
```

### Scenario 2: Multiple Notifications
**Expected:** Each notification gets its own toast

```
Admin: Approve 3 payments quickly → Student: Sees 3 toasts (stacked)
```

### Scenario 3: Automatic Reconnection
**Expected:** Notification received after reconnect

```
1. Student in app (WebSocket connected)
2. Browser DevTools → Network → Find ws connection
3. Right-click → "Block URL"
4. Admin approves payment (student doesn't get it - blocked)
5. DevTools → Right-click URL → "Unblock"
6. Admin approves another payment
7. ✅ Student receives notification (reconnected automatically)
```

### Scenario 4: Browser Inactive
**Expected:** Notification still sent (background delivery)

```
1. Student app open in background tab
2. Admin approves payment
3. Switch to student tab
4. ✅ Toast may have already appeared (check if still visible)
5. Console shows message was received
```

### Scenario 5: Connection Loss & Recovery
**Expected:** Notification after network restored

```
1. Student in app
2. Turn off WiFi (simulate network loss)
3. Wait 3 seconds
4. Admin approves payment (won't be sent yet - offline)
5. Turn WiFi back on
6. ✅ WebSocket reconnects (visible in console)
7. ✅ Student may receive notification if it's within retry window
```

---

## 🐛 Troubleshooting

### Issue: "WebSocket connection failed"

**Fix 1:** Verify backend is running
```bash
# Check if port 8080 is listening
# Windows:
netstat -ano | findstr :8080

# Mac/Linux:
lsof -i :8080
```

**Fix 2:** Check CORS settings in WebSocketConfig.java
```java
.setAllowedOriginPatterns("*")  // Should allow all for dev
```

**Fix 3:** Check browser console for errors
```
Look for: "[WebSocket] Connection error"
```

---

### Issue: "Toast not appearing"

**Fix 1:** Check if react-hot-toast is installed
```bash
npm list react-hot-toast
# Should show version 2.6.0
```

**Fix 2:** Verify NotificationProvider wraps App
```bash
# Check App.jsx line 1-5
# Should have <NotificationProvider> wrapping <AuthProvider>
```

**Fix 3:** Check if notification message is malformed
```
Look for: "[WebSocket] Error parsing message" in console
Check backend logs for JSON errors
```

---

### Issue: "Notifications delayed (not instant)"

**Possible causes:**
- Browser tab in background (not a real issue - notification sent)
- Network latency
- Too many other notifications queued

**Check:**
```
Network tab → WebSocket → Look at message timestamps
Should be < 100ms between send and receive
```

---

## 📊 Performance Testing

### Test Load: 5 Simultaneous Updates

```bash
# In admin console, approve 5 different student bookings within 2 seconds
```

**Expected:**
- All 5 notifications received
- At least 4 out of 5 appear within 1 second
- No console errors
- No connection drops

### Monitoring Points

**Memory Usage:**
- Student browser tab: Should stay ~50-100MB
- Backend connections: Each WebSocket ~500KB

**CPU Usage:**
- Browser: < 5% when idle
- Backend: < 2% per idle connection

---

## 🎯 Success Criteria

✅ **Core Functionality:**
- [ ] Student receives notification when payment approved
- [ ] Student receives notification when booking approved  
- [ ] Student receives notification when booking rejected
- [ ] Toast appears with correct title and message
- [ ] Toast colors indicate severity (green=success, red=error)
- [ ] Notification received within 1 second

✅ **Robustness:**
- [ ] Automatic reconnection works
- [ ] No errors in browser console
- [ ] No errors in server logs
- [ ] Handles rapid updates (5+ per second)
- [ ] Works after browser refresh
- [ ] Works in background tab (message received)

✅ **User Experience:**
- [ ] Toast appears at expected position (top-right)
- [ ] Toast auto-closes after 4-5 seconds
- [ ] User can manually close toast early
- [ ] Dark mode readable
- [ ] Mobile responsive

---

## 📱 Mobile Testing

### iOS/Android Testing

**Prerequisites:**
- Mobile on same network as development machine
- Backend running on your machine IP (e.g., 192.168.1.100:8080)

**Steps:**
```
1. Update frontend API URL in src/api/client.js:
   - Replace localhost:8080 with your-machine-ip:8080

2. Access from mobile:
   - Open: http://your-machine-ip:5173
   - Login as student
   - WebSocket should connect
   - Admin approves payment
   - Student sees notification
```

---

## 🔧 Configuration Reference

### Backend Configuration

**File:** `WebSocketConfig.java`

```java
// WebSocket endpoint
registry.addEndpoint("/ws-notifications")
  .setAllowedOriginPatterns("*")  // For development

// Message broker
config.enableSimpleBroker("/topic", "/queue")
config.setApplicationDestinationPrefixes("/app")
```

### Frontend Configuration

**File:** `NotificationContext.jsx`

```javascript
// WebSocket URL (auto-detected)
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const host = window.location.host;
const url = `${protocol}://${host}/ws-notifications`;

// Token fetched from localStorage
const authToken = localStorage.getItem('token');
```

---

## 🚀 Deployment Preparation

### Before Production Deployment

**Checklist:**
- [ ] Backend builds without errors
- [ ] Frontend builds: `npm run build`
- [ ] WebSocket connection tested on staging
- [ ] HTTPS/WSS properly configured
- [ ] CORS origins whitelisted (not `*`)
- [ ] Firewall allows WebSocket port
- [ ] Load testing with 100+ concurrent connections
- [ ] Monitoring alerts set up for connection health

### Production Configuration

**Update WebSocketConfig.java:**
```java
registry.addEndpoint("/ws-notifications")
  .setAllowedOriginPatterns(
    "https://yourdomain.com",
    "https://www.yourdomain.com"
  )
  .withSockJS();  // Optional: fallback for proxies
```

---

## 📞 Support

**For debugging, check these logs:**

**Backend logs (console output):**
```
grep "NOTIFICATION-WS" <logfile>
grep "WebSocket" <logfile>
```

**Browser console:**
```javascript
// Show all notification logs
console.log('%c[Notification]', 'color: blue', 'Search results');
```

**Network analysis:**
```
F12 → Network → Filter "WS" → Click connection → Messages tab
Shows all STOMP frames
```

---

**Quick Reference Card:**

| Issue | Fix |
|-------|-----|
| Backend won't compile | `mvnw clean compile` |
| WebSocket port in use | `lsof -i :8080` and kill process |
| Frontend can't connect | Check `http://localhost:8080/ws-notifications` responds |
| Toast not showing | Verify react-hot-toast version 2.6.0+ |
| Notifications delayed | Check network latency in DevTools |
| Memory leak | Update all dependencies: `npm update` |

---

**Status:** ✅ Ready for Testing  
**Last Updated:** 2025-04-15  
**Version:** 1.0
