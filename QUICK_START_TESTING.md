# Quick Start - Build & Test Guide

## 🚀 Quick Build & Run

### 1. Backend Build
```bash
cd backend/app
mvnw clean package -Dmaven.test.skip=true
```

**Or on PowerShell:**
```powershell
cd backend/app
cmd /c mvnw.cmd clean package "-Dmaven.test.skip=true"
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time:  XX.XXs
```

### 2. Start Backend
```bash
cd backend/app
java -jar target/backendapp-0.0.1-SNAPSHOT.jar
```

**Or using Spring Boot Maven:**
```bash
cd backend/app
mvnw spring-boot:run
```

### 3. Start Frontend (in separate terminal)
```bash
cd frontend
npm install  # if needed
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## ✅ Manual Test Checklist

### A. Analytics Dashboard Tests

#### Test 1: Load Analytics Page
1. Log in as admin
2. Navigate to http://localhost:5173/admin/dashboard
3. Click **"Analytics"** tab (2nd tab from left)
4. **Expected:** No console errors, both charts visible

#### Test 2: Occupancy Chart
1. Look at the **pie chart** (left side)
2. Should show green (booked) and gray (empty) segments
3. Below chart: See "Booked Rooms: X | Empty Rooms: Y | Occupancy: Z%"
4. **Expected:** Numbers match room data

#### Test 3: Revenue Chart
1. Look at the **bar chart** (right side)
2. Should show bars for up to 12 months
3. X-axis: Month labels (rotated)
4. Y-axis: Revenue amounts
5. Below chart: "Total Revenue: GHS X.XX | Avg/Month: GHS X.XX | Peak: Month X"
6. **Expected:** Numbers make sense with payment data

#### Test 4: Responsive Design
1. Open DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Test on:
   - Mobile (375px width)
   - Tablet (768px width)
   - Desktop (1920px width)
4. **Expected:** Charts stack vertically on mobile, side-by-side on desktop

#### Test 5: Dark Mode
1. In bottom-left corner: Click **theme toggle** (moon/sun icon)
2. View changes to dark mode
3. Charts should have high contrast
4. **Expected:** Readable on dark background

#### Test 6: Refresh Button
1. Click **"Refresh Data"** button (top-right)
2. Charts show loading spinners briefly
3. Data reloads
4. **Expected:** Spinner appears then disappears

#### Test 7: Error Handling
1. Stop backend server (Ctrl+C)
2. Click "Refresh Data"
3. **Expected:** Error message appears
4. Start backend again
5. Click "Refresh Data"
6. **Expected:** Charts reload successfully

#### Test 8: Empty Data State
1. (Only if database has no payments or bookings)
2. Analytics page should show: "No data available"
3. **Expected:** Graceful empty state, no crashes

---

### B. PDF Download Tests (MyPayments Page)

#### Test 1: Navigate to My Payments
1. Log in as student
2. Go to Student Dashboard → "My Payments"
3. Find a **completed payment** (green checkmark)
4. **Expected:** See "Download Documents" section

#### Test 2: Download Allocation Letter
1. Click **"Download Allocation Letter"** button
2. PDF should start downloading
3. Open PDF in browser or reader
4. **Expected:** Document shows:
   - University logo (if configured)
   - Student name, ID, batch
   - Room number and hostel name
   - Payment confirmation
   - Signed terms & conditions

#### Test 3: Download Receipt
1. Click **"Download Payment Receipt"** button
2. PDF should start downloading
3. Open PDF
4. **Expected:** Document shows:
   - Payment confirmation
   - Amount paid, payment method
   - Transaction date
   - Student info

---

## 📊 Test Data Requirements

### For Analytics to Show Data

**Create Test Payments:**
```sql
INSERT INTO payment (id, student_id, booking_id, amount, payment_method, payment_date, paid_at, status, created_at)
VALUES 
(1, 1, 1, 2500.00, 'PAYSTACK', NOW(), NOW(), 'COMPLETED', NOW()),
(2, 2, 2, 2500.00, 'PAYSTACK', DATE_SUB(NOW(), INTERVAL 1 MONTH), DATE_SUB(NOW(), INTERVAL 1 MONTH), 'COMPLETED', NOW()),
(3, 3, 3, 2500.00, 'PAYSTACK', DATE_SUB(NOW(), INTERVAL 2 MONTH), DATE_SUB(NOW(), INTERVAL 2 MONTH), 'COMPLETED', NOW());
```

**Create Test Bookings:**
```sql
UPDATE booking SET status = 'APPROVED' WHERE id IN (1, 2, 3);
UPDATE room SET current_occupancy = 1 WHERE id IN (1, 2, 3);
```

---

## 🔍 Browser DevTools Checks

### Console Errors (F12 → Console)
- ❌ Should NOT see red errors
- ⚠️  May see warnings (OK)
- ✅ Should see successful API calls logged

### Network Tab (F12 → Network)
1. Click **Analytics** tab
2. Watch Network requests:
   - ✅ `GET /api/admin/analytics/occupancy` (200 OK)
   - ✅ `GET /api/admin/analytics/revenue` (200 OK)
   - ✅ `GET /api/admin/analytics/summary` (200 OK)

### Response Data (F12 → Network → Click request)
1. Click occupancy request
2. Look at **Response** tab
3. **Should see JSON with:** hostelName, totalRooms, bookedRooms, emptyRooms, occupancyRate

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| **Charts not showing** | Backend not running | `mvnw spring-boot:run` |
| **API error 401** | JWT token expired | Log out and log back in |
| **API error 403** | Not admin user | Use admin account |
| **"No data available"** | No payments in DB | Create test payments (SQL above) |
| **Pie chart empty** | No approved bookings | Update booking status to APPROVED |
| **Revenue chart empty** | Payments don't have paidAt | Check payment timestamps |
| **Charts cut off mobile** | Responsive design | Check DevTools device mode |
| **PDF won't download** | Backend not compiled | Run `mvnw clean package` |
| **PDF missing logo** | Logo not configured | See LOGO_SETUP.md (optional) |
| **Currency wrong** | Hardcoded GHS | Edit RevenueChart.jsx if needed |

---

## 📋 Pre-Deployment Verification

### Backend
- [ ] `mvnw clean package` runs without errors
- [ ] No compilation errors
- [ ] `target/backendapp-0.0.1-SNAPSHOT.jar` exists
- [ ] Spring Boot starts without errors
- [ ] No SQL migration issues

### Frontend
- [ ] `npm run build` produces no errors
- [ ] `npm run dev` starts successfully
- [ ] Analytics page renderswithout console errors
- [ ] Charts display with real data (if available)

### API Endpoints (curl commands)
```bash
# Check occupancy endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/admin/analytics/occupancy

