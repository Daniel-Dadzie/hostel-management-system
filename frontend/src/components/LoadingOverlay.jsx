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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-lg">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-2xl dark:border-neutral-700 dark:bg-[#1a1d22]">
        {/* Main Spinner */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
          <div className="relative h-16 w-16">
            <svg className="h-full w-full" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" className="text-neutral-200 dark:text-white/10" />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${progress * 1.76} 176`}
                strokeLinecap="round"
                className="text-[#0f6b46] dark:text-emerald-400 transition-all duration-500"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '32px 32px' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
          {title}
        </h3>

        {/* Message */}
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          {message}
        </p>

        {/* Steps Indicator */}
        {hasSteps && (
          <div className="mt-6 space-y-2">
            {steps.map((step, index) => {
              const isCompleted = index < displayStep;
              const isCurrent = index === displayStep;
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-[#0f6b46] text-white ring-2 ring-[#0f6b46] ring-offset-2 ring-offset-white dark:ring-offset-[#1a1d22]'
                      : 'bg-neutral-200 text-neutral-400 dark:bg-white/10 dark:text-white/40'
                  }`}>
                    {isCompleted ? (
                      <FaCheck className="text-xs" />
                    ) : isCurrent ? (
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    ) : (
                      <FaCircle className="text-[0.25rem]" />
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${
                    isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isCurrent
                      ? 'text-[#0f6b46] dark:text-emerald-300'
                      : 'text-neutral-500 dark:text-neutral-400'
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
          <div className="mt-6 flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-[#0f6b46] dark:bg-emerald-400 animate-pulse"
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
