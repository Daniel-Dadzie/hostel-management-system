import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FaCheck, FaCircle } from 'react-icons/fa';

export default function LoadingOverlay({ open, title = 'Please wait', message = 'Processing your request...', blockNavigation = false, steps = null, currentStep = null }) {
  const [displayStep, setDisplayStep] = useState(currentStep || 0);
  
  useEffect(() => {
    if (currentStep !== null) {
      setDisplayStep(currentStep);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!open || !blockNavigation) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [open, blockNavigation]);

  if (!open) return null;

  const hasSteps = steps && steps.length > 0;
  const progress = hasSteps ? ((displayStep + 1) / steps.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-xl">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-[#0f6b46]/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 animate-pulse rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-400/10" />
      </div>

      <div className="w-full max-w-md animate-fade-in rounded-3xl border border-neutral-200/50 bg-gradient-to-br from-white to-neutral-50 p-8 text-center shadow-2xl dark:border-neutral-600/40 dark:from-[#1a1d22] dark:to-[#0f1318] dark:bg-opacity-95">
        {/* Main Spinner */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center">
          <div className="relative h-20 w-20">
            <svg className="h-full w-full" viewBox="0 0 100 100" fill="none">
              {/* Background circle */}
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" className="text-neutral-200 dark:text-white/10" />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#progressGradient)"
                strokeWidth="3"
                strokeDasharray={`${progress * 2.83} 283`}
                strokeLinecap="round"
                className="transition-all duration-500"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f6b46" />
                  <stop offset="100%" stopColor="#10a981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {title}
        </h3>

        {/* Message */}
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {message}
        </p>

        {/* Steps Indicator */}
        {hasSteps && (
          <div className="mt-8 space-y-3">
            {steps.map((step, index) => {
              const isCompleted = index < displayStep;
              const isCurrent = index === displayStep;
              
              return (
                <div key={index} className="flex items-center gap-3 transition-all duration-300">
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : isCurrent
                      ? 'bg-[#0f6b46] text-white ring-4 ring-[#0f6b46]/30 shadow-lg shadow-[#0f6b46]/30'
                      : 'bg-neutral-200 text-neutral-500 dark:bg-white/10 dark:text-white/40'
                  }`}>
                    {isCompleted ? (
                      <FaCheck className="text-sm" />
                    ) : isCurrent ? (
                      <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-all duration-300 text-left flex-1 ${
                    isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isCurrent
                      ? 'text-[#0f6b46] dark:text-emerald-300 font-semibold'
                      : 'text-neutral-500 dark:text-neutral-500'
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Animated dots */}
        {!hasSteps && (
          <div className="mt-8 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#0f6b46] to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

LoadingOverlay.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  blockNavigation: PropTypes.bool,
  steps: PropTypes.arrayOf(PropTypes.string),
  currentStep: PropTypes.number
};
