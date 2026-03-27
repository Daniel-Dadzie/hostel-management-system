import PropTypes from 'prop-types';

export function formatStatusLabel(value) {
  return value?.replaceAll('_', ' ') || 'Unknown';
}

export function DashboardPanel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="card-header text-neutral-900 dark:text-white">{title}</h2>
          {subtitle ? <p className="section-subtitle mt-1">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

DashboardPanel.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export function MetricCard({ label, value, sub, icon: Icon, progress, featured = false }) {
  if (featured) {
    return (
      <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#0f6b46] via-[#19734f] to-[#0f5d3e] p-5 text-white shadow-[0_22px_46px_rgba(15,107,70,0.22)]">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/72">{label}</p>
              <p className="mt-4 text-[2.35rem] font-black leading-none tracking-[-0.06em]">{value}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/14">
              <Icon className="text-base" />
            </div>
          </div>
          <p className="text-sm text-white/74">{sub}</p>
          {progress !== null ? (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white/72">
                <span>Occupancy progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-white/90" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="card flex h-full flex-col justify-between rounded-[26px] p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400 dark:text-neutral-500">
            {label}
          </p>
          <p className="mt-4 text-[2.15rem] font-black leading-none tracking-[-0.06em] text-neutral-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dde8df] bg-[#f5faf6] text-[#0f6b46] dark:border-[#214136] dark:bg-[#13231c] dark:text-[#7ad0a6]">
          <Icon className="text-sm" />
        </div>
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{sub}</p>
      {progress !== null ? (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <span>Occupancy progress</span>
            <span className="text-[#0f6b46] dark:text-[#7ad0a6]">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div className="h-full rounded-full bg-[#0f6b46] dark:bg-[#7ad0a6]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sub: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  progress: PropTypes.number,
  featured: PropTypes.bool
};
