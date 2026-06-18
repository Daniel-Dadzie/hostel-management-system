import { useEffect, useMemo, useState } from 'react';
import { FaFileExport, FaDownload } from 'react-icons/fa';
import { listAdminBookings } from '../../services/bookingService.js';
import { deleteStudent } from '../../services/studentService.js'; // Ensure this exists
import DataTable from '../../components/admin/DataTable.jsx';
import Alert from '../../components/admin/Alert.jsx';
import { MiniStatsCard } from '../../components/admin/StatsCard.jsx';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils.js';

export default function ManageStudentsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure? This will permanently delete this student record.")) return;
    try {
      await deleteStudent(studentId);
      loadStudentsContext(); // Refresh table
    } catch (err) {
      setError("Failed to delete: " + err.message);
    }
  };

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
    });
    return Array.from(byStudent.values());
  }, [bookings]);

  const filteredStudents = students.filter((s) => 
    s.studentName?.toLowerCase().includes(search.toLowerCase()) || 
    s.studentEmail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      
      <div className="card">
         {/* // ... inside your ManageStudentsPage.jsx ... */}

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
  actions={[
    {
      label: 'Edit',
      onClick: (row) => handleEdit(row), // You can implement this function
      variant: 'primary'
    },
    {
      label: 'Delete',
      onClick: (row) => handleDelete(row.studentId),
      variant: 'danger'
    }
  ]}
  emptymessage={filteredStudents.length === 0 ? 'No students found' : 'No students'}
  itemsPerPage={15}
/>
      </div>
    </div>
  );
}