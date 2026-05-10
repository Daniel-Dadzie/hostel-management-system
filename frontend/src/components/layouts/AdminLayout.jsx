import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import {
  FaBed,
  FaCalendarAlt,
  FaChartBar,
  FaCreditCard,
  FaFileAlt,
  FaGraduationCap,
  FaSignOutAlt,
  FaUniversity,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../ThemeToggle.jsx';
import UserAvatar from '../UserAvatar.jsx';
import Logo from '../Logo.jsx';

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const displayName = user?.fullName || 'Administrator';

  return (
    <div className="admin-theme min-h-screen bg-[#e4e0d9] px-2 py-2 text-neutral-900 dark:bg-neutral-950 sm:px-4 sm:py-4">
      <div className="mx-auto flex max-w-[1760px] h-[calc(100vh-1rem)] rounded-[34px] border border-white/80 bg-[#f7f5ef] shadow-[0_28px_80px_rgba(15,23,42,0.12)] ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-[0_32px_86px_rgba(0,0,0,0.45)] sm:h-[calc(100vh-2rem)]"
        {/* Sidebar: static, never scrolls */}
        <aside className="hidden lg:block w-[292px] border-r border-black/5 bg-[#f8f7f2] dark:border-neutral-800 dark:bg-neutral-900 h-full sticky top-0 z-20">
          <div className="flex h-full flex-col px-4 py-4 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
            <Link to="/admin" className="flex items-center gap-3">
              <Logo size="md" />
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold tracking-tight text-neutral-900 dark:text-white">
                  Hostel Admin
                </p>
                <p className="truncate text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400 dark:text-white/36">
                  Management Suite
                </p>
              </div>
            </Link>
            <nav className="mt-8 flex-1 flex flex-col justify-start">
              {navSections.map((section) => (
                <div key={section.label} className="mb-2">
                  <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400 dark:text-neutral-500">
                    {section.label}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === '/admin'}
                          className={({ isActive }) =>
                            `group flex items-center gap-2.5 rounded-[18px] px-3.5 py-2 text-sm font-semibold transition-all duration-200 w-full ${
                              isActive
                                ? 'bg-white text-[#0f6b46] shadow-[0_16px_34px_rgba(15,23,42,0.08)] ring-1 ring-[#d8e6dc] hover:bg-white hover:shadow-[0_24px_48px_rgba(15,107,70,0.15)] dark:bg-neutral-800 dark:text-emerald-400 dark:ring-neutral-700 dark:shadow-[0_12px_24px_rgba(0,0,0,0.3)] dark:hover:bg-neutral-700 dark:hover:text-emerald-300 dark:hover:shadow-[0_16px_32px_rgba(0,0,0,0.4)]'
                                : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
                            }`
                          }
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#eef3ee] text-[#5c6d60] transition-all duration-200 group-hover:bg-[#e1efe5] group-hover:text-[#0f6b46] dark:border dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500 dark:group-hover:border-neutral-600 dark:group-hover:bg-neutral-700 dark:group-hover:text-emerald-400">
                            <Icon className="text-sm" aria-hidden="true" />
                          </span>
                          <span className="whitespace-nowrap">{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>
        
        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden="true"
            />
            <aside className="absolute left-0 top-0 bottom-0 w-64 border-r border-black/5 bg-[#f8f7f2] dark:border-neutral-800 dark:bg-neutral-900 overflow-y-auto z-50">
              <div className="flex h-full flex-col px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <Link to="/admin" className="flex items-center gap-3" onClick={() => setMobileSidebarOpen(false)}>
                    <Logo size="sm" />
                    <div>
                      <p className="truncate text-sm font-extrabold text-neutral-900 dark:text-white">
                        Hostel Admin
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="Close sidebar"
                  >
                    <FaTimes className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  </button>
                </div>
                <nav className="mt-6 flex-1 flex flex-col">
                  {navSections.map((section) => (
                    <div key={section.label} className="mb-4">
                      <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400 dark:text-neutral-500">
                        {section.label}
                      </p>
                      <div className="flex flex-col gap-1">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              end={item.to === '/admin'}
                              onClick={() => setMobileSidebarOpen(false)}
                              className={({ isActive }) =>
                                `group flex items-center gap-2.5 rounded-[14px] px-3 py-2 text-sm font-semibold transition-all ${
                                  isActive
                                    ? 'bg-white text-[#0f6b46] dark:bg-neutral-800 dark:text-emerald-400'
                                    : 'text-neutral-500 hover:bg-white/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
                                }`
                              }
                            >
                              <Icon className="text-sm" aria-hidden="true" />
                              <span>{item.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
            </aside>
          </div>
        )}
        {/* Main area: flex column, navbar sticky, content scrollable */}
        <div className="flex min-h-full min-w-0 flex-1 flex-col bg-[#f3f1ea] dark:bg-neutral-950 h-full">
          {/* Sticky Navbar */}
          <header className="border-b border-black/5 bg-[#f6f4ee]/92 px-4 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-[#f6f4ee]/82 sm:px-6 lg:px-8 dark:border-neutral-800 dark:bg-neutral-900/88 dark:supports-[backdrop-filter]:bg-neutral-900/8 sticky top-0 z-10">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[12px] font-extrabold uppercase tracking-[0.28em] text-neutral-700 dark:text-neutral-200">
                    University Hostel
                  </p>
                  <p className="mt-1 text-base font-bold text-neutral-700 dark:text-neutral-300">
                    Admin workspace for live operations and reporting
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                  className="lg:hidden rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 dark:text-neutral-400 transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileSidebarOpen ? (
                    <FaTimes className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                  ) : (
                    <FaBars className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                  )}
                </button>
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
                    <p className="truncate text-sm font-bold text-neutral-900 dark:text-neutral-200">
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
                  className="inline-flex items-center gap-2 rounded-full border border-[#b91c1c] bg-[#b91c1c] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:border-[#991b1b] hover:bg-[#991b1b] hover:shadow-[0_12px_24px_rgba(185,28,28,0.18)] dark:border-[#b91c1c] dark:bg-[#b91c1c] dark:text-white dark:hover:border-[#991b1b] dark:hover:bg-[#991b1b] dark:hover:shadow-[0_16px_30px_rgba(185,28,28,0.34)]"
                >
                  <FaSignOutAlt aria-hidden="true" className="text-xs" />
                  Logout
                </button>
              </div>
            </div>
          </header>
          {/* Main content: scrollable, fills remaining space */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <Outlet />
          </main>
        </div>
      </div>
      {/* Static footer at the base of the page */}
      <footer className="w-full border-t border-black/5 px-4 py-5 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-500">
        Copyright {new Date().getFullYear()} University Hostel Management System. All rights reserved.
      </footer>
    </div>
  );
}
