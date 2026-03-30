import React from 'react';
import { COLORS, RADIUS, FONT, SHADOW, TRANSITION } from './designSystem';

/**
 * A consistent button component for the design system.
 * Props: variant ('primary' | 'secondary' | 'danger'), size ('sm' | 'md' | 'lg'), disabled, children, ...rest
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  ...rest
}) {
  const colorMap = {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    danger: COLORS.danger,
  };
  const bg = colorMap[variant] || COLORS.primary;
  const px = size === 'sm' ? '1rem' : size === 'lg' ? '2rem' : '1.5rem';
  const py = size === 'sm' ? '0.375rem' : size === 'lg' ? '0.75rem' : '0.5rem';
  return (
    <button
      style={{
        background: bg,
        color: '#fff',
        border: 'none',
        borderRadius: RADIUS.md,
        fontFamily: FONT.family,
        fontWeight: FONT.weight.medium,
        fontSize: FONT.size.base,
        padding: `${py} ${px}`,
        boxShadow: SHADOW.sm,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: TRANSITION.normal,
      }}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
