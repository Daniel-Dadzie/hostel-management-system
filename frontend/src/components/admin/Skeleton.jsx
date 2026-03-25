import PropTypes from 'prop-types';

/**
 * Loading skeleton for graceful loading states
 */
export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700 mb-3 animate-pulse" />
      <div className="h-8 w-32 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      <div className="h-3 w-48 rounded bg-neutral-100 dark:bg-neutral-800 mt-3 animate-pulse" />
    </div>
  );
}

/**
 * Loading skeleton for tables
 */
export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-2">
      <div className="h-10 w-full rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-2">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="h-10 flex-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

SkeletonTable.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number
};

/**
 * Loading spinner overlay
 */
export function LoadingSpinner({ size = 'md', message }) {
  const sizeMap = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <div className={`${sizeMap[size]} animate-spin rounded-full border-primary-600 border-t-transparent`} />
      {message && <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>}
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  message: PropTypes.string
};
