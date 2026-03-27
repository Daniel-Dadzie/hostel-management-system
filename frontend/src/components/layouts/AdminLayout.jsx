import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  FaBed,
  FaCalendarAlt,
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

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FaChartBar },
  { to: '/admin/hostels', label: 'Manage Hostels', icon: FaUniversity },
  { to: '/admin/rooms', label: 'Manage Rooms', icon: FaBed },
  { to: '/admin/floors', label: 'Manage Floors', icon: FaBed },
  { to: '/admin/students', label: 'Manage Students', icon: FaGraduationCap },
  { to: '/admin/bookings', label: 'Manage Bookings', icon: FaFileAlt },
  { to: '/admin/terms', label: 'Academic Terms', icon: FaCalendarAlt },
  { to: '/admin/payments', label: 'Manage Payments', icon: FaCreditCard },
  { to: '/admin/reports', label: 'View Reports', icon: FaChartBar }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f4f1eb] text-neutral-900 dark:bg-neutral-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-black/5 bg-[#fbfaf8] lg:min-h-screen lg:w-[280px] lg:border-b-0 lg:border-r lg:border-r-black/5 dark:border-neutral-800 dark:bg-surface-dark">
          <div className="flex h-full flex-col px-4 py-5 sm:px-5 lg:px-6 lg:py-7">
            <Link to="/admin" className="flex items-center gap-3 border-b border-black/5 pb-5 dark:border-neutral-800">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4c400] text-sm font-black text-neutral-900 shadow-[0_10px_25px_rgba(244,196,0,0.25)]">
                H
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-neutral-900 dark:text-white">Hostel Admin</p>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">Management</p>
              </div>
            </Link>

            <div className="mt-5 rounded-[26px] bg-[#f4c400] p-4 text-neutral-900 shadow-[0_22px_50px_rgba(244,196,0,0.28)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-800/70">Welcome back</p>
              <div className="mt-3 flex items-center gap-3">
                <UserAvatar user={user} fallbackName={user?.fullName || 'Administrator'} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{user?.fullName || 'Administrator'}</p>
                  <p className="truncate text-xs text-neutral-800/70">Admin Portal</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  <FaSignOutAlt aria-hidden="true" className="text-xs" />
                  Logout
                </button>
              </div>
            </div>

            <nav className="mt-6 overflow-x-auto lg:mt-8 lg:overflow-visible">
              <div className="flex gap-2 pb-1 lg:block lg:space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/admin'}
                      className={({ isActive }) =>
                        `group inline-flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 lg:flex lg:w-full ${
                          isActive
                            ? 'bg-white text-neutral-900 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-black/5 dark:bg-neutral-900 dark:text-white dark:ring-neutral-800'
                            : 'text-neutral-500 hover:bg-white/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900/70 dark:hover:text-neutral-200'
                        }`
                      }
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 transition group-hover:bg-[#f4c400] group-hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:bg-[#f4c400] dark:group-hover:text-neutral-900">
                        <Icon className="text-sm" aria-hidden="true" />
                      </span>
                      <span className="whitespace-nowrap">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </nav>

            <div className="mt-auto hidden rounded-[24px] border border-black/5 bg-white p-4 shadow-[0_15px_35px_rgba(15,23,42,0.06)] lg:block dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-sm font-bold text-neutral-900 dark:text-white">University Hostel System</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                Manage rooms, payments, bookings, academic terms and reports from one dashboard.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="border-b border-black/5 bg-[#f4f1eb]/90 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-[#f4f1eb]/75 sm:px-6 lg:px-8 dark:border-neutral-800 dark:bg-neutral-950/90 dark:supports-[backdrop-filter]:bg-neutral-950/80">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400 dark:text-neutral-500">Admin workspace</p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">Dashboard</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-600 shadow-[0_8px_24px_rgba(15,23,42,0.05)] ring-1 ring-black/5 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800">
                  {new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <div className="hidden items-center gap-3 rounded-full bg-white px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.05)] ring-1 ring-black/5 sm:flex dark:bg-neutral-900 dark:ring-neutral-800">
                  <UserAvatar user={user} fallbackName={user?.fullName || 'Administrator'} />
                  <div className="pr-1">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">{user?.fullName || 'Administrator'}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 animate-fade-in px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>

          <footer className="border-t border-black/5 bg-[#f8f5ef] px-4 py-5 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
            © {new Date().getFullYear()} University Hostel Management System. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
}
