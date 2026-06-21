import { useEffect, useState } from 'react';

export default function StudentModal({ isOpen, onClose, student, onSave }) {
  const [formData, setFormData] = useState({ fullName: '', email: '', role: 'STUDENT' });

  useEffect(() => {
    setFormData({
      fullName: student?.fullName ?? student?.studentName ?? '',
      email: student?.email ?? student?.studentEmail ?? '',
      role: student?.role ?? 'STUDENT'
    });
  }, [student]);

  if (!isOpen) return null;

  function handleSubmit(event) {
    event.preventDefault();
    onSave(formData);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl dark:bg-[#141a17]">
        <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">
          {student ? 'Edit Student' : 'Add New Student'}
        </h2>
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <span>Full Name</span>
            <input
              className="mt-1 w-full rounded-lg border p-2 dark:border-neutral-700 dark:bg-[#1a221f] dark:text-white"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
              required
            />
          </label>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <span>Email</span>
            <input
              className="mt-1 w-full rounded-lg border p-2 dark:border-neutral-700 dark:bg-[#1a221f] dark:text-white"
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              required
            />
          </label>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <span>Role</span>
            <select
              className="mt-1 w-full rounded-lg border p-2 dark:border-neutral-700 dark:bg-[#1a221f] dark:text-white"
              value={formData.role}
              onChange={(event) => setFormData({ ...formData, role: event.target.value })}
              required
            >
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-neutral-600 dark:text-neutral-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-primary-600 px-4 py-2 text-white"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
