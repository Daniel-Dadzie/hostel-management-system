import React from 'react';
import PropTypes from 'prop-types';

/**
 * Quick stats summary row - useful for showing key metrics
 */
export function StatsSummary({ stats }) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
      {stats.map((stat, idx) => (
        <div key={idx} className="flex flex-1 min-w-full sm:min-w-48 items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
          {stat.icon && (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: stat.iconBg || '#dbeafe', color: stat.iconColor || '#2563eb' }}>
              <stat.icon style={{ fontSize: 20 }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm text-gray-600 font-medium dark:text-gray-400" title={stat.label}>{stat.label}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
            {stat.subtitle && (
              <p className="truncate text-xs text-gray-500 dark:text-gray-400 mt-0.5" title={stat.subtitle}>{stat.subtitle}</p>
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
    default: 'border border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-900',
    success: 'border border-green-300 bg-green-50 dark:border-green-900/30 dark:bg-green-900/20',
    warning: 'border border-yellow-300 bg-yellow-50 dark:border-yellow-900/30 dark:bg-yellow-900/20',
    danger: 'border border-red-300 bg-red-50 dark:border-red-900/30 dark:bg-red-900/20',
    info: 'border border-blue-300 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/20'
  };
  const styleClass = variantStyles[variant] || variantStyles.default;
  const trendColor = trend && trend > 0 ? 'text-green-600' : trend && trend < 0 ? 'text-red-600' : 'text-gray-600';
  
  return (
    <div className={`rounded-lg p-4 ${styleClass}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">{label}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {(comparison || trend) && (
          <p className={`text-xs font-medium ${trendColor}`}>
            {trend ? (
              <>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </>
            ) : (
              comparison
            )}
          </p>
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
