import PropTypes from 'prop-types';

/**
 * Quick stats summary row - useful for showing key metrics
 */
export function StatsSummary({ stats }) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 flex-1 min-w-[200px]"
        >
          {stat.icon && (
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg || 'bg-primary-100 dark:bg-primary-900/20'}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor || 'text-primary-600 dark:text-primary-400'}`} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 truncate">{stat.label}</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">{stat.subtitle}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

StatsSummary.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      subtitle: PropTypes.string,
      icon: PropTypes.elementType,
      iconBg: PropTypes.string,
      iconColor: PropTypes.string
    })
  ).isRequired
};

/**
 * Metric card with comparison/trend
 */
export function MetricCard({ label, value, comparison, trend, variant = 'default' }) {
  const variantStyles = {
    default: 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-surface-dark',
    success: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10',
    warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10',
    danger: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10',
    info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10'
  };

  return (
    <div className={`rounded-lg border p-4 ${variantStyles[variant]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
        {label}
      </p>
      <div className="mt-2 flex items-baseline justify-between">
        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
        {(comparison || trend) && (
          <div className={`text-xs font-medium ${
            trend && trend > 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : trend && trend < 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}>
            {trend ? (
              <>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </>
            ) : (
              comparison
            )}
          </div>
        )}
      </div>
    </div>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  comparison: PropTypes.string,
  trend: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'danger', 'info'])
};
