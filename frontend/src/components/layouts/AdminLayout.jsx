import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../ThemeToggle.jsx';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/hostels', label: 'Manage Hostels', icon: '🏢' },
  { to: '/admin/rooms', label: 'Manage Rooms', icon: '🛏️' },
  { to: '/admin/bookings', label: 'Manage Bookings', icon: '📋' }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-sm">
              H
            </div>
            <span className="text-lg font-semibold text-neutral-900 dark:text-white">Admin Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              Admin
            </span>
            <span className="text-sm text-neutral-600 dark:text-neutral-300">
              {user?.fullName || 'Administrator'}
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
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
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