# Check revenue endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/admin/analytics/revenue

# Check summary endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/admin/analytics/summary
```

**Expected:** JSON responses (not errors)

---

## 📝 Logs to Check

### Backend Logs (spring-boot console output)
Look for these successful messages:
```
Starting backendapp
Tomcat started on port(s): 8080 (http)
Application started successfully
```

### Frontend Logs (DevTools Console)
Look for:
```
GET /api/admin/analytics/occupancy 200 OK
GET /api/admin/analytics/revenue 200 OK
Charts rendered successfully
```

---

## 🎯 Next Steps After Testing

1. ✅ Verify all tests pass
2. 📸 Take screenshots for documentation
3. 📊 Create sample reports
4. 🚀 Deploy to production
5. 📧 Notify stakeholders
6. 📈 Monitor analytics usage

---

## 🆘 Support

**If you encounter issues:**
1. Check the [DASHBOARD_ANALYTICS_GUIDE.md](DASHBOARD_ANALYTICS_GUIDE.md)
2. Review [Backend logs](troubleshooting/logs.md)
3. Check database connectivity
4. Verify JWT tokens are valid
5. Clear browser cache (Ctrl+Shift+Delete)
6. Restart both backend and frontend

---

## ⏱️ Expected Timings

| Operation | Expected Time |
|-----------|---|
| Backend build | 30-60 seconds |
| Backend startup | 5-10 seconds |
| Frontend dev server start | 2-3 seconds |
| Analytics page load | 1-2 seconds |
| Chart render | < 1 second |
| API response time | 100-500ms |

---

**Last Updated:** 2025-04-15  
**Version:** 1.0  
**Status:** Ready for Testing ✅
