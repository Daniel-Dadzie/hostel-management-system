# Dashboard Analytics Charts - Implementation Guide

## Overview
This implementation adds professional analytics charts to the Admin Dashboard using Recharts. The system displays occupancy rates and revenue trends for data-driven decision making.

## Features Implemented

### 1. **Analytics Charts**
- **Occupancy Rate Chart** (Pie Chart)
  - Visual breakdown of booked vs empty rooms
  - Display by hostel or overall statistics
  - Occupancy percentage indicator
  - Room count summary cards

- **Revenue Over Time Chart** (Bar Chart)
  - Monthly revenue from completed payments
  - Last 12 months of data
  - Detailed statistics (total, average, peak)
  - Currency-aware formatting

### 2. **Backend Analytics Endpoints**

#### GET `/api/admin/analytics/occupancy`
Returns occupancy data for all hostels.

**Response:**
```json
{
  "Hostel A": {
    "hostelName": "Hostel A",
    "totalRooms": 50,
    "bookedRooms": 40,
    "emptyRooms": 10,
    "occupancyRate": 80.0
  },
  "overall": {
    "totalRooms": 150,
    "bookedRooms": 110,
    "emptyRooms": 40,
    "occupancyRate": 73.33
  }
}
```

#### GET `/api/admin/analytics/revenue`
Returns monthly revenue data for the last 12 months.

**Response:**
```json
[
  {
    "month": "2025-05",
    "monthDisplay": "May 2025",
    "revenue": "5000.00"
  },
  {
    "month": "2025-06",
    "monthDisplay": "Jun 2025",
    "revenue": "7500.50"
  }
]
```

#### GET `/api/admin/analytics/summary`
Returns summarized statistics for dashboard overview.

**Response:**
```json
{
  "totalBookings": 150,
  "approvedBookings": 110,
  "pendingPaymentBookings": 25,
  "totalRooms": 150,
  "occupiedRooms": 110,
  "emptyRooms": 40,
  "occupancyRate": 73.33,
  "totalRevenue": "45000.00",
  "completedPayments": 110,
  "timestamp": "2026-04-15T10:30:00Z"
}
```

### 3. **Frontend Components**

#### OccupancyChart.jsx
- Pie chart visualization with donut style
- Booked vs Empty rooms breakdown
- Loading and error states
- Responsive design with Tailwind CSS

#### RevenueChart.jsx
- Bar chart visualization of monthly revenue
- 12-month historical data
- Summary statistics cards
- Tooltip with detailed information

#### AnalyticsDashboard.jsx
- Main analytics container component
- Fetches and manages analytics data
- Integrates both charts
- Quick statistics summary
- Data refresh capability

### 4. **Service Layer**

#### analyticsService.js
```javascript
// Fetch occupancy analytics
getOccupancyAnalytics() -> Promise<Object>

// Fetch revenue analytics
getRevenueAnalytics() -> Promise<Array>

// Fetch summary statistics
getAnalyticsSummary() -> Promise<Object>
```

## Technical Stack

### Frontend
- **React** 18.3.1 - UI framework
- **Recharts** 3.8.0 - Chart library
- **Tailwind CSS** - Styling
- **PropTypes** - Type checking

### Backend
- **Spring Boot** 3.3.3 - Framework
- **Java** 21 - Language
- **JPA** - Data access

## File Structure

### Created Files
- `backend/app/src/main/java/com/hostelmanagement/web/admin/AdminAnalyticsController.java`
- `frontend/src/services/analyticsService.js`
- `frontend/src/components/admin/OccupancyChart.jsx`
- `frontend/src/components/admin/RevenueChart.jsx`
- `frontend/src/components/admin/AnalyticsDashboard.jsx`

### Modified Files
- `frontend/src/pages/admin/AdminDashboard.jsx` - Added Analytics tab

## Usage

### Accessing Analytics
1. Log in as Admin
2. Navigate to Admin Dashboard
3. Click on **Analytics** tab
4. View charts and statistics

### Components

#### OccupancyChart Usage
```jsx
<OccupancyChart
  data={occupancyData}
  title="Overall Room Occupancy"
  loading={false}
  error={null}
/>
```

#### RevenueChart Usage
```jsx
<RevenueChart
  data={revenueData}
  loading={false}
  error={null}
/>
```

## Features

### Data Visualization
✅ Pie chart for occupancy distribution  
✅ Bar chart for revenue trends  
✅ Loading states with spinners  
✅ Error handling with user-friendly messages  
✅ Empty state handling  

### Statistics
✅ Total rooms and occupancy rate  
✅ Booked vs empty room counts  
✅ Monthly revenue summaries  
✅ 12-month historical data  
✅ Peak month identification  

### User Experience
✅ Responsive design for all screen sizes  
✅ Dark mode support  
✅ Real-time data fetching  
✅ Manual refresh button  
✅ Tooltip on hover for detailed info  

### Performance
✅ Efficient data aggregation on backend  
✅ Lazy loading charts  
✅ Minimal re-renders  
✅ Optimized queries  

## Customization

