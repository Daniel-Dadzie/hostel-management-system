import PropTypes from 'prop-types';

/**
 * Stats card component for dashboard metrics
 */
export function StatsCard({
  label,
  value,
  subtext,
  icon: Icon,
  gradient = 'from-primary-500 to-primary-700',
  trend,
  trendLabel,
  chart
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-surface-dark">
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {label}
          </p>
          {Icon && (
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
              <Icon className="text-xs" />
            </div>
          )}
        </div>
        <div className="mb-2">
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">{value}</p>
          <p className="mt-0.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">{subtext}</p>
        </div>

        {trend && (
          <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
            trend > 0
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            <span>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
            {trendLabel && <span className="text-neutral-600 dark:text-neutral-400">{trendLabel}</span>}
          </div>
        )}

        {chart && (
          <div className="mt-3 h-10">
            {chart}
          </div>
        )}
      </div>
    </div>
  );
}

StatsCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtext: PropTypes.string,
  icon: PropTypes.elementType,
  gradient: PropTypes.string,
  trend: PropTypes.number,
  trendLabel: PropTypes.string,
  chart: PropTypes.node
};

/**
 * Mini stats card for compact display
 */
export function MiniStatsCard({ label, value, icon: Icon, color = 'primary' }) {
  const colorMap = {
    primary: 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20',
    emerald: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20',
    red: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
    yellow: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    blue: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
  };

  return (
    <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color]}`}>
            <Icon className="text-lg" />
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</p>
          <p className="text-lg font-bold text-neutral-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

MiniStatsCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  color: PropTypes.oneOf(['primary', 'emerald', 'red', 'yellow', 'blue'])
};
