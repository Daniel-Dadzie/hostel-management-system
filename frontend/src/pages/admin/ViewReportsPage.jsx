import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { listAdminBookings } from '../../services/bookingService.js';
import { listHostels } from '../../services/hostelService.js';
import { listRooms } from '../../services/roomService.js';

export default function ViewReportsPage() {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const [hostelsData, roomsData, bookingsData] = await Promise.all([
        listHostels(),
        listRooms(),
        listAdminBookings()
      ]);
      setHostels(Array.isArray(hostelsData) ? hostelsData : []);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Filter bookings based on date range
  const filteredBookings = useMemo(() => {
    if (!startDate && !endDate) return bookings;
    
    return bookings.filter((booking) => {
      const bookingDate = booking.appliedAt ? new Date(booking.appliedAt).toISOString().split('T')[0] : null;
      if (!bookingDate) return true;
      
      if (startDate && bookingDate < startDate) return false;
      if (endDate && bookingDate > endDate) return false;
      return true;
    });
  }, [bookings, startDate, endDate]);

  const metrics = useMemo(() => {
    const totalCapacity = rooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
    const totalOccupancy = rooms.reduce((sum, room) => sum + (room.currentOccupancy || 0), 0);
    const occupancyRate = totalCapacity === 0 ? 0 : Math.round((totalOccupancy / totalCapacity) * 100);

    const statusCounts = filteredBookings.reduce(
      (acc, item) => {
        const key = item.status || 'UNKNOWN';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {}
    );

    return {
      occupancyRate,
      totalHostels: hostels.length,
      totalRooms: rooms.length,
      totalBookings: filteredBookings.length,
      statusCounts
    };
  }, [hostels, rooms, filteredBookings]);

  const occupancyByHostel = useMemo(() => {
    const byHostel = new Map();

    rooms.forEach((room) => {
      const key = room.hostelName || 'Unknown';
      if (!byHostel.has(key)) {
        byHostel.set(key, { hostel: key, capacity: 0, occupancy: 0 });
      }
      const value = byHostel.get(key);
      value.capacity += room.capacity || 0;
      value.occupancy += room.currentOccupancy || 0;
    });

    return Array.from(byHostel.values()).map((item) => ({
      ...item,
      rate: item.capacity === 0 ? 0 : Math.round((item.occupancy / item.capacity) * 100)
    }));
  }, [rooms]);

  const exportToCSV = useCallback(() => {
    // Escape CSV special characters to prevent injection and format corruption
    const escapeCSV = (value) => {
      if (value == null) return '';
      const str = String(value);
      // If contains comma, quote, newline, or carriage return, wrap in quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        // Escape double quotes by doubling them
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = [
      ['Hostel Management System Report'],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Summary Metrics'],
      ['Total Hostels', metrics.totalHostels],
      ['Total Rooms', metrics.totalRooms],
      ['Total Bookings', metrics.totalBookings],
      ['Occupancy Rate', `${metrics.occupancyRate}%`],
      [],
      ['Occupancy by Hostel'],
      ['Hostel', 'Capacity', 'Occupancy', 'Rate'],
      ...occupancyByHostel.map((item) => [
        escapeCSV(item.hostel),
        item.capacity,
        item.occupancy,
        `${item.rate}%`
      ]),
      [],
      ['Booking Status Distribution'],
      ['Status', 'Count'],
      ...Object.entries(metrics.statusCounts).map(([status, count]) => [
        status.replaceAll('_', ' '),
        count
      ]),
      [],
      ['Bookings Detail'],
      ['ID', 'Student', 'Email', 'Hostel', 'Room', 'Status', 'Payment Status'],
      ...filteredBookings.map((b) => [
        b.id,
        escapeCSV(b.studentName),
        escapeCSV(b.studentEmail),
        escapeCSV(b.hostelName),
        escapeCSV(b.roomNumber),
        escapeCSV(b.status),
        escapeCSV(b.paymentStatus)
      ])
    ];

    const csvContent = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hostel-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [metrics, occupancyByHostel, filteredBookings]);

  const exportToPDF = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      return;
    }

    // Escape HTML special characters to prevent XSS
    const escapeHTML = (value) => {
      if (value == null) return '';
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const statusRows = Object.entries(metrics.statusCounts)
      .map(
        ([status, count]) =>
          `<tr><td style="padding:8px;border:1px solid #ddd;">${escapeHTML(status.replaceAll('_', ' '))}</td><td style="padding:8px;border:1px solid #ddd;text-align:right;">${count}</td></tr>`
      )
      .join('');

    const occupancyRows = occupancyByHostel
      .map(
        (item) =>
          `<tr><td style="padding:8px;border:1px solid #ddd;">${escapeHTML(item.hostel)}</td><td style="padding:8px;border:1px solid #ddd;text-align:right;">${item.capacity}</td><td style="padding:8px;border:1px solid #ddd;text-align:right;">${item.occupancy}</td><td style="padding:8px;border:1px solid #ddd;text-align:right;">${item.rate}%</td></tr>`
      )
      .join('');

    const bookingRows = filteredBookings
      .slice(0, 50)
      .map(
        (b) =>
          `<tr><td style="padding:6px;border:1px solid #ddd;">${b.id}</td><td style="padding:6px;border:1px solid #ddd;">${escapeHTML(b.studentName) || '-'}</td><td style="padding:6px;border:1px solid #ddd;">${escapeHTML(b.hostelName) || '-'}</td><td style="padding:6px;border:1px solid #ddd;">${escapeHTML(b.roomNumber) || '-'}</td><td style="padding:6px;border:1px solid #ddd;">${escapeHTML(b.status) || '-'}</td></tr>`
      )
      .join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Hostel Management Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
    h1 { color: #166534; border-bottom: 2px solid #166534; padding-bottom: 10px; }
    h2 { color: #166534; margin-top: 30px; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
    .metric-card { background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center; }
    .metric-value { font-size: 24px; font-weight: bold; color: #166534; }
    .metric-label { color: #666; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #166534; color: white; padding: 10px; text-align: left; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Hostel Management System Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  
  <div class="metrics">
    <div class="metric-card">
      <div class="metric-value">${metrics.totalHostels}</div>
      <div class="metric-label">Hostels</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${metrics.totalRooms}</div>
      <div class="metric-label">Rooms</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${metrics.totalBookings}</div>
      <div class="metric-label">Bookings</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${metrics.occupancyRate}%</div>
      <div class="metric-label">Occupancy Rate</div>
    </div>
  </div>

  <h2>Occupancy by Hostel</h2>
  <table>
    <thead><tr><th>Hostel</th><th style="text-align:right;">Capacity</th><th style="text-align:right;">Occupancy</th><th style="text-align:right;">Rate</th></tr></thead>
    <tbody>${occupancyRows || '<tr><td colspan="4" style="padding:8px;text-align:center;">No data</td></tr>'}</tbody>
  </table>

  <h2>Booking Status Distribution</h2>
  <table>
    <thead><tr><th>Status</th><th style="text-align:right;">Count</th></tr></thead>
    <tbody>${statusRows || '<tr><td colspan="2" style="padding:8px;text-align:center;">No data</td></tr>'}</tbody>
  </table>

  <h2>Recent Bookings</h2>
  <table>
    <thead><tr><th>ID</th><th>Student</th><th>Hostel</th><th>Room</th><th>Status</th></tr></thead>
    <tbody>${bookingRows || '<tr><td colspan="5" style="padding:8px;text-align:center;">No bookings</td></tr>'}</tbody>
  </table>
  ${filteredBookings.length > 50 ? `<p style="color:#666;font-size:12px;">Showing 50 of ${filteredBookings.length} bookings. Export to CSV for complete data.</p>` : ''}

  <div class="footer">
    <p>This report was generated by the Hostel Management System.</p>
  </div>
</body>
</html>`;

    const parsed = new DOMParser().parseFromString(html, 'text/html');
    printWindow.document.title = parsed.title;
    printWindow.document.head.innerHTML = parsed.head.innerHTML;
    printWindow.document.body.innerHTML = parsed.body.innerHTML;
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }, [metrics, occupancyByHostel, filteredBookings]);

  async function handleExport(format) {
    setExporting(format);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (format === 'pdf') {
        exportToPDF();
      } else {
        exportToCSV();
      }
    } finally {
      setExporting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-neutral-900 dark:text-white">View Reports</h1>
        <p className="section-subtitle">
          Reports and analytics generated from current system data.
        </p>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {/* Date Range Filter */}
      <div className="card">
        <h2 className="card-header text-neutral-900 dark:text-white">Filter by Date Range</h2>
        <div className="mt-4 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label htmlFor="startDate" className="body-text text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="endDate" className="body-text text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="btn-ghost text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
        {(startDate || endDate) && (
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            Showing bookings from {startDate || 'any date'} to {endDate || 'any date'} ({filteredBookings.length} of {bookings.length} bookings)
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="body-text text-neutral-500 dark:text-neutral-400">Hostels</p>
          <p className="card-header mt-2 text-neutral-900 dark:text-white">{metrics.totalHostels}</p>
        </div>
        <div className="card">
          <p className="body-text text-neutral-500 dark:text-neutral-400">Rooms</p>
          <p className="card-header mt-2 text-neutral-900 dark:text-white">{metrics.totalRooms}</p>
        </div>
        <div className="card">
          <p className="body-text text-neutral-500 dark:text-neutral-400">Bookings</p>
          <p className="card-header mt-2 text-neutral-900 dark:text-white">{metrics.totalBookings}</p>
        </div>
        <div className="card">
          <p className="body-text text-neutral-500 dark:text-neutral-400">Occupancy Rate</p>
          <p className="card-header mt-2 text-neutral-900 dark:text-white">{metrics.occupancyRate}%</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="card-header text-neutral-900 dark:text-white">Occupancy by Hostel</h2>
          <div className="mt-4">
            {occupancyByHostel.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={occupancyByHostel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="hostel" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
                    formatter={(value) => value}
                  />
                  <Legend />
                  <Bar dataKey="occupancy" stackId="a" fill="#ff7300" name="Occupied" />
                  <Bar dataKey="capacity" stackId="a" fill="#82ca9d" name="Capacity" opacity={0.5} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="body-text text-center text-neutral-500 dark:text-neutral-400 py-8">No occupancy data.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="card-header text-neutral-900 dark:text-white">Booking Status Distribution</h2>
          <div className="mt-4">
            {Object.keys(metrics.statusCounts).length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(metrics.statusCounts).map(([status, count]) => ({
                        name: status.replaceAll('_', ' '),
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} (${value})`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {['#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'].map((color, idx) => (
                        <Cell key={`cell-${idx}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {Object.entries(metrics.statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between rounded border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800">
                      <span className="text-neutral-700 dark:text-neutral-200">{status.replaceAll('_', ' ')}</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="body-text text-center text-neutral-500 dark:text-neutral-400 py-8">No booking status data.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-header text-neutral-900 dark:text-white">Occupancy Trend</h2>
        <div className="mt-4">
          {occupancyByHostel.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={occupancyByHostel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis dataKey="hostel" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
                  formatter={(value) => value}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', r: 4 }}
                  name="Occupancy Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="body-text text-center text-neutral-500 dark:text-neutral-400 py-8">No occupancy trend data.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="card-header text-neutral-900 dark:text-white">Export</h2>
        <p className="body-text mt-2 text-neutral-600 dark:text-neutral-300">
          Download reports in PDF or CSV (Excel-compatible) format.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="btn-primary disabled:opacity-50"
            type="button"
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
          >
            {exporting === 'pdf' ? 'Generating...' : 'Export PDF'}
          </button>
          <button
            className="btn-accent disabled:opacity-50"
            type="button"
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
          >
            {exporting === 'csv' ? 'Generating...' : 'Export Excel (CSV)'}
          </button>
        </div>
      </div>
    </div>
  );
}
