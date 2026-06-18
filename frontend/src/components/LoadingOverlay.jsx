import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-[400px] animate-fade-in overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_rgba(0,0,0,0.2)] dark:bg-[#1a1d22] dark:shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
        
        {/* Indeterminate Shimmer Top Bar */}
        <div className="relative h-1 w-full overflow-hidden bg-emerald-50 dark:bg-emerald-950/30">
          <div className="absolute inset-y-0 left-0 w-1/2 animate-[shimmer_1.5s_infinite_linear] bg-gradient-to-r from-transparent via-[#0f6b46] to-transparent dark:via-emerald-500" />
        </div>

        <div className="p-8">
          <div className="flex items-center gap-4 border-b border-neutral-100 pb-5 dark:border-white/5">
            {/* Minimalist Spinner */}
            <svg className="h-6 w-6 animate-spin text-[#0f6b46] dark:text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
              <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div>
              <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {message}
              </p>
            </div>
          </div>

          {/* Deployment-style Checklist */}
          {hasSteps && (
            <div className="mt-6 space-y-4 pl-1">
              {steps.map((step, index) => {
                const isCompleted = index < displayStep;
                const isCurrent = index === displayStep;
                
                return (
                  <div key={index} className="flex items-center gap-3.5">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      {isCompleted ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[#0f6b46] dark:bg-emerald-900/40 dark:text-emerald-400">
                          <FaCheck className="text-[10px]" />
                        </div>
                      ) : isCurrent ? (
                        <div className="relative flex h-3 w-3 items-center justify-center">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0f6b46] opacity-40 dark:bg-emerald-400"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0f6b46] dark:bg-emerald-500"></span>
                        </div>
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                      )}
                    </div>
                    <span className={`text-sm tracking-tight transition-colors duration-200 ${
                      isCompleted
                        ? 'font-medium text-neutral-600 dark:text-neutral-300'
                        : isCurrent
                        ? 'font-bold text-neutral-900 dark:text-white'
                        : 'font-medium text-neutral-400 dark:text-neutral-600'
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fallback dots if no steps provided */}
          {!hasSteps && (
            <div className="mt-6 flex gap-1.5 pl-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0f6b46] dark:bg-emerald-500"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
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