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

const navSections = [
  {
    label: 'Workspace',
    items: [{ to: '/admin', label: 'Dashboard', icon: FaChartBar }]
  },
  {
    label: 'Management',
    items: [
      { to: '/admin/hostels', label: 'Manage Hostels', icon: FaUniversity },
      { to: '/admin/rooms', label: 'Manage Rooms', icon: FaBed },
      { to: '/admin/floors', label: 'Manage Floors', icon: FaBed },
      { to: '/admin/students', label: 'Manage Students', icon: FaGraduationCap },
      { to: '/admin/bookings', label: 'Manage Bookings', icon: FaFileAlt },
      { to: '/admin/terms', label: 'Academic Terms', icon: FaCalendarAlt },
      { to: '/admin/payments', label: 'Manage Payments', icon: FaCreditCard },
      { to: '/admin/reports', label: 'View Reports', icon: FaChartBar }
    ]
  }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const displayName = user?.fullName || 'Administrator';

  return (
    <div className="admin-theme min-h-screen bg-[#e4e0d9] px-2 py-2 text-neutral-900 dark:bg-[#101312] sm:px-4 sm:py-4">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] max-w-[1760px] overflow-hidden rounded-[34px] border border-white/80 bg-[#f7f5ef] shadow-[0_28px_80px_rgba(15,23,42,0.12)] ring-1 ring-black/5 dark:border-neutral-800 dark:bg-[#141917] dark:shadow-[0_28px_80px_rgba(0,0,0,0.45)] sm:min-h-[calc(100vh-2rem)]">
        <aside className="w-full border-b border-black/5 bg-[#f8f7f2] lg:min-h-full lg:w-[308px] lg:border-b-0 lg:border-r dark:border-white/5 dark:bg-[#171c1a]">
          <div className="flex h-full flex-col px-4 py-5 sm:px-5 lg:px-6 lg:py-7">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#0f6b46] text-base font-black text-white shadow-[0_16px_32px_rgba(15,107,70,0.32)]">
                H
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold tracking-tight text-neutral-900 dark:text-white">
                  Hostel Admin
                </p>
                <p className="truncate text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400 dark:text-neutral-500">
                  Management Suite
                </p>
              </div>
            </Link>

            <div className="mt-6 rounded-[28px] bg-gradient-to-br from-[#156b48] via-[#1a7a55] to-[#0f5e40] p-5 text-white shadow-[0_24px_50px_rgba(15,107,70,0.28)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/70">
                Admin profile
              </p>
              <div className="mt-4 flex items-center gap-3">
                <UserAvatar
                  user={user}
                  fallbackName={displayName}
                  className="h-11 w-11 text-sm ring-[3px] ring-white/25"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{displayName}</p>
                  <p className="truncate text-xs text-white/70">Operations lead</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/78">
                Monitor allocations, payments, reports, and room operations from one calm workspace.
              </p>
            </div>

            <nav className="mt-6 overflow-x-auto lg:mt-8 lg:overflow-visible">
              <div className="flex gap-3 pb-1 lg:block lg:space-y-6">
                {navSections.map((section) => (
                  <div key={section.label} className="min-w-max lg:min-w-0">
                    <p className="mb-3 hidden px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400 lg:block dark:text-neutral-500">
                      {section.label}
                    </p>
                    <div className="flex gap-2 lg:flex-col lg:gap-2">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/admin'}
                            className={({ isActive }) =>
                              `group inline-flex min-w-max items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-semibold transition-all duration-200 lg:w-full ${
                                isActive
                                  ? 'bg-white text-[#0f6b46] shadow-[0_16px_34px_rgba(15,23,42,0.08)] ring-1 ring-[#d8e6dc] dark:bg-[#0f1f19] dark:text-[#74d2a4] dark:ring-[#214838]'
                                  : 'text-neutral-500 hover:bg-white/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-[#202624] dark:hover:text-neutral-100'
                              }`
                            }
                          >
                            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#eef3ee] text-[#5c6d60] transition-all duration-200 group-hover:bg-[#e1efe5] group-hover:text-[#0f6b46] dark:bg-[#202624] dark:text-neutral-300 dark:group-hover:bg-[#163c2c] dark:group-hover:text-[#7cd1a8]">
                              <Icon className="text-sm" aria-hidden="true" />
                            </span>
                            <span className="whitespace-nowrap">{item.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </nav>

            <div className="mt-auto hidden rounded-[26px] border border-[#e4ebe3] bg-white/92 p-5 text-sm text-neutral-600 shadow-[0_16px_40px_rgba(15,23,42,0.06)] lg:block dark:border-[#223029] dark:bg-[#111816] dark:text-neutral-300">
              <p className="font-semibold text-neutral-900 dark:text-white">Operations Center</p>
              <p className="mt-2 leading-6 text-neutral-500 dark:text-neutral-400">
                Track rooms, payments, bookings, academic terms, and reports from one admin workspace.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-full min-w-0 flex-1 flex-col bg-[#f3f1ea] dark:bg-[#121614]">
          <header className="border-b border-black/5 bg-[#f6f4ee]/92 px-4 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-[#f6f4ee]/82 sm:px-6 lg:px-8 dark:border-white/5 dark:bg-[#151a18]/92 dark:supports-[backdrop-filter]:bg-[#151a18]/82">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400 dark:text-neutral-500">
                  University Hostel
                </p>
                <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Admin workspace for live operations and reporting
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="admin-toolbar-chip">
                  {new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>

                <div className="admin-theme-toggle">
                  <ThemeToggle />
                </div>

                <div className="admin-toolbar-chip hidden sm:flex sm:items-center sm:gap-3 sm:pr-4">
                  <UserAvatar
                    user={user}
                    fallbackName={displayName}
                    className="h-10 w-10 text-sm ring-[3px] ring-[#eef3ee] dark:ring-[#1f2e28]"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                      Administrator
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d9e6dd] bg-white px-4 py-2.5 text-sm font-semibold text-[#0f6b46] transition-all duration-200 hover:-translate-y-px hover:border-[#bad3c1] hover:bg-[#f3faf5] hover:shadow-[0_12px_24px_rgba(15,107,70,0.12)] dark:border-[#244235] dark:bg-[#101816] dark:text-[#7dd2a8] dark:hover:border-[#2e5a47] dark:hover:bg-[#12201b]"
                >
                  <FaSignOutAlt aria-hidden="true" className="text-xs" />
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <Outlet />
          </main>

          <footer className="border-t border-black/5 px-4 py-5 text-center text-sm text-neutral-500 dark:border-white/5 dark:text-neutral-400">
            Copyright {new Date().getFullYear()} University Hostel Management System. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
}
