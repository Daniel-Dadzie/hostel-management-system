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

export function MetricCard({ label, value, sub, icon: Icon, progress }) {
  return (
    <div
      className="card flex h-full flex-col justify-between rounded-[26px] p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.32)] transition-all duration-200 border border-[#e3e9df] dark:border-[#223129] bg-[#fbfcfa] dark:bg-[#141a17] cursor-pointer group hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:shadow-[0_18px_40px_rgba(15,107,70,0.18)]"
    >
      <div className="mb-6 flex flex-col items-center justify-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dde8df] bg-[#f5faf6] text-[#0f6b46] dark:border-white/10 dark:bg-[linear-gradient(180deg,#2b2e34_0%,#202227_100%)] dark:text-[#9fc3ff] group-hover:bg-emerald-100 group-hover:text-emerald-700 dark:group-hover:bg-emerald-900/40 dark:group-hover:text-emerald-300 transition-colors">
          <Icon className="text-xl" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400 dark:text-white/36 text-center">{label}</p>
        <p className="mt-2 text-[2.15rem] font-black leading-none tracking-[-0.06em] text-neutral-900 dark:text-white text-center">{value}</p>
      </div>
      <p className="text-sm text-neutral-500 dark:text-white/56 text-center">{sub}</p>
      {progress !== null && progress !== undefined ? (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-white/56">
            <span>Occupancy progress</span>
            <span className="text-[#0f6b46] dark:text-[#9fc3ff]">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-[#2a2d33]">
            <div className="h-full rounded-full bg-[#0f6b46] dark:bg-[linear-gradient(90deg,#428bff_0%,#1bb2aa_100%)]" style={{ width: `${progress}%` }} />
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
