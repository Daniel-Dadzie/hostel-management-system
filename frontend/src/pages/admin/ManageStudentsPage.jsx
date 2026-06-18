import { useEffect, useMemo, useState } from 'react';
import { listStudents, deleteStudent, updateStudent, createStudent } from '../../services/studentService.js';
import DataTable from '../../components/admin/DataTable.jsx';
import Alert from '../../components/admin/Alert.jsx';
import StudentModal from '../../components/admin/StudentModal.jsx';

export default function ManageStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const data = await listStudents();
      setStudents(Array.isArray(data) ? data : []);
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

  async function handleSave(data) {
    try {
      if (currentStudent?.id) {
        await updateStudent(currentStudent.id, data);
      } else {
        await createStudent(data);
      }
      setIsModalOpen(false);
      setCurrentStudent(null);
      await loadStudents();
    } catch (err) {
      setError(`Operation failed: ${err.message}`);
    }
  }

  async function handleDelete(studentId) {
    if (!window.confirm('Are you sure? This will permanently delete this student record.')) return;
    try {
      await deleteStudent(studentId);
      await loadStudents();
    } catch (err) {
      setError(`Failed to delete: ${err.message}`);
    }
  }

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      student.fullName?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query)
    );
  }, [students, search]);

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="card space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Student Directory</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {loading ? 'Loading students...' : `${filteredStudents.length} student${filteredStudents.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setCurrentStudent(null); setIsModalOpen(true); }}
            className="btn-primary px-4 py-2"
          >
            + Add Student
          </button>
        </div>

        {loading ? (
          <div className="rounded-[24px] border border-[#e3e9df] bg-[#fbfcfa] p-8 text-center shadow-[0_12px_28px_rgba(15,23,42,0.04)] dark:border-[#223129] dark:bg-[#141a17]">
            <p className="text-neutral-600 dark:text-neutral-400">Loading students...</p>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'fullName', label: 'Name', sortable: true },
              { key: 'email', label: 'Email', sortable: true },
              { key: 'role', label: 'Role', sortable: true }
            ]}
            data={filteredStudents}
            actions={[
              { label: 'Edit', onClick: handleEdit, variant: 'primary' },
              { label: 'Delete', onClick: (row) => handleDelete(row.id), variant: 'danger' }
            ]}
            emptyMessage="No students found"
            itemsPerPage={15}
          />
        )}
      </div>

      <StudentModal
        isOpen={isModalOpen}
        student={currentStudent}
        onClose={() => { setIsModalOpen(false); setCurrentStudent(null); }}
        onSave={handleSave}
      />
    </div>
  );
}
