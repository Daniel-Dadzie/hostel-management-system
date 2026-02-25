import { useEffect, useMemo, useState } from 'react';
import { listAdminBookings } from '../../services/bookingService.js';

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
        <h1 className="page-title text-neutral-900 dark:text-white">Manage Students</h1>
        <p className="body-text mt-1 text-neutral-600 dark:text-neutral-400">
          Student overview based on booking activity.
        </p>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="body-text text-neutral-500 dark:text-neutral-400">Total Students</p>
          <p className="card-header mt-2 text-neutral-900 dark:text-white">{students.length}</p>
        </div>
        <div className="card">
          <p className="body-text text-neutral-500 dark:text-neutral-400">With Approved Booking</p>
          <p className="card-header mt-2 text-neutral-900 dark:text-white">
            {students.filter((item) => item.approvedBookings > 0).length}
          </p>
        </div>
        <div className="card">
          <p className="body-text text-neutral-500 dark:text-neutral-400">Pending Payment</p>
          <p className="card-header mt-2 text-neutral-900 dark:text-white">
            {students.filter((item) => item.pendingBookings > 0).length}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="card-header text-neutral-900 dark:text-white">Student List</h2>
          <input
            className="input-field sm:max-w-sm"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-4 space-y-3 md:hidden">
          {filteredStudents.map((student) => (
            <div key={student.studentId} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              <p className="font-medium text-neutral-900 dark:text-white">{student.studentName}</p>
              <p className="body-text text-neutral-500 dark:text-neutral-400">{student.studentEmail}</p>
              <p className="body-text mt-2 text-neutral-600 dark:text-neutral-300">
                {student.totalBookings} total · {student.approvedBookings} approved · {student.pendingBookings} pending
              </p>
              <p className="body-text text-neutral-600 dark:text-neutral-300">
                Latest: {student.latestHostel} / {student.latestRoom}
              </p>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <div className="rounded-lg border border-neutral-200 p-3 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              No students found.
            </div>
          )}
        </div>

        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Student</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Email</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Bookings</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Latest Allocation</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.studentId} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="px-3 py-2 font-medium text-neutral-900 dark:text-white">{student.studentName}</td>
                  <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300">{student.studentEmail}</td>
                  <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300">
                    {student.totalBookings} total · {student.approvedBookings} approved · {student.pendingBookings} pending
                  </td>
                  <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300">
                    {student.latestHostel} / {student.latestRoom}
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td className="px-3 py-3 text-neutral-500 dark:text-neutral-400" colSpan={4}>
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
