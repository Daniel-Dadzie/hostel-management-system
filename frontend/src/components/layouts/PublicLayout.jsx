import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle.jsx';

export default function PublicLayout({ children, title }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:border-neutral-800 dark:bg-surface-dark/95 dark:supports-[backdrop-filter]:bg-surface-dark/85">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-700 font-bold text-white shadow-sm">
              H
            </div>
            <div>
              <h1 className="text-base font-semibold text-neutral-900 dark:text-white sm:text-lg">Hostel Management</h1>
              <p className="hidden text-xs text-neutral-500 dark:text-neutral-400 sm:block">University System</p>
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

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:py-10">
        {title && (
          <h2 className="page-title mb-6 text-neutral-900 dark:text-white">{title}</h2>
        )}
        {children}
      </main>

      <footer className="border-t border-neutral-200 bg-white/95 dark:border-neutral-800 dark:bg-surface-dark/95">
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
