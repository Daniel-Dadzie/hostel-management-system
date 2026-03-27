import { useEffect, useMemo, useState } from 'react';
import { FaFileExport, FaDownload } from 'react-icons/fa';
import { listAdminBookings } from '../../services/bookingService.js';
import DataTable from '../../components/admin/DataTable.jsx';
import AdvancedFilter from '../../components/admin/AdvancedFilter.jsx';
import { MiniStatsCard } from '../../components/admin/StatsCard.jsx';
import Alert from '../../components/admin/Alert.jsx';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils.js';

export default function ManageStudentsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    loadStudentsContext();
  }, []);

  async function loadStudentsContext() {
    try {
      const data = await listAdminBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const students = useMemo(() => {
    const byStudent = new Map();

    bookings.forEach((item) => {
      if (!item.studentId) return;
      if (!byStudent.has(item.studentId)) {
        byStudent.set(item.studentId, {
          studentId: item.studentId,
          studentName: item.studentName,
          studentEmail: item.studentEmail,
          totalBookings: 0,
          approvedBookings: 0,
          pendingBookings: 0,
          latestHostel: item.hostelName || '-',
          latestRoom: item.roomNumber || '-'
        });
      }

      const student = byStudent.get(item.studentId);
      student.totalBookings += 1;
      if (item.status === 'APPROVED') student.approvedBookings += 1;
      if (item.status === 'PENDING_PAYMENT') student.pendingBookings += 1;
      student.latestHostel = item.hostelName || student.latestHostel;
      student.latestRoom = item.roomNumber || student.latestRoom;
    });

    return Array.from(byStudent.values());
  }, [bookings]);

  const filteredStudents = students.filter((student) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      student.studentName?.toLowerCase().includes(query) ||
      student.studentEmail?.toLowerCase().includes(query)
    );
  });

  const handleExport = (format) => {
    if (filteredStudents.length === 0) {
      setError('No students to export');
      return;
    }

    const columns = [
      { key: 'studentName', label: 'Name' },
      { key: 'studentEmail', label: 'Email' },
      { key: 'totalBookings', label: 'Total Bookings' },
      { key: 'approvedBookings', label: 'Approved' },
      { key: 'pendingBookings', label: 'Pending' },
      { key: 'latestHostel', label: 'Latest Hostel' },
      { key: 'latestRoom', label: 'Latest Room' }
    ];

    try {
      if (format === 'csv') {
        exportToCSV(filteredStudents, columns, `students-${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        exportToJSON(filteredStudents, `students-${new Date().toISOString().split('T')[0]}.json`);
      }
      setExportSuccess(true);
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title text-neutral-900 dark:text-white">Manage Students</h1>
        <p className="body-text mt-1 text-neutral-600 dark:text-neutral-400">
          Student overview and management based on booking activity.
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {exportSuccess && (
        <Alert type="success" message="Data exported successfully!" autoClose={3000} onClose={() => setExportSuccess(false)} />
      )}

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStatsCard
          label="Total Students"
          value={students.length}
          color="primary"
        />
        <MiniStatsCard
          label="With Approved Booking"
          value={students.filter((s) => s.approvedBookings > 0).length}
          color="emerald"
        />
        <MiniStatsCard
          label="Pending Payment"
          value={students.filter((s) => s.pendingBookings > 0).length}
          color="yellow"
        />
        <MiniStatsCard
          label="Average Bookings"
          value={students.length > 0 ? (students.reduce((sum, s) => sum + s.totalBookings, 0) / students.length).toFixed(1) : 0}
          color="blue"
        />
      </div>

      {/* Search and Controls */}
      <div className="card space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="card-header text-neutral-900 dark:text-white">Student Directory</h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              className="input-field flex-1"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleExport('csv')}
                className="btn-primary text-sm"
              >
                <FaDownload className="h-4 w-4" />
                CSV
              </button>
              <button
                type="button"
                onClick={() => handleExport('json')}
                className="btn-accent text-sm"
              >
                <FaFileExport className="h-4 w-4" />
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={[
            { key: 'studentName', label: 'Name', sortable: true },
            { key: 'studentEmail', label: 'Email', sortable: true },
            {
              key: 'totalBookings',
              label: 'Bookings',
              sortable: true,
              render: (value, row) => (
                <div className="space-y-1">
                  <div className="font-medium">{value} total</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    {row.approvedBookings} approved · {row.pendingBookings} pending
                  </div>
                </div>
              )
            },
            {
              key: 'latestHostel',
              label: 'Latest Allocation',
              render: (value, row) => `${value} / ${row.latestRoom}`
            }
          ]}
          data={filteredStudents}
          emptymessage={filteredStudents.length === 0 ? 'No students found' : 'No students'}
          itemsPerPage={15}
        />
      </div>
    </div>
  );
}
