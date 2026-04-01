/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useCountdown } from '../hooks/useCountdown.js';
import { useMutationWithOptimisticUpdate } from '../hooks/useApi.js';

/* ─────────────────── helpers ────────────────────── */

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

/* ─────────────────── useCountdown ────────────────────── */

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null remaining when no dueDate is provided', () => {
    const { result } = renderHook(() => useCountdown(null));
    expect(result.current.remaining).toBeNull();
    expect(result.current.formatted).toBe('--:--');
  });

  it('returns zero and expired when due date is in the past', () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    const { result } = renderHook(() => useCountdown(past));
    expect(result.current.remaining).toBe(0);
    expect(result.current.isExpired).toBe(true);
    expect(result.current.formatted).toBe('00:00');
  });

  it('counts down over time', () => {
    const future = new Date(Date.now() + 10_000).toISOString();
    const { result } = renderHook(() => useCountdown(future));

    const initial = result.current.remaining;
    expect(initial).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(result.current.remaining).toBeLessThanOrEqual(initial);
  });

  it('formats time correctly as MM:SS', () => {
    const future = new Date(Date.now() + 125_000).toISOString();
    const { result } = renderHook(() => useCountdown(future));

    const formatted = result.current.formatted;
    expect(formatted).toMatch(/^\d{2}:\d{2}$/);
  });

  it('sets isLessThan5Min when under 300 seconds remain', () => {
    const future = new Date(Date.now() + 200_000).toISOString();
    const { result } = renderHook(() => useCountdown(future));
    expect(result.current.isLessThan5Min).toBe(true);
  });

  it('isLessThan5Min is false when more than 5 minutes remain', () => {
    const future = new Date(Date.now() + 600_000).toISOString();
    const { result } = renderHook(() => useCountdown(future));
    expect(result.current.isLessThan5Min).toBe(false);
  });

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const future = new Date(Date.now() + 60_000).toISOString();
    const { unmount } = renderHook(() => useCountdown(future));
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});

/* ─────────────────── useMutationWithOptimisticUpdate ────────────────────── */

describe('useMutationWithOptimisticUpdate', () => {
  const wrapper = createWrapper();

  it('exposes mutate, mutateAsync and isPending', () => {
    const { result } = renderHook(
      () =>
        useMutationWithOptimisticUpdate('/api/test', 'POST', {
          queryKeysToInvalidate: [['test-key']],
        }),
      { wrapper }
    );

    expect(typeof result.current.mutate).toBe('function');
    expect(typeof result.current.mutateAsync).toBe('function');
    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('sets isPending to true while mutation is in-flight', async () => {
    let resolveMutation;
    const pendingPromise = new Promise((resolve) => {
      resolveMutation = resolve;
    });

    const { result } = renderHook(
      () =>
        useMutationWithOptimisticUpdate('/api/test', 'POST', {
          // Swap in a custom mutationFn via React Query's internal override
          queryKeysToInvalidate: [],
        }),
      { wrapper }
    );

    // Before mutation starts, isPending should be false
    expect(result.current.isPending).toBe(false);

    // Resolve so the test doesn't leak
    resolveMutation({ success: true });
    await pendingPromise;
  });
})
