import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { updateStudentProfile } from '../../services/studentService.js';
import UserAvatar from '../../components/UserAvatar.jsx';

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

  const imageUrlValidationError = validateProfileImageUrl(form.profileImageUrl);

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

    if (imageUrlValidationError) {
      setError(imageUrlValidationError);
      return;
    }

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
            <label htmlFor="profile-image-url" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Profile Image URL
            </label>
            <div className="flex gap-2">
              <input
                id="profile-image-url"
                type="url"
                className={`input-field ${imageUrlValidationError ? 'border-red-400 focus:border-red-500 focus:ring-red-100 dark:border-red-500 dark:focus:ring-red-900/30' : ''}`}
                placeholder="https://example.com/my-photo.jpg"
                value={form.profileImageUrl}
                onChange={(e) => handleChange('profileImageUrl', e.target.value)}
              />
              <button
                type="button"
                className="btn-ghost whitespace-nowrap"
                onClick={handleRemovePhoto}
                disabled={!form.profileImageUrl}
              >
                Remove
              </button>
            </div>
            <p className="section-subtitle text-neutral-500 dark:text-neutral-400">
              Add a public image link to show your photo in the navbar.
            </p>
            {imageUrlValidationError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{imageUrlValidationError}</p>
            )}
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
            disabled={loading || Boolean(imageUrlValidationError)}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

function validateProfileImageUrl(value) {
  if (!value) return '';

  // Data URIs are allowed but with size limit to prevent database bloat
  // 50KB limit for base64 encoded images (approximately 37KB of actual image data)
  if (value.startsWith('data:image/')) {
    const MAX_DATA_URI_LENGTH = 50000; // 50KB
    if (value.length > MAX_DATA_URI_LENGTH) {
      return 'Image data URL is too large (max 50KB). Please use a hosted image URL instead.';
    }
    return '';
  }

  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'Image URL must start with http:// or https://';
    }
  } catch {
    return 'Please enter a valid image URL';
  }

  return '';
}
