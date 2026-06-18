import { useEffect, useMemo, useState } from 'react';
import { listAdminBookings } from '../../services/bookingService.js';
import { deleteStudent, updateStudent, createStudent } from '../../services/studentService.js'; // Ensure updateStudent is imported
import DataTable from '../../components/admin/DataTable.jsx';
import Alert from '../../components/admin/Alert.jsx';
import StudentModal from '../../components/admin/StudentModal.jsx'; // Ensure this exists

export default function ManageStudentsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

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

  const handleEdit = (row) => {
    setCurrentStudent(row);
    setIsModalOpen(true);
  };

     // Replace your existing handleSave with this:
const handleSave = async (data) => {
  try {
    if (currentStudent) {
      // Logic for Update (PUT)
      await updateStudent(currentStudent.studentId, data);
    } else {
      // Logic for Create (POST) - This is what was missing!
      await createStudent(data); 
    }
    setIsModalOpen(false);
    loadStudentsContext(); // Refresh table to show the new student
  } catch (err) {
    setError("Operation failed: " + err.message);
  }
};

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure? This will permanently delete this student record.")) return;
    try {
      await deleteStudent(studentId);
      loadStudentsContext();
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
      
      <div className="card space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Student Directory</h2>
          <button 
            onClick={() => { setCurrentStudent(null); setIsModalOpen(true); }}
            className="btn-primary px-4 py-2 bg-primary-600 text-white rounded-lg"
          >
            + Add Student
          </button>
        </div>

        <DataTable
          columns={[
            { key: 'studentName', label: 'Name', sortable: true },
            { key: 'studentEmail', label: 'Email', sortable: true },
            { 
              key: 'totalBookings', 
              label: 'Bookings', 
              sortable: true,
              render: (value, row) => (
                <div className="text-sm">
                  <div>{value} total</div>
                  <div className="text-xs text-neutral-500">
                    {row.approvedBookings} approved · {row.pendingBookings} pending
                  </div>
                </div>
              )
            },
            { key: 'latestHostel', label: 'Latest Allocation', render: (val, row) => `${val} / ${row.latestRoom}` }
          ]}
          data={filteredStudents}
          actions={[
            { label: 'Edit', onClick: handleEdit, variant: 'primary' },
            { label: 'Delete', onClick: (row) => handleDelete(row.studentId), variant: 'danger' }
          ]}
          itemsPerPage={15}
        />
      </div>

      <StudentModal 
        isOpen={isModalOpen} 
        student={currentStudent} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave}
      />
    </div>
  );
}