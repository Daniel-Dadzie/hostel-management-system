import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '../../ui/Card';
import { Text } from '../../ui/Text';

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
    <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', borderRadius: 26, cursor: 'pointer' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          display: 'flex',
          height: 44,
          width: 44,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: '1px solid #dde8df',
          background: '#f5faf6',
          color: '#0f6b46',
          marginBottom: 0,
        }}>
          <Icon style={{ fontSize: 22 }} />
        </div>
        <Text size="sm" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.24em', color: '#94a3b8', textAlign: 'center', fontSize: 11 }}>{label}</Text>
        <Text as="p" size="xxxl" weight="extrabold" style={{ marginTop: 8, letterSpacing: '-0.06em', textAlign: 'center', color: '#1e293b', lineHeight: 1 }}>{value}</Text>
      </div>
      <Text size="base" style={{ color: '#64748b', textAlign: 'center', fontSize: 14 }}>{sub}</Text>
      {(progress !== null && progress !== undefined) ? (
        <div style={{ marginTop: 20 }}>
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#64748b' }}>
            <span>Occupancy progress</span>
            <span style={{ color: '#0f6b46' }}>{progress}%</span>
          </div>
          <div style={{ height: 8, overflow: 'hidden', borderRadius: 8, background: '#f1f5f9' }}>
            <div style={{ height: '100%', borderRadius: 8, background: '#0f6b46', width: `${progress}%` }} />
          </div>
        </div>
      ) : null}
    </Card>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sub: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  progress: PropTypes.number
};
