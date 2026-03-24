/**
 * Skeleton loaders with shimmer animation
 * Used to reduce perceived wait time while data is loading
 */

const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

/**
 * Base skeleton component with shimmer effect
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] ${className}`}
      style={{ animation: 'shimmer 1.5s infinite linear' }}
      {...props}
    >
      <style>{shimmerKeyframes}</style>
    </div>
  );
}

/**
 * Card skeleton for hostel/room listings
 */
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <Skeleton className="h-48 w-full rounded-t-lg" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ columns = 5, className = '' }) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  );
}

/**
 * List item skeleton
 */
export function ListItemSkeleton({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 p-3 ${className}`}>
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

/**
 * Form field skeleton
 */
export function FormFieldSkeleton({ className = '' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Skeleton className="h-4 w-24 rounded" />
      <Skeleton className="h-10 w-full rounded" />
    </div>
  );
}

/**
 * Detail skeleton for profile/details pages
 */
export function DetailSkeleton({ className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Skeleton className="h-20 w-full rounded" />
        <Skeleton className="h-20 w-full rounded" />
      </div>
    </div>
  );
}

/**
 * Grid of card skeletons
 */
export function CardGridSkeleton({ count = 6, className = '' }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
