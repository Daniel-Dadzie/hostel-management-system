import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api/client';

/**
 * Hook for mutations with optimistic UI updates
 * @param {string} path - API endpoint path
 * @param {string} method - HTTP method (POST, PUT, DELETE, PATCH)
 * @param {Object} options - Configuration options
 * @param {Array} options.queryKeysToInvalidate - Array of query keys to invalidate after mutation
 * @param {Function} options.updateFn - Function to optimistically update the cache
 * @param {Function} options.onSuccess - Optional success callback
 * @param {Function} options.onError - Optional error callback
 */
export function useOptimisticMutation(path, method = 'POST', options = {}) {
  const {
    queryKeysToInvalidate = [],
    updateFn,
    onSuccess,
    onError,
  } = options;

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiRequest(path, { method, body: data }),
    
    // Called before the mutation function
    onMutate: async (newData) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await Promise.all(
        queryKeysToInvalidate.map((key) => 
          queryClient.cancelQueries({ queryKey: key })
        )
      );

      // Snapshot the previous values
      const previousData = {};
      queryKeysToInvalidate.forEach((key) => {
        previousData[key] = queryClient.getQueryData(key);
      });

      // Optimistically update the cache
      if (updateFn) {
        queryKeysToInvalidate.forEach((key) => {
          queryClient.setQueryData(key, (old) => updateFn(old, newData));
        });
      }

      // Return context with the previous data for rollback
      return { previousData };
    },

    // If mutation fails, use the context to roll back
    onError: (err, newData, context) => {
      if (context?.previousData) {
        queryKeysToInvalidate.forEach((key) => {
          if (context.previousData[key] !== undefined) {
            queryClient.setQueryData(key, context.previousData[key]);
          }
        });
      }
      if (onError) {
        onError(err);
      }
    },

    // Always refetch after error or success to ensure data consistency
    onSettled: () => {
      queryKeysToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      if (onSuccess) {
        onSuccess();
      }
    },
  });
}

/**
 * Example usage:
 * 
 * const mutation = useOptimisticMutation(
 *   '/api/students/bookings/apply',
 *   'POST',
 *   {
 *     queryKeysToInvalidate: [['booking', studentId]],
 *     updateFn: (old, newData) => ({
 *       ...old,
 *       status: 'PENDING_PAYMENT',
 *       // other optimistic updates
 *     }),
 *   }
 * );
 * 
 * // In component:
 * mutation.mutate(data, {
 *   onSuccess: () => {
 *     // Show success toast
 *   },
 * });
 */
