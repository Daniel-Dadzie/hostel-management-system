import { useState, useEffect } from 'react';

export default function StudentModal({ isOpen, onClose, student, onSave }) {
  const [formData, setFormData] = useState({ fullName: '', email: '' });

  useEffect(() => {
    if (student) setFormData({ fullName: student.studentName, email: student.studentEmail });
    else setFormData({ fullName: '', email: '' });
  }, [student]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl dark:bg-[#141a17]">
        <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">
          {student ? 'Edit Student' : 'Add New Student'}
        </h2>
        <div className="space-y-4">
          <input 
            className="w-full rounded-lg border p-2 dark:border-neutral-700 dark:bg-[#1a221f] dark:text-white"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          />
          <input 
            className="w-full rounded-lg border p-2 dark:border-neutral-700 dark:bg-[#1a221f] dark:text-white"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-neutral-600 dark:text-neutral-400">Cancel</button>
          <button 
            onClick={() => onSave(formData)} 
            className="rounded-full bg-primary-600 px-4 py-2 text-white"
          >Save Changes</button>
        </div>
      </div>
    </div>
  );
}