import { Link, NavLink, Outlet } from 'react-router-dom';
import { FaBed, FaChartBar, FaCreditCard, FaHome, FaSignOutAlt, FaUser, FaWrench } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../ThemeToggle.jsx';
import UserAvatar from '../UserAvatar.jsx';

const navItems = [
  { to: '/student', label: 'Dashboard', icon: FaChartBar },
  { to: '/student/apply', label: 'Apply for Hostel', icon: FaHome },
  { to: '/student/preferences', label: 'Room Preferences', icon: FaWrench },
  { to: '/student/booking', label: 'My Booking', icon: FaBed },
  { to: '/student/payments', label: 'My Payments', icon: FaCreditCard },
  { to: '/student/profile', label: 'Profile', icon: FaUser }
];

export default function StudentLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-cream-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:border-neutral-800 dark:bg-surface-dark/95 dark:supports-[backdrop-filter]:bg-surface-dark/85">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/student" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-sm font-bold text-white shadow-sm">
              H
            </div>
            <span className="text-base font-semibold text-neutral-900 dark:text-white sm:text-lg">Student Portal</span>
          </Link>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-4">
            <div className="flex items-center gap-2">
              <UserAvatar user={user} fallbackName={user?.fullName || 'Student'} />
              <span className="hidden text-sm text-neutral-600 dark:text-neutral-300 sm:inline">
                {user?.fullName || 'Student'}
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
                  end={item.to === '/student'}
                  className={({ isActive }) =>
                    `inline-flex min-w-max items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 md:flex md:px-4 md:py-2.5 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-900/20 dark:text-primary-300'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:shadow-sm dark:text-neutral-300 dark:hover:bg-neutral-900'
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
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-surface-dark">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          © {new Date().getFullYear()} University Hostel Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
