import { FaCheck, FaClock, FaUser, FaHome } from 'react-icons/fa';
import { MdCheckCircle } from 'react-icons/md';

/**
 * BookingProgressTimeline Component
 * Displays the booking journey as a visual step-by-step timeline
 * Steps: Applied → Payment → Admin Review → Allocated
 */
export default function BookingProgressTimeline({ booking }) {
  if (!booking) return null;

  // Map booking status to timeline step
  const getTimelineState = () => {
    const status = booking.status;

    // Step 0: Applied (always completed)
    // Step 1: Payment (PENDING_PAYMENT)
    // Step 2: Admin Review (PENDING_PAYMENT or APPROVED, but not yet completed)
    // Step 3: Allocated (APPROVED)

    if (status === 'PENDING_PAYMENT') {
      return { currentStep: 1, completedSteps: [0] };
    }
    if (status === 'APPROVED') {
      return { currentStep: 3, completedSteps: [0, 1, 2] };
    }
    if (status === 'REJECTED' || status === 'EXPIRED' || status === 'CANCELLED') {
      return { currentStep: -1, completedSteps: [0], failedStep: 1 };
    }
    return { currentStep: 0, completedSteps: [] };
  };

  const { currentStep, completedSteps, failedStep } = getTimelineState();

  const steps = [
    {
      number: 1,
      title: 'Applied',
      description: 'Hostel application submitted',
      icon: '📝',
      color: 'emerald'
    },
    {
      number: 2,
      title: 'Payment',
      description: 'Complete payment to confirm booking',
      icon: '💳',
      color: 'blue'
    },
    {
      number: 3,
      title: 'Admin Review',
      description: 'Waiting for admin approval',
      icon: '👤',
      color: 'purple'
    },
    {
      number: 4,
      title: 'Allocated',
      description: 'Room confirmed and ready!',
      icon: '🎉',
      color: 'emerald'
    }
  ];

  const isCompleted = (stepNum) => completedSteps.includes(stepNum - 1);
  const isCurrent = (stepNum) => currentStep === stepNum;
  const isFailed = failedStep === stepNum;

  return (
    <div className="card">
      <h3 className="card-header mb-6 text-neutral-900 dark:text-white">Booking Progress</h3>

      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={step.number}>
            <div className="flex items-start gap-4">
              {/* Step Circle */}
              <div className="flex shrink-0 flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full font-semibold transition-all ${
                    isCompleted(step.number)
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : isCurrent(step.number)
                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300 dark:bg-blue-900/40 dark:text-blue-400 dark:ring-blue-700'
                        : isFailed
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                          : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  {isCompleted(step.number) ? (
                    <FaCheck className="text-lg" />
                  ) : isFailed ? (
                    '✕'
                  ) : (
                    step.number
                  )}
                </div>

                {/* Connecting Line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`mb-2 mt-2 h-8 w-1 transition-all ${
                      isCompleted(step.number)
                        ? 'bg-emerald-300 dark:bg-emerald-700'
                        : isCurrent(step.number)
                          ? 'bg-blue-300 dark:bg-blue-700'
                          : 'bg-neutral-200 dark:bg-neutral-700'
                    }`}
                  />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pt-1">
                <p
                  className={`font-semibold transition-all ${
                    isCompleted(step.number)
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : isCurrent(step.number)
                        ? 'text-blue-700 dark:text-blue-400'
                        : isFailed
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {step.title}
                </p>
                <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                  {step.description}
                </p>

                {/* Status Badge */}
                {isCompleted(step.number) && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <FaCheck className="text-xs" /> Completed
                  </div>
                )}
                {isCurrent(step.number) && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <FaClock className="text-xs" /> In Progress
                  </div>
                )}
                {isFailed && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    Failed
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {failedStep
              ? '❌ Booking did not proceed'
              : isCompleted(4)
                ? '✅ All steps completed'
                : `Step ${currentStep} of 4`}
          </p>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {Math.round(
              (completedSteps.length / 4) * 100
            )}% Complete
          </p>
        </div>
        <div className="mt-2 h-2 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700">
          <div
            className={`h-full transition-all ${
              failedStep
                ? 'bg-red-500 dark:bg-red-600'
                : 'bg-emerald-500 dark:bg-emerald-600'
            }`}
            style={{ width: `${(completedSteps.length / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
