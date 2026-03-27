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
    label: 'Menu',
    items: [
      { to: '/admin', label: 'Dashboard', icon: FaChartBar },
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
    <div className="admin-theme min-h-screen bg-[#e4e0d9] px-2 py-2 text-neutral-900 dark:bg-[radial-gradient(circle_at_top,rgba(66,139,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(27,178,170,0.12),transparent_24%),linear-gradient(180deg,#121519_0%,#191b1f_52%,#121418_100%)] sm:px-4 sm:py-4">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] max-w-[1760px] overflow-hidden rounded-[34px] border border-white/80 bg-[#f7f5ef] shadow-[0_28px_80px_rgba(15,23,42,0.12)] ring-1 ring-black/5 dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(32,34,39,0.98)_0%,rgba(24,26,31,0.98)_100%)] dark:shadow-[0_32px_86px_rgba(0,0,0,0.56)] sm:min-h-[calc(100vh-2rem)]">
        <aside className="w-full border-b border-black/5 bg-[#f8f7f2] lg:min-h-full lg:w-[292px] lg:border-b-0 lg:border-r dark:border-white/8 dark:bg-[linear-gradient(180deg,#1b1d22_0%,#16181d_100%)]">
          <div className="flex h-full flex-col px-4 py-4 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#0f6b46] text-base font-black text-white shadow-[0_16px_32px_rgba(15,107,70,0.32)] dark:border dark:border-[#5d88d6]/30 dark:bg-[linear-gradient(135deg,#428bff_0%,#2b5db7_100%)] dark:shadow-[0_20px_38px_rgba(7,14,29,0.54)]">
                H
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold tracking-tight text-neutral-900 dark:text-white">
                  Hostel Admin
                </p>
                <p className="truncate text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400 dark:text-white/36">
                  Management Suite
                </p>
              </div>
            </Link>

            <div className="mt-4 rounded-[28px] bg-gradient-to-br from-[#156b48] via-[#1a7a55] to-[#0f5e40] p-4 text-white shadow-[0_24px_50px_rgba(15,107,70,0.28)] dark:border dark:border-white/8 dark:bg-[linear-gradient(145deg,rgba(66,139,255,0.3)_0%,rgba(27,178,170,0.12)_34%,rgba(24,26,31,0.98)_100%)] dark:shadow-[0_28px_58px_rgba(0,0,0,0.44)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/70">
                Admin profile
              </p>
              <div className="mt-3 flex items-center gap-3">
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
              <p className="mt-3 text-sm leading-6 text-white/78">
                Monitor allocations, payments, reports, and room operations from one calm workspace.
              </p>
            </div>

            <nav className="mt-4 overflow-x-auto lg:mt-5 lg:overflow-visible">
              <div className="flex gap-2.5 pb-1 lg:block lg:space-y-2">
                {navSections.map((section) => (
                  <div key={section.label} className="min-w-max lg:min-w-0">
                    <p className="mb-1.5 hidden px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400 lg:block dark:text-white/36">
                      {section.label}
                    </p>
                    <div className="flex gap-2 lg:flex-col lg:gap-1.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/admin'}
                            className={({ isActive }) =>
                              `group inline-flex min-w-max items-center gap-2.5 rounded-[18px] px-3.5 py-2 text-sm font-semibold transition-all duration-200 lg:w-full ${
                                isActive
                                  ? 'bg-white text-[#0f6b46] shadow-[0_16px_34px_rgba(15,23,42,0.08)] ring-1 ring-[#d8e6dc] dark:bg-[linear-gradient(135deg,rgba(66,139,255,0.22),rgba(27,178,170,0.12))] dark:text-white dark:ring-white/10 dark:shadow-[0_18px_38px_rgba(0,0,0,0.42)]'
                                  : 'text-neutral-500 hover:bg-white/80 hover:text-neutral-900 dark:text-white/64 dark:hover:bg-white/[0.04] dark:hover:text-white'
                              }`
                            }
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#eef3ee] text-[#5c6d60] transition-all duration-200 group-hover:bg-[#e1efe5] group-hover:text-[#0f6b46] dark:border dark:border-white/8 dark:bg-[#202227] dark:text-white/68 dark:group-hover:border-[#428bff]/20 dark:group-hover:bg-[rgba(66,139,255,0.12)] dark:group-hover:text-[#9fc3ff]">
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

            <div className="mt-auto hidden rounded-[24px] border border-[#e4ebe3] bg-white/92 p-4 text-sm text-neutral-600 shadow-[0_16px_40px_rgba(15,23,42,0.06)] lg:block dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(33,35,40,0.98),rgba(24,26,31,0.98))] dark:text-white/64 dark:shadow-[0_18px_40px_rgba(0,0,0,0.34)]">
              <p className="font-semibold text-neutral-900 dark:text-white">Operations Center</p>
              <p className="mt-2 leading-6 text-neutral-500 dark:text-white/52">
                Track rooms, payments, bookings, academic terms, and reports from one admin workspace.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-full min-w-0 flex-1 flex-col bg-[#f3f1ea] dark:bg-[linear-gradient(180deg,#1c1f24_0%,#16181d_100%)]">
          <header className="border-b border-black/5 bg-[#f6f4ee]/92 px-4 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-[#f6f4ee]/82 sm:px-6 lg:px-8 dark:border-white/6 dark:bg-[rgba(28,31,36,0.88)] dark:supports-[backdrop-filter]:bg-[rgba(28,31,36,0.8)]">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400 dark:text-white/36">
                  University Hostel
                </p>
                <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-white/56">
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
                    className="h-10 w-10 text-sm ring-[3px] ring-[#eef3ee] dark:ring-white/8"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-neutral-500 dark:text-white/52">
                      Administrator
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d9e6dd] bg-white px-4 py-2.5 text-sm font-semibold text-[#0f6b46] transition-all duration-200 hover:-translate-y-px hover:border-[#bad3c1] hover:bg-[#f3faf5] hover:shadow-[0_12px_24px_rgba(15,107,70,0.12)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(33,35,40,0.96)_0%,rgba(24,26,31,0.96)_100%)] dark:text-white/87 dark:hover:border-[#428bff]/24 dark:hover:bg-[linear-gradient(180deg,rgba(42,45,50,0.98)_0%,rgba(30,33,38,0.98)_100%)] dark:hover:shadow-[0_16px_30px_rgba(0,0,0,0.34)]"
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

          <footer className="border-t border-black/5 px-4 py-5 text-center text-sm text-neutral-500 dark:border-white/6 dark:text-white/52">
            Copyright {new Date().getFullYear()} University Hostel Management System. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
}
