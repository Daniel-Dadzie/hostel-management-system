import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { updateStudentProfile } from '../../services/studentService.js';
import UserAvatar from '../../components/UserAvatar.jsx';
import ImageUploadField from '../../components/ImageUploadField.jsx';

export default function ProfilePage() {
  const { user, loadProfile } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    profileImageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        profileImageUrl: user.profileImageUrl || ''
      });
    }
  }, [user]);

  function handleChange(field, value) {
    setSuccess('');
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleRemovePhoto() {
    setSuccess('');
    setForm((prev) => ({ ...prev, profileImageUrl: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    setLoading(true);

    try {
      await updateStudentProfile(form);
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
      <h1 className="page-title mb-6 text-neutral-900 dark:text-white">My Profile</h1>

      <div className="card">
        {/* Avatar Section */}
        <div className="mb-6 flex items-center gap-4">
          <UserAvatar user={{ ...user, profileImageUrl: form.profileImageUrl }} fallbackName={form.fullName || user?.fullName || 'Student'} className="h-16 w-16 text-xl" />
          <div>
            <h2 className="card-header text-neutral-900 dark:text-white">
              {user?.fullName || 'Student'}
            </h2>
            <p className="body-text text-neutral-500 dark:text-neutral-400">{user?.email}</p>
          </div>
        </div>

        {error && (
          <div className="alert-error mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="alert-success mb-4">
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
            <p className="section-subtitle text-neutral-500 dark:text-neutral-400">
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
            <ImageUploadField
              id="profile-image"
              label="Profile Photo"
              value={form.profileImageUrl}
              onChange={(value) => handleChange('profileImageUrl', value)}
              onError={setError}
              onClear={handleRemovePhoto}
              helperText="Upload an image or take a picture with your camera."
              maxDataUrlLength={50000}
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
            <p className="section-subtitle text-neutral-500 dark:text-neutral-400">
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
