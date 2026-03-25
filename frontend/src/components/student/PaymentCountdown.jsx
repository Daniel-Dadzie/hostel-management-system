import { FaClock } from 'react-icons/fa';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useCountdown } from '../../hooks/useCountdown.js';

/**
 * PaymentCountdown Component
 * Displays a real-time countdown timer for payment deadline
 * Shows warning state when less than 5 minutes remain
 */
export default function PaymentCountdown({ dueDate, onWarning }) {
  const { remaining, formatted, isLessThan5Min, isExpired, hasWarned5Min, setHasWarned5Min } = useCountdown(dueDate);

  // Trigger warning callback when < 5 minutes (only once).
  useEffect(() => {
    if (isLessThan5Min && !hasWarned5Min && onWarning) {
      onWarning();
      setHasWarned5Min(true);
    }
  }, [isLessThan5Min, hasWarned5Min, onWarning, setHasWarned5Min]);

  if (remaining === null) {
    return null;
  }

  if (isExpired) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <FaClock className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">
              Payment Deadline Expired
            </p>
            <p className="text-sm text-red-600 dark:text-red-300">
              Your payment window has closed. Contact admin to reschedule.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 ${
      isLessThan5Min
        ? 'bg-red-50 dark:bg-red-900/20'
        : 'bg-blue-50 dark:bg-blue-900/20'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isLessThan5Min
              ? 'bg-red-100 dark:bg-red-900/40'
              : 'bg-blue-100 dark:bg-blue-900/40'
          }`}>
            <FaClock className={isLessThan5Min ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} />
          </div>
          <div>
            <p className={`text-sm font-medium ${
              isLessThan5Min
                ? 'text-red-700 dark:text-red-400'
                : 'text-blue-700 dark:text-blue-400'
            }`}>
              {isLessThan5Min ? '⚠️ Payment Due Soon' : '⏳ Payment Deadline'}
            </p>
            <p className={`text-xs ${
              isLessThan5Min
                ? 'text-red-600 dark:text-red-300'
                : 'text-blue-600 dark:text-blue-300'
            }`}>
              {isLessThan5Min
                ? 'Complete payment immediately'
                : 'Complete payment to confirm booking'}
            </p>
          </div>
        </div>
        <div className={`text-right ${
          isLessThan5Min
            ? 'text-red-700 dark:text-red-400'
            : 'text-blue-700 dark:text-blue-400'
        }`}>
          <p className="text-4xl font-bold font-mono">{formatted}</p>
          <p className="text-xs font-medium">Remaining</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        <div
          className={`h-full transition-all duration-1000 ${
            isLessThan5Min
              ? 'bg-red-500 dark:bg-red-600'
              : 'bg-blue-500 dark:bg-blue-600'
          }`}
          style={{ width: `${Math.max(0, (remaining / 1800) * 100)}%` }} // 1800 = 30 mins
        />
      </div>
    </div>
  );
}

PaymentCountdown.propTypes = {
  dueDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  onWarning: PropTypes.func
};
