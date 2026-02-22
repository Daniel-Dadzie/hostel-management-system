import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../ThemeToggle.jsx';

const navItems = [
  { to: '/student', label: 'Dashboard', icon: '📊' },
  { to: '/student/apply', label: 'Apply for Hostel', icon: '🏠' },
  { to: '/student/booking', label: 'My Booking', icon: '📋' },
  { to: '/student/profile', label: 'Profile', icon: '👤' }
];

export default function StudentLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/student" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
              H
            </div>
            <span className="text-lg font-semibold text-neutral-900 dark:text-white">Student Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">
              {user?.fullName || 'Student'}
            </span>
            <ThemeToggle />
            <button
              onClick={logout}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-[57px] h-[calc(100vh-57px)] w-64 shrink-0 border-r border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/student'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
