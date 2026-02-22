import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle.jsx';

export default function PublicLayout({ children, title }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              H
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">Hostel Management</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">University System</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-neutral-600 hover:text-blue-600 dark:text-neutral-300">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Register
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {title && (
          <h2 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">{title}</h2>
        )}
        {children}
      </main>

      <footer className="border-t border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
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
