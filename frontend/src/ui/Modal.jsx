import React from 'react';
import PropTypes from 'prop-types';
import { COLORS, RADIUS, SHADOW, FONT, TRANSITION } from './designSystem';

/**
 * A simple modal dialog component.
 * Props: open (bool), onClose (func), title, children
 */
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#0008',
        zIndex: 1000,
      }}
      onClick={onClose}
      onKeyDown={e => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        role="document"
        tabIndex={0}
        style={{
          background: COLORS.surface,
          borderRadius: RADIUS.lg,
          boxShadow: SHADOW.lg,
          minWidth: 320,
          maxWidth: 480,
          margin: '80px auto',
          padding: 24,
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          aria-label="Close modal"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          ×
        </button>
        {title && <h2 style={{ marginBottom: 16 }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node
};
