import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api/client';

// Generic fetch hook
export function useFetch(queryKey, path, options = {}) {
  return useQuery({
    queryKey,
    queryFn: () => apiRequest(path),
    ...options,
  });
}

// Generic mutation hook with optional optimistic update
export function useMutationWithOptimisticUpdate(path, method = 'POST', options = {}) {
  const queryClient = useQueryClient();
  const { queryKeysToInvalidate = [], updateFn } = options;

  return useMutation({
    mutationFn: (data) => apiRequest(path, { method, body: data }),
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeysToInvalidate[0] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKeysToInvalidate[0]);

      // Optimistically update
      if (updateFn) {
        queryClient.setQueryData(queryKeysToInvalidate[0], (old) => updateFn(old, newData));
      }

      return { previousData };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeysToInvalidate[0], context.previousData);
      }
    },
    onSettled: () => {
      // Invalidate queries to refetch
      queryKeysToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}

// Hook for hostel data
export function useHostels() {
  return useFetch(['hostels'], '/api/hostels');
}

// Hook for available rooms
export function useAvailableRooms(hostelId, studentId) {
  return useFetch(
    ['rooms', hostelId, studentId],
    `/api/students/hostels/${hostelId}/rooms?studentId=${studentId}`,
    { enabled: !!hostelId && !!studentId }
  );
}

// Hook for student's booking
export function useStudentBooking(studentId) {
  return useFetch(
    ['booking', studentId],
    `/api/students/bookings/latest?studentId=${studentId}`,
    { enabled: !!studentId }
  );
}

// Hook for student profile
export function useStudentProfile(studentId) {
  return useFetch(
    ['profile', studentId],
    `/api/students/profile?studentId=${studentId}`,
    { enabled: !!studentId }
  );
}
