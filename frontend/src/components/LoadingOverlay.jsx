import PropTypes from 'prop-types';
import { useEffect } from 'react';

export default function LoadingOverlay({ open, title, message, blockNavigation }) {
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-xl dark:border-neutral-700 dark:bg-surface-dark">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        <h3 className="card-header text-neutral-900 dark:text-white">{title}</h3>
        <p className="body-text mt-2 text-neutral-600 dark:text-neutral-300">{message}</p>
      </div>
    </div>
  );
}

LoadingOverlay.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  blockNavigation: PropTypes.bool
};

LoadingOverlay.defaultProps = {
  title: 'Please wait',
  message: 'Processing your request...',
  blockNavigation: false
};
