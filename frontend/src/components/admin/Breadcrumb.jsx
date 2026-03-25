import { Link, useLocation } from 'react-router-dom';
import { FaChevronRight, FaHome } from 'react-icons/fa';

const BREADCRUMB_MAP = {
  '/admin': 'Dashboard',
  '/admin/hostels': 'Manage Hostels',
  '/admin/rooms': 'Manage Rooms',
  '/admin/floors': 'Manage Floors',
  '/admin/students': 'Manage Students',
  '/admin/bookings': 'Manage Bookings',
  '/admin/terms': 'Academic Terms',
  '/admin/payments': 'Manage Payments',
  '/admin/reports': 'View Reports'
};

/**
 * Breadcrumb navigation component
 */
export default function Breadcrumb() {
  const location = useLocation();
  const path = location.pathname;

  const pathSegments = path
    .split('/')
    .filter(Boolean)
    .map((segment, idx, arr) => {
      const fullPath = '/' + arr.slice(0, idx + 1).join('/');
      return {
        label: BREADCRUMB_MAP[fullPath] || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: fullPath,
        isActive: idx === arr.length - 1
      };
    });

  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <Link
        to="/admin"
        className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <FaHome className="h-4 w-4" />
      </Link>
      {pathSegments.map((segment, idx) => (
        <div key={segment.path} className="flex items-center gap-2">
          <FaChevronRight className="h-3 w-3 text-neutral-400 dark:text-neutral-600" />
          {segment.isActive ? (
            <span className="text-neutral-900 font-medium dark:text-white">{segment.label}</span>
          ) : (
            <Link
              to={segment.path}
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              {segment.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
