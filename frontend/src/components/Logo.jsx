import React from 'react';

/**
 * Logo component - Beautiful hostel management system logo
 * Can be used with different sizes and variants
 */
export default function Logo({ size = 'md', variant = 'default', className = '' }) {
  const sizes = {
    sm: { icon: 20, text: 'text-base' },
    md: { icon: 28, text: 'text-lg' },
    lg: { icon: 36, text: 'text-xl' },
    xl: { icon: 48, text: 'text-2xl' }
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Main building shape */}
        <rect x="8" y="12" width="32" height="28" rx="2" fill="url(#gradient)" stroke="currentColor" strokeWidth="1.5" className="text-emerald-600 dark:text-emerald-400" />
        
        {/* Roof - triangle */}
        <path d="M 8 12 L 24 2 L 40 12" fill="url(#gradientRoof)" stroke="currentColor" strokeWidth="1.5" className="text-emerald-700 dark:text-emerald-500" />
        
        {/* Door - center */}
        <rect x="20" y="28" width="8" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white dark:text-emerald-200" />
        <circle cx="27" cy="34" r="1.5" fill="currentColor" className="text-white dark:text-emerald-200" />
        
        {/* Windows - top row */}
        <rect x="12" y="16" width="5" height="5" fill="url(#windowGradient)" stroke="currentColor" strokeWidth="1" className="text-emerald-400 dark:text-emerald-300" />
        <rect x="19" y="16" width="5" height="5" fill="url(#windowGradient)" stroke="currentColor" strokeWidth="1" className="text-emerald-400 dark:text-emerald-300" />
        <rect x="31" y="16" width="5" height="5" fill="url(#windowGradient)" stroke="currentColor" strokeWidth="1" className="text-emerald-400 dark:text-emerald-300" />
        
        {/* Windows - middle row */}
        <rect x="12" y="24" width="5" height="5" fill="url(#windowGradient)" stroke="currentColor" strokeWidth="1" className="text-emerald-400 dark:text-emerald-300" />
        <rect x="31" y="24" width="5" height="5" fill="url(#windowGradient)" stroke="currentColor" strokeWidth="1" className="text-emerald-400 dark:text-emerald-300" />
        
        {/* Accent bar at bottom */}
        <rect x="8" y="38" width="32" height="2" fill="url(#accentGradient)" className="text-emerald-500 dark:text-emerald-400" />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="gradientRoof" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
          <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>

      {/* Logo Text (optional) */}
      {variant === 'with-text' && (
        <div className="flex flex-col">
          <span className={`font-extrabold tracking-tight text-emerald-700 dark:text-emerald-50 ${currentSize.text}`}>
            UniHostel
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-300/60">
            Management
          </span>
        </div>
      )}
    </div>
  );
}
