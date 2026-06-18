import React from 'react';
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
    <div className="card flex h-full cursor-pointer flex-col justify-between rounded-[26px] transition-all duration-300 hover:border-[#9dbe67] hover:shadow-lg dark:hover:border-emerald-500/50">
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dde8df] bg-[#f5faf6] text-[#0f6b46] dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400">
          <Icon className="text-[22px]" />
        </div>
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className="mt-2 text-center text-3xl font-extrabold leading-none tracking-tight text-slate-800 dark:text-slate-100">
          {value}
        </p>
      </div>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {sub}
      </p>
      {(progress !== null && progress !== undefined) ? (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-[13px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Occupancy progress</span>
            <span className="text-[#0f6b46] dark:text-emerald-400">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-lg bg-[#0f6b46] dark:bg-emerald-500" style={{ width: `${progress}%` }} />
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
  progress: PropTypes.number
};