import React from 'react';
import { COLORS, RADIUS, FONT, SHADOW, TRANSITION } from './designSystem';

/**
 * A consistent input component for forms.
 * Props: label, type, value, onChange, placeholder, error, ...rest
 */
export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  ...rest
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontFamily: FONT.family,
            fontWeight: FONT.weight.medium,
            color: COLORS.text,
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.5rem 1rem',
          border: `1px solid ${error ? COLORS.danger : COLORS.border}`,
          borderRadius: RADIUS.md,
          fontFamily: FONT.family,
          fontSize: FONT.size.base,
          outline: 'none',
          boxShadow: error ? `0 0 0 2px ${COLORS.danger}33` : SHADOW.sm,
          transition: TRANSITION.normal,
        }}
        {...rest}
      />
      {error && (
        <div style={{ color: COLORS.danger, fontSize: FONT.size.sm, marginTop: '0.25rem' }}>{error}</div>
      )}
    </div>
  );
}
