import { Link, NavLink, Outlet } from 'react-router-dom';
import { useRef, useState } from 'react';
import {
  FaBed,
  FaBuilding,
  FaChartBar,
  FaCreditCard,
  FaExclamationCircle,
  FaSignOutAlt,
  FaUser,
  FaWrench,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../ThemeToggle.jsx';
import UserAvatar from '../UserAvatar.jsx';
import { uploadImage } from '../../services/uploadService.js';
import { updateMyProfile } from '../../services/profileService.js';

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard', icon: FaChartBar },
  { to: '/student/hostels', label: 'Apply for Hostel', icon: FaBuilding },
  { to: '/student/preferences', label: 'Room Preferences', icon: FaWrench },
  { to: '/student/booking', label: 'My Booking', icon: FaBed },
  { to: '/student/payments', label: 'My Payments', icon: FaCreditCard },
  { to: '/student/complaints', label: 'Complaints', icon: FaExclamationCircle },
  { to: '/student/profile', label: 'Profile', icon: FaUser }
];

function SidebarNav({ onNavClick }) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400 dark:text-white/30">
        Navigation
      </p>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/student/dashboard'}
            onClick={onNavClick}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#0f6b46] text-white shadow-[0_8px_20px_rgba(15,107,70,0.28)] hover:bg-[#0d5a3a] hover:shadow-[0_12px_24px_rgba(15,107,70,0.35)]'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-white/50 dark:hover:bg-white/6 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] transition-all ${
                  isActive
                    ? 'bg-white/20'
                    : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 dark:bg-white/6 dark:text-white/40 dark:group-hover:bg-white/10'
                }`}>
                  <Icon className="text-sm" aria-hidden="true" />
                </span>
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function StudentLayout() {
  const { user, setUser, logout } = useAuth();
  const avatarInputRef = useRef(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const displayName = user?.fullName || 'Student';

  function triggerAvatarUpload() {
    if (!photoSaving) avatarInputRef.current?.click();
  }

  async function handleAvatarFileSelect(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setPhotoError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setPhotoError('Selected image is too large.'); return; }
    setPhotoSaving(true);
    setPhotoError('');
    try {
      const profileImagePath = await uploadImage(file);
      const updatedProfile = await updateMyProfile({ fullName: user?.fullName, phone: user?.phone, profileImagePath });
      setUser(updatedProfile);
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Failed to update profile photo.');
    } finally {
      setPhotoSaving(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f4f6] dark:bg-[#111318]">

      {/* ── Mobile backdrop ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Mobile sidebar drawer ── */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-[#16181d] lg:hidden ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0f6b46] text-sm font-black text-white">H</div>
            <span className="font-bold text-neutral-900 dark:text-white">Student Portal</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-white/8 dark:text-white/60"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
        <SidebarNav onNavClick={() => setMobileSidebarOpen(false)} />
      </div>

      {/* ── Static desktop sidebar ── */}
      <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-neutral-200 bg-white dark:border-white/8 dark:bg-[#16181d] lg:flex">
        {/* Sidebar header */}
        <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-5 dark:border-white/8">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] bg-[#0f6b46] text-sm font-black text-white shadow-[0_8px_20px_rgba(15,107,70,0.30)]">
            H
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight text-neutral-900 dark:text-white">Student Portal</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-white/30">Hostel System</p>
          </div>
        </div>

        {/* User mini-profile */}
        <div className="mx-4 my-3 rounded-[16px] bg-gradient-to-br from-[#0f6b46] to-[#0a5236] p-3.5 text-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={triggerAvatarUpload}
              disabled={photoSaving}
              className="flex-shrink-0 rounded-full ring-2 ring-white/30 transition hover:ring-white/60 disabled:opacity-70"
              title="Tap to change photo"
            >
              <UserAvatar user={user} fallbackName={displayName} className="h-10 w-10 text-xs" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{displayName}</p>
              <p className="truncate text-[11px] text-white/65">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarNav onNavClick={undefined} />
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-neutral-100 p-4 dark:border-white/8">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-[14px] px-3.5 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-red-50 dark:bg-red-900/20">
              <FaSignOutAlt className="text-sm" />
            </span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Right column: navbar + scrollable main + static footer ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* ── Sticky navbar ── */}
        <header className="sticky top-0 z-30 flex flex-shrink-0 items-center justify-between border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-white/8 dark:bg-[#16181d]/90 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 lg:hidden dark:border-white/10 dark:bg-white/6 dark:text-white/60"
              aria-label="Open menu"
            >
              <FaBars className="text-sm" />
            </button>
            <div>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">Student Dashboard</p>
              <p className="hidden text-xs text-neutral-400 sm:block dark:text-white/30">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {/* Avatar — clickable to upload, desktop only */}
            <button
              type="button"
              onClick={triggerAvatarUpload}
              disabled={photoSaving}
              className="hidden rounded-full ring-2 ring-[#0f6b46]/20 transition hover:ring-[#0f6b46]/50 disabled:opacity-70 sm:block"
              title="Change profile photo"
            >
              <UserAvatar user={user} fallbackName={displayName} className="h-9 w-9 text-xs" />
            </button>
            <span className="hidden text-sm font-semibold text-neutral-700 dark:text-white/70 sm:block">{displayName}</span>
            {/* Mobile logout */}
            <button
              type="button"
              onClick={logout}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-red-500 hover:bg-red-50 lg:hidden dark:border-white/10 dark:bg-white/6"
            >
              <FaSignOutAlt className="text-sm" />
            </button>
          </div>

          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFileSelect} />
        </header>

        {/* ── Scrollable main content ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          {photoError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
              {photoError}
            </div>
          )}
          <Outlet />
        </main>

        {/* ── Static footer ── */}
        <footer className="flex-shrink-0 border-t border-neutral-200 bg-white px-6 py-4 text-center text-xs text-neutral-400 dark:border-white/8 dark:bg-[#16181d] dark:text-white/30">
          © {new Date().getFullYear()} University Hostel Management System. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
