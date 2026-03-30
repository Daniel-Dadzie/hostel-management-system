import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '../../ui/Card';
import { Text } from '../../ui/Text';

/**
 * Quick stats summary row - useful for showing key metrics
 */
export function StatsSummary({ stats }) {
  if (!stats || stats.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, borderRadius: 12, border: '1px solid #e5e7eb', padding: 16 }}>
      {stats.map((stat, idx) => (
        <Card key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200, boxShadow: 'none', border: 'none', padding: 0, background: 'none' }}>
          {stat.icon && (
            <div style={{ display: 'flex', height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: stat.iconBg || '#dbeafe', color: stat.iconColor || '#2563eb' }}>
              <stat.icon style={{ fontSize: 20 }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" style={{ color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.label}</Text>
            <Text size="xl" weight="bold" style={{ color: '#1e293b' }}>{stat.value}</Text>
            {stat.subtitle && (
              <Text size="xs" style={{ color: '#94a3b8', marginTop: 4 }}>{stat.subtitle}</Text>
            )}
          </div>
        </Card>
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
    default: { border: '1px solid #e5e7eb', background: '#fff' },
    success: { border: '1px solid #bbf7d0', background: '#f0fdf4' },
    warning: { border: '1px solid #fde68a', background: '#fefce8' },
    danger: { border: '1px solid #fecaca', background: '#fef2f2' },
    info: { border: '1px solid #bfdbfe', background: '#eff6ff' }
  };
  const style = variantStyles[variant] || variantStyles.default;
  return (
    <Card style={{ borderRadius: 12, padding: 16, ...style }}>
      <Text size="xs" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>{label}</Text>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text size="xxl" weight="bold" style={{ color: '#1e293b' }}>{value}</Text>
        {(comparison || trend) && (
          <Text size="xs" weight="medium" style={{ color: trend && trend > 0 ? '#059669' : trend && trend < 0 ? '#dc2626' : '#64748b' }}>
            {trend ? (
              <>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </>
            ) : (
              comparison
            )}
          </Text>
        )}
      </div>
    </Card>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  comparison: PropTypes.string,
  trend: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'danger', 'info'])
};
