import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle.jsx';

export default function PublicLayout({ children, title }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-white dark:bg-neutral-950">

      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a4a30]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-sm font-black text-white ring-1 ring-white/20">
              H
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-white">Hostel Management</p>
              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50 sm:block">University System</p>
            </div>
          </Link>

          <div className="flex w-full items-center justify-end gap-3 sm:w-auto sm:gap-4">
            <Link to="/login" className="text-sm font-medium text-white/75 transition hover:text-white">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-[#0f6b46] shadow-lg transition hover:-translate-y-px hover:bg-emerald-50"
            >
              Register
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:py-10">
        {title && (
          <h2 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">{title}</h2>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-white dark:border-white/6 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
          © {new Date().getFullYear()} University Hostel Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string
};
