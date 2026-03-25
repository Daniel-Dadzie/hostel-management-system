import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

/**
 * Alert/Notification component
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {string} message - Alert message
 * @param {string} title - Optional alert title
 * @param {Function} onClose - Callback when closed
 * @param {number} autoClose - Auto close after milliseconds (0 = no auto close)
 */
export default function Alert({
  type = 'info',
  message,
  title,
  onClose,
  autoClose = 5000
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose <= 0) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, autoClose);
    return () => clearTimeout(timer);
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  const typeConfig = {
    success: {
      icon: FaCheckCircle,
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      titleColor: 'text-emerald-900 dark:text-emerald-200',
      textColor: 'text-emerald-800 dark:text-emerald-300'
    },
    error: {
      icon: FaTimesCircle,
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      titleColor: 'text-red-900 dark:text-red-200',
      textColor: 'text-red-800 dark:text-red-300'
    },
    warning: {
      icon: FaExclamationTriangle,
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      titleColor: 'text-yellow-900 dark:text-yellow-200',
      textColor: 'text-yellow-800 dark:text-yellow-300'
    },
    info: {
      icon: FaInfoCircle,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-900 dark:text-blue-200',
      textColor: 'text-blue-800 dark:text-blue-300'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} p-4`}>
      <div className="flex gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1">
          {title && <p className={`font-semibold ${config.titleColor}`}>{title}</p>}
          <p className={config.textColor}>{message}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className="ml-2 flex-shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

Alert.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  title: PropTypes.string,
  onClose: PropTypes.func,
  autoClose: PropTypes.number
};

/**
 * Form validation error component
 */
export function FormError({ error, field }) {
  if (!error) return null;

  return (
    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
      {field && `${field}: `}
      {error}
    </p>
  );
}

FormError.propTypes = {
  error: PropTypes.string,
  field: PropTypes.string
};