### Changing Chart Colors
Edit `OccupancyChart.jsx`:
```javascript
const chartData = [
  { name: 'Booked Rooms', value: data.bookedRooms, fill: '#YOUR_COLOR' },
  { name: 'Empty Rooms', value: data.emptyRooms, fill: '#YOUR_COLOR' }
];
```

Edit `RevenueChart.jsx`:
```javascript
<Bar
  dataKey="revenueNumeric"
  fill="#YOUR_COLOR"
  name="Revenue"
/>
```

### Adjusting Time Range
Modify in `AdminAnalyticsController.java`:
```java
// Change from 12 months to different range
for (int i = 0; i < 12; i++) {  // Change 12 to desired months
  monthlyRevenue.put(startMonth.plusMonths(i), BigDecimal.ZERO);
}
```

### Currency Format
Update in `RevenueChart.jsx` and `AnalyticsDashboard.jsx`:
```javascript
// Change GHS to your currency
formatter={(value) => [`GHS ${value.toFixed(2)}`, 'Revenue']}
```

## Testing

### Test Scenarios

#### Test 1: Load Analytics Page
1. Navigate to Admin Dashboard
2. Click Analytics tab
3. **Expected:** Charts load with data, no errors

#### Test 2: Empty Data
1. Create new database with no payments
2. Load Analytics page
3. **Expected:** Empty state message displayed

#### Test 3: Multiple Hostels
1. Ensure data exists for multiple hostels
2. Load Analytics page
3. **Expected:** Occupancy shows data from all hostels

#### Test 4: Revenue Calculation
1. Complete several payments
2. Load Analytics page
3. **Expected:** Total revenue matches sum of payments

#### Test 5: Responsive Design
1. View on mobile (< 768px)
2. View on tablet (768px - 1024px)
3. View on desktop (> 1024px)
4. **Expected:** Charts responsive at all sizes

#### Test 6: Dark Mode
1. Toggle dark mode
2. View charts
3. **Expected:** Color scheme adjusts for readability

#### Test 7: Error Handling
1. Stop backend server
2. Load Analytics page
3. **Expected:** Error messages display

#### Test 8: Refresh Data
1. Click "Refresh Data" button
2. **Expected:** Charts reload with latest data

## API Security

### Authentication
- ✅ All endpoints require admin role
- ✅ JWT token validation
- ✅ User identity verification

### Authorization
- ✅ Only admins can access `/api/admin/analytics/*`
- ✅ @PreAuthorize annotation enforced
- ✅ Request validation on backend

## Performance Considerations

### Database Queries
- Efficient aggregation in Java (not N+1 queries)
- Single pass through data for calculations
- Indexed lookups on Payment status

### Frontend Rendering
- Recharts optimizes SVG rendering
- Lazy loading of chart components
- Memoization for data calculations

### Caching Opportunities (Future)
- Cache occupancy data for 5 minutes
- Cache revenue data for 1 hour
- Invalidate on new payment

## Troubleshooting

### Charts Not Displaying
1. Check browser console for errors
2. Verify backend is running
3. Check network tab for API responses
4. Clear browser cache

### No Data in Charts
1. Verify data exists in database
2. Check database connection
3. Verify timestamp formats match
4. Check payment status is COMPLETED

### Incorrect Revenue
1. Verify payments have `paidAt` timestamp
2. Check payment status is COMPLETED
3. Verify amount is not null
4. Check currency calculations

### Performance Issues
1. Reduce data range (fewer months)
2. Add database indexing
3. Implement backend caching
4. Optimize chart re-renders

## Browser Compatibility

✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+  

## Future Enhancements

Potential improvements:
- [ ] Export charts as images/PDF
- [ ] Filter by date range
- [ ] Hostel-specific analytics dashboard
- [ ] Alert on low occupancy
- [ ] Revenue forecasting
- [ ] Custom reports
- [ ] Analytics email notifications
- [ ] Real-time data updates (WebSocket)
- [ ] Comparison with previous periods
- [ ] Drill-down capabilities

## Deployment Checklist

- [ ] Backend builds without errors: `mvnw clean package`
- [ ] Frontend builds: `npm run build`
- [ ] Test analytics page loads
- [ ] Verify API endpoints respond
- [ ] Test with sample data
- [ ] Check performance (page load time)
- [ ] Verify error handling
- [ ] Test responsive design on multiple devices
- [ ] Test dark mode
- [ ] Performance test with large dataset

## Support & Debugging

### Enable Backend Logging
```properties
logging.level.com.hostelmanagement.web.admin=DEBUG
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Charts empty | No data | Ensure payments exist with COMPLETED status |
| Loading forever | Server down | Check backend is running |
| Wrong calculations | Date format | Verify timezone settings |
| Slow loading | Large dataset | Implement caching, add indexes |
| Mobile cut-off | Responsive | Test on different screen sizes |

## File Sizes

- AdminAnalyticsController.java: ~5KB
- analyticsService.js: ~1KB
- OccupancyChart.jsx: ~4KB
- RevenueChart.jsx: ~5KB
- AnalyticsDashboard.jsx: ~3KB
- **Total: ~18KB**

## Related Documentation

- [Admin Dashboard Overview](AdminDashboard.md)
- [API Documentation](API_DOCS.md)
- [Database Schema](DATABASE.md)
- [Recharts Documentation](https://recharts.org/)
