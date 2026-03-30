import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '../../ui/Card';
import { Text } from '../../ui/Text';

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
    <Card style={{ overflow: 'hidden', borderRadius: 26, padding: 0 }}>
      <div style={{ height: 6, width: '100%', background: 'linear-gradient(to right, #2563eb, #1d4ed8)' }} />
      <div style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text size="sm" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>{label}</Text>
          {Icon && (
            <div style={{ display: 'flex', height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', boxShadow: '0 2px 8px rgba(37,99,235,0.12)' }}>
              <Icon style={{ fontSize: 16 }} />
            </div>
          )}
        </div>
        <div style={{ marginBottom: 8 }}>
          <Text as="p" size="xxl" weight="extrabold" style={{ color: '#1e293b' }}>{value}</Text>
          <Text as="p" size="sm" style={{ marginTop: 4, color: '#64748b' }}>{subtext}</Text>
        </div>
        {trend && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 9999, padding: '2px 8px', fontSize: 13, fontWeight: 500, background: trend > 0 ? '#d1fae5' : '#fee2e2', color: trend > 0 ? '#047857' : '#b91c1c' }}>
            <span>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
            {trendLabel && <span style={{ color: '#64748b' }}>{trendLabel}</span>}
          </div>
        )}
        {chart && (
          <div style={{ marginTop: 12, height: 40 }}>{chart}</div>
        )}
      </div>
    </Card>
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
    primary: { color: '#2563eb', bg: '#eff6ff' },
    emerald: { color: '#059669', bg: '#ecfdf5' },
    red: { color: '#dc2626', bg: '#fee2e2' },
    yellow: { color: '#ca8a04', bg: '#fef9c3' },
    blue: { color: '#2563eb', bg: '#dbeafe' }
  };
  const c = colorMap[color] || colorMap.primary;
  return (
    <Card style={{ borderRadius: 24, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {Icon && (
          <div style={{ display: 'flex', height: 44, width: 44, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: c.bg, color: c.color }}>
            <Icon style={{ fontSize: 20 }} />
          </div>
        )}
        <div>
          <Text size="sm" style={{ color: '#64748b', fontWeight: 500 }}>{label}</Text>
          <Text size="xl" weight="bold" style={{ color: '#1e293b' }}>{value}</Text>
        </div>
      </div>
    </Card>
  );
}

MiniStatsCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  color: PropTypes.oneOf(['primary', 'emerald', 'red', 'yellow', 'blue'])
};
