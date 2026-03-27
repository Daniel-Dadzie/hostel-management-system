import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import hostelLogo from '../../assets/hostel-logo.svg';
import ThemeToggle from '../ThemeToggle.jsx';

export default function PublicLayout({ children, title }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-primary-50 via-white to-emerald-50/40 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.06),transparent_30%)]"></div>
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary-200/20 blur-3xl dark:bg-primary-900/20"></div>
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 dark:border-neutral-800/80 dark:bg-surface-dark/80 dark:supports-[backdrop-filter]:bg-surface-dark/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={hostelLogo} alt="Hostel Management logo" className="h-10 w-10 shrink-0 rounded-xl shadow-md ring-1 ring-neutral-200/70 dark:ring-white/10" />
            <div>
              <h1 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white sm:text-[17px]">Hostel Management</h1>
              <p className="hidden text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:block">University System</p>
            </div>
          </Link>
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto sm:gap-4">
            <Link to="/login" className="text-sm text-neutral-600 hover:text-primary-700 dark:text-neutral-300 dark:hover:text-primary-300">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 hover:!text-white dark:hover:bg-primary-500"
            >
              Register
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:py-10">
        {title && (
          <h2 className="page-title mb-6 text-neutral-900 dark:text-white">{title}</h2>
        )}
        {children}
      </main>

      <footer className="relative z-10 border-t border-neutral-200/80 bg-white/75 backdrop-blur-md dark:border-neutral-800/80 dark:bg-surface-dark/75">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
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
