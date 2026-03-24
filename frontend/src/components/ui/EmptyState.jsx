/**
 * Empty State component with illustration and call-to-action
 * Displayed when there's no data to show
 */

import { Link } from 'react-router-dom';

const icons = {
  booking: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  payment: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  student: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  search: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  document: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  folder: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  default: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
};

/**
 * Empty State Component
 * @param {string} icon - Icon name: 'booking' | 'payment' | 'student' | 'search' | 'document' | 'folder'
 * @param {string} title - Main title
 * @param {string} description - Detailed description
 * @param {string} actionLabel - Button label (optional)
 * @param {string} actionUrl - Button link (optional)
 * @param {function} onAction - Button click handler (optional)
 * @param {string} className - Additional CSS classes
 */
export function EmptyState({ 
  icon = 'default',
  title,
  description,
  actionLabel,
  actionUrl,
  onAction,
  className = '' 
}) {
  const IconComponent = icons[icon] || icons.default;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="text-neutral-300 mb-4">
        {IconComponent}
      </div>
      <h3 className="text-xl font-semibold text-neutral-700 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-neutral-500 max-w-md mb-6">
          {description}
        </p>
      )}
      {(actionLabel && (actionUrl || onAction)) && (
        actionUrl ? (
          <Link
            to={actionUrl}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}

/**
 * Predefined empty states for common scenarios
 */
export function NoBookings({ onBrowseHostels }) {
  return (
    <EmptyState
      icon="booking"
      title="No Bookings Yet"
      description="You haven't made any hostel bookings yet. Browse available hostels to find your perfect room."
      actionLabel="Browse Hostels"
      onAction={onBrowseHostels}
    />
  );
}

export function NoPayments() {
  return (
    <EmptyState
      icon="payment"
      title="No Payment Records"
      description="Your payment history will appear here once you complete a transaction."
    />
  );
}

export function NoSearchResults() {
  return (
    <EmptyState
      icon="search"
      title="No Results Found"
      description="We couldn't find any matches for your search. Try adjusting your filters or search terms."
    />
  );
}

export function NoStudents() {
  return (
    <EmptyState
      icon="student"
      title="No Students Found"
      description="There are no students matching your search criteria."
    />
  );
}

export function NoDocuments() {
  return (
    <EmptyState
      icon="document"
      title="No Documents"
      description="No documents have been uploaded yet."
    />
  );
}
