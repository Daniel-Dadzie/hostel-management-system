import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';

/**
 * Enhanced Modal Dialog component
 * @param {boolean} isOpen - Whether modal is open
 * @param {Function} onClose - Callback when modal closes
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal content
 * @param {Array} actions - Array of { label, onClick, variant?, loading? }
 * @param {string} size - 'sm', 'md', 'lg', 'xl' (default: 'md')
 */
export default function Modal({
  isOpen = false,
  onClose,
  title,
  children,
  actions = [],
  size = 'md'
}) {
  if (!isOpen) return null;

  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className={`relative w-full ${sizeMap[size]} overflow-hidden rounded-[30px] border border-[#e3e9df] bg-[#fbfcfa] shadow-[0_24px_60px_rgba(15,23,42,0.18)] dark:border-[#223129] dark:bg-[#141a17]`}>
        {/* Header */}
        <div className="border-b border-neutral-200/80 bg-[#f5f8f4] px-6 py-4 dark:border-neutral-800 dark:bg-[#171f1b]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-white dark:hover:bg-[#1d2622]"
              aria-label="Close modal"
            >
              <FaTimes className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">{children}</div>

        {/* Footer with actions */}
        {actions.length > 0 && (
          <div className="border-t border-neutral-200/80 bg-[#f9fbf8] px-6 py-4 dark:border-neutral-800 dark:bg-[#161d19]">
            <div className="flex justify-end gap-3">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={action.onClick}
                  disabled={action.loading}
                  className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                    action.variant === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50'
                      : action.variant === 'ghost'
                      ? 'border border-neutral-300 text-neutral-900 hover:bg-white dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800'
                      : 'bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50'
                  }`}
                >
                  {action.loading ? 'Loading...' : action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(['primary', 'danger', 'ghost']),
      loading: PropTypes.bool
    })
  ),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl'])
};
