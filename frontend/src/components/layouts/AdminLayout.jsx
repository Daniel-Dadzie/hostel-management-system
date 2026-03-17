import { Link, NavLink, Outlet } from 'react-router-dom';
import { useRef, useState } from 'react';
import {
  FaBed,
  FaChartBar,
  FaCreditCard,
  FaFileAlt,
  FaGraduationCap,
  FaSignOutAlt,
  FaUniversity
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../ThemeToggle.jsx';
import UserAvatar from '../UserAvatar.jsx';
import { uploadImage } from '../../services/uploadService.js';
import { updateMyProfile } from '../../services/profileService.js';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FaChartBar },
  { to: '/admin/hostels', label: 'Manage Hostels', icon: FaUniversity },
  { to: '/admin/rooms', label: 'Manage Rooms', icon: FaBed },
  { to: '/admin/floors', label: 'Manage Floors', icon: FaBed },
  { to: '/admin/students', label: 'Manage Students', icon: FaGraduationCap },
  { to: '/admin/bookings', label: 'Manage Bookings', icon: FaFileAlt },
  { to: '/admin/payments', label: 'Manage Payments', icon: FaCreditCard },
  { to: '/admin/reports', label: 'View Reports', icon: FaChartBar }
];

export default function AdminLayout() {
  const { user, setUser, logout } = useAuth();
  const avatarInputRef = useRef(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoError, setPhotoError] = useState('');

  function triggerAvatarUpload() {
    if (!photoSaving) {
      avatarInputRef.current?.click();
    }
  }

  async function handleAvatarFileSelect(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Selected image is too large.');
      return;
    }

    await handleAdminPhotoChange(file);
  }

  async function handleAdminPhotoChange(file) {
    setPhotoError('');
    setPhotoSaving(true);

    try {
      const profileImagePath = await uploadImage(file);
      // Only update profileImagePath, preserve existing name and phone
      const updatedProfile = await updateMyProfile({
        fullName: user?.fullName,
        phone: user?.phone,
        profileImagePath
      });
      setUser(updatedProfile);
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Failed to update admin photo.');
    } finally {
      setPhotoSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:border-neutral-800 dark:bg-surface-dark/95 dark:supports-[backdrop-filter]:bg-surface-dark/85">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-800 text-sm font-bold text-white shadow-md ring-1 ring-white/20">
              H
            </div>
            <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white sm:text-[17px]">Admin Portal</span>
          </Link>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-4">
            <span className="hidden rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-900 dark:bg-accent-900/30 dark:text-accent-200 sm:inline-flex">
              Admin
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerAvatarUpload}
                disabled={photoSaving}
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/60 disabled:cursor-not-allowed disabled:opacity-70"
                title={photoSaving ? 'Saving photo...' : 'Tap to upload profile photo'}
                aria-label="Upload admin profile photo"
              >
                <UserAvatar user={user} fallbackName={user?.fullName || 'Administrator'} />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileSelect}
              />
              <span className="hidden text-sm text-neutral-600 dark:text-neutral-300 sm:inline">
                {user?.fullName || 'Administrator'}
              </span>
            </div>
            <ThemeToggle />
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-red-700 sm:px-3"
            >
              <FaSignOutAlt aria-hidden="true" className="text-sm" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="border-b border-neutral-200 bg-white/95 dark:border-neutral-800 dark:bg-surface-dark/95 md:w-64 md:shrink-0 md:border-b-0 md:border-r">
          <nav className="overflow-x-auto p-3 md:sticky md:top-[57px] md:space-y-1 md:p-4">
            <div className="flex gap-2 md:block md:space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) =>
                    `inline-flex min-w-max items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 md:flex md:px-4 md:py-2.5 ${
                      isActive
                        ? 'bg-primary-50 font-semibold text-primary-700 ring-1 ring-primary-200/80 dark:bg-primary-900/25 dark:text-primary-300 dark:ring-primary-800/40'
                        : 'text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'
                    }`
                  }
                >
                  <Icon className="text-sm" aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 animate-fade-in p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {photoError && (
        <div className="mx-auto mt-2 w-full max-w-7xl px-4">
          <div className="alert-error">{photoError}</div>
        </div>
      )}

      <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-surface-dark">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          © {new Date().getFullYear()} University Hostel Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
