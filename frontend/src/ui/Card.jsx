import React from 'react';
import { COLORS, RADIUS, FONT, SHADOW } from './designSystem';

/**
 * A consistent card component for the design system.
 * Props: children, style, ...rest
 */
export function Card({ children, style = {}, ...rest }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: RADIUS.lg,
        boxShadow: SHADOW.md,
        padding: '1.5rem',
        fontFamily: FONT.family,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
