// Design system constants for colors, spacing, typography, and more.
// Import these values in your components for consistency.

export const COLORS = {
  primary: '#2563eb', // Tailwind blue-600
  secondary: '#22c55e', // Tailwind green-500
  accent: '#f59e42', // Tailwind orange-400
  danger: '#dc2626', // Tailwind red-600
  background: '#f8fafc', // Tailwind gray-50
  surface: '#ffffff',
  border: '#e5e7eb', // Tailwind gray-200
  text: '#1e293b', // Tailwind slate-800
  muted: '#64748b', // Tailwind slate-400
};

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
};

export const RADIUS = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '1rem',
  full: '9999px',
};

export const FONT = {
  family: 'Inter, ui-sans-serif, system-ui, sans-serif',
  size: {
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    xxl: '1.5rem',
    xxxl: '2rem',
  },
  weight: {
    normal: 400,
    medium: 500,
    bold: 700,
    extrabold: 800,
  },
};

export const SHADOW = {
  sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
};

export const TRANSITION = {
  fast: 'all 0.15s ease',
  normal: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
};
