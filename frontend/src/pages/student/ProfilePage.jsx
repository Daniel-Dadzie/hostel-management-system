import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiRequest } from '../../api/client.js';

export default function ProfilePage() {
  const { user, loadProfile } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiRequest('/api/student/profile', {
        method: 'PUT',
        body: form,
        headers: { Authorization: `Bearer ${localStorage.getItem('hms.token')}` }
      });
      setSuccess('Profile updated successfully!');
      loadProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">My Profile</h1>

      <div className="card">
        {/* Avatar Section */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {user?.fullName || 'Student'}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{user?.email}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="profile-fullname" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Full Name
            </label>
            <input
              id="profile-fullname"
              type="text"
              className="input-field"
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              className="input-field bg-neutral-50 dark:bg-neutral-800"
              value={user?.email || ''}
              disabled
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label htmlFor="profile-phone" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Phone
            </label>
            <input
              id="profile-phone"
              type="tel"
              className="input-field"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="profile-gender" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Gender
            </label>
            <input
              id="profile-gender"
              type="text"
              className="input-field bg-neutral-50 dark:bg-neutral-800"
              value={user?.gender || ''}
              disabled
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Contact admin to change gender
            </p>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
