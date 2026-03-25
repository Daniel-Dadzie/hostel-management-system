import toast from 'react-hot-toast';

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
