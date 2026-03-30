import React from 'react';
import { COLORS, FONT } from './designSystem';

/**
 * A consistent text component for headings and body text.
 * Props: as ('h1', 'h2', 'h3', 'p', etc.), size, weight, color, children, style, ...rest
 */
export function Text({
  as = 'p',
  size = 'base',
  weight = 'normal',
  color = COLORS.text,
  children,
  style = {},
  ...rest
}) {
  const Tag = as;
  return (
    <Tag
      style={{
        fontFamily: FONT.family,
        fontSize: FONT.size[size] || FONT.size.base,
        fontWeight: FONT.weight[weight] || FONT.weight.normal,
        color,
        margin: 0,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
