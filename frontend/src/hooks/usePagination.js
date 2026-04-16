import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api/client';

/**
 * usePagination hook for server-side pagination
 * 
 * @param {string} endpoint - API endpoint path (e.g., '/api/admin/bookings/paginated')
 * @param {object} params - URL parameters (e.g., { status: 'PENDING' })
 * @param {number} initialPageSize - Initial page size (default: 20)
 * @param {object} options - Additional React Query options
 * @returns {object} Pagination state and methods
 */
export function usePagination(endpoint, params = {}, initialPageSize = 20, options = {}) {
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Build query parameters
  const buildQueryParams = useCallback(() => {
    const searchParams = new URLSearchParams();
    
    // Add user-provided params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, value);
      }
    });

    // Add pagination params
    searchParams.append('page', pageNumber);
    searchParams.append('size', pageSize);

    return searchParams.toString();
  }, [pageNumber, pageSize, params]);

  // Fetch paginated data
  const {
    data = {},
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [endpoint, pageNumber, pageSize, params],
    queryFn: async () => {
      const queryString = buildQueryParams();
      const path = `${endpoint}${queryString ? '?' + queryString : ''}`;
      return apiRequest(path);
    },
    keepPreviousData: true,
    ...options,
  });

  // Extract pagination data from response
  const {
    content = [],
    pageNumber: currentPage = 0,
    pageSize: currentPageSize = pageSize,
    totalElements = 0,
    totalPages = 0,
    isFirst = true,
    isLast = true,
    hasNext = false,
    hasPrevious = false,
  } = data;

  // Navigation methods
  const goToPage = useCallback((page) => {
    if (page >= 0 && page < totalPages) {
      setPageNumber(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNext) {
      setPageNumber((prev) => prev + 1);
    }
  }, [hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrevious) {
      setPageNumber((prev) => prev - 1);
    }
  }, [hasPrevious]);

  const goToFirst = useCallback(() => {
    setPageNumber(0);
  }, []);

  const goToLast = useCallback(() => {
    if (totalPages > 0) {
      setPageNumber(totalPages - 1);
    }
  }, [totalPages]);

  const changePageSize = useCallback((newSize) => {
    setPageSize(newSize);
    setPageNumber(0); // Reset to first page when changing page size
  }, []);

  return {
    // Data
    data: content,
    isLoading,
    error,

    // Pagination state
    pageNumber: currentPage,
    pageSize: currentPageSize,
    totalElements,
    totalPages,
    isFirst,
    isLast,
    hasNext,
    hasPrevious,

    // Navigation methods
    goToPage,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
    changePageSize,
    refetch,
  };
}
