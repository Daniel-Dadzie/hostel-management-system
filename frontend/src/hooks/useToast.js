import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

/**
 * Toast notification configuration
 * Styled for the hostel management system
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#1f2937',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        success: {
          iconTheme: {
            primary: '#059669',
            secondary: '#fff',
          },
          style: {
            borderLeft: '4px solid #059669',
          },
        },
        error: {
          iconTheme: {
            primary: '#dc2626',
            secondary: '#fff',
          },
          style: {
            borderLeft: '4px solid #dc2626',
          },
        },
        loading: {
          iconTheme: {
            primary: '#2563eb',
            secondary: '#fff',
          },
          style: {
            borderLeft: '4px solid #2563eb',
          },
        },
      }}
    />
  );
}

/**
 * Custom toast functions with consistent styling
 */
export const toastService = {
  success: (message, options = {}) => {
    return toast.success(message, {
      ...options,
      icon: '✓',
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      ...options,
      icon: '✕',
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...options,
    });
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  promise: (promise, messages = {}) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'An error occurred',
    });
  },
};

/**
 * Predefined toast messages for common actions
 */
export const toastMessages = {
  // Booking related
  bookingSubmitted: 'Booking submitted successfully!',
  bookingApproved: 'Booking approved!',
  bookingRejected: 'Booking rejected',
  bookingExpired: 'Booking has expired',
  bookingCancelled: 'Booking cancelled',

  // Payment related
  paymentSuccess: 'Payment verified successfully!',
  paymentFailed: 'Payment verification failed',
  receiptUploaded: 'Receipt uploaded successfully!',
  receiptRejected: 'Receipt rejected',

  // Profile related
  profileUpdated: 'Profile updated successfully!',
  passwordChanged: 'Password changed successfully!',
  emailSent: 'Email sent successfully!',

  // General
  saveSuccess: 'Changes saved successfully!',
  deleteSuccess: 'Deleted successfully!',
  updateSuccess: 'Updated successfully!',
  operationFailed: 'Operation failed. Please try again.',
  networkError: 'Network error. Please check your connection.',
};

/**
 * Hook for using toast notifications in components
 * @example
 * const { showSuccess, showError } = useToast();
 * showSuccess('Operation completed!');
 */
export function useToast() {
  return {
    showSuccess: (message) => toastService.success(message),
    showError: (message) => toastService.error(message),
    showLoading: (message) => toastService.loading(message),
    dismiss: (toastId) => toastService.dismiss(toastId),
    promise: (promise, messages) => toastService.promise(promise, messages),
  };
}
