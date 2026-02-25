import { useCallback, useEffect, useMemo, useState } from 'react';
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

  const metrics = useMemo(() => {
    const totalCapacity = rooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
    const totalOccupancy = rooms.reduce((sum, room) => sum + (room.currentOccupancy || 0), 0);
    const occupancyRate = totalCapacity === 0 ? 0 : Math.round((totalOccupancy / totalCapacity) * 100);

    const statusCounts = bookings.reduce(
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
      totalBookings: bookings.length,
      statusCounts
    };
  }, [hostels, rooms, bookings]);

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
      ...bookings.map((b) => [
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
  }, [metrics, occupancyByHostel, bookings]);

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

    const bookingRows = bookings
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
  ${bookings.length > 50 ? `<p style="color:#666;font-size:12px;">Showing 50 of ${bookings.length} bookings. Export to CSV for complete data.</p>` : ''}

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
  }, [metrics, occupancyByHostel, bookings]);

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
          <div className="mt-4 space-y-3">
            {occupancyByHostel.map((item) => (
              <div key={item.hostel}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-neutral-700 dark:text-neutral-200">{item.hostel}</span>
                  <span className="text-neutral-600 dark:text-neutral-300">{item.rate}%</span>
                </div>
                <div className="h-2 rounded bg-neutral-200 dark:bg-neutral-800">
                  <div className="h-2 rounded bg-primary-600" style={{ width: `${item.rate}%` }}></div>
                </div>
              </div>
            ))}
            {occupancyByHostel.length === 0 && (
              <p className="body-text text-neutral-500 dark:text-neutral-400">No occupancy data.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="card-header text-neutral-900 dark:text-white">Booking Status Distribution</h2>
          <div className="mt-4 space-y-2">
            {Object.entries(metrics.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800">
                <span className="text-neutral-700 dark:text-neutral-200">{status.replaceAll('_', ' ')}</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{count}</span>
              </div>
            ))}
            {Object.keys(metrics.statusCounts).length === 0 && (
              <p className="body-text text-neutral-500 dark:text-neutral-400">No booking status data.</p>
            )}
          </div>
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
