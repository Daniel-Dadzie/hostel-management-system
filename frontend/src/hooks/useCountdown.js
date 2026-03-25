import { useEffect, useState } from 'react';

/**
 * Custom hook for countdown timer
 * Returns remaining time in seconds and formatted string (MM:SS)
 * Useful for payment deadlines, event countdowns, etc.
 */
export function useCountdown(dueDate) {
  const [remaining, setRemaining] = useState(null);
  const [hasWarned5Min, setHasWarned5Min] = useState(false);

  useEffect(() => {
    if (!dueDate) {
      setRemaining(null);
      return;
    }

    // Update countdown every second
    const interval = setInterval(() => {
      const now = new Date();
      const due = new Date(dueDate);
      const diffMs = due - now;
      const diffSecs = Math.floor(diffMs / 1000);

      if (diffSecs <= 0) {
        setRemaining(0);
      } else {
        setRemaining(diffSecs);

        // Track 5-minute warning threshold (300 seconds)
        if (diffSecs <= 300 && !hasWarned5Min) {
          setHasWarned5Min(true);
        }
      }
    }, 1000);

    // Initial calculation
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    const diffSecs = Math.floor(diffMs / 1000);
    setRemaining(diffSecs > 0 ? diffSecs : 0);

    return () => clearInterval(interval);
  }, [dueDate, hasWarned5Min]);

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    if (seconds <= 0) return '00:00';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return {
    remaining,
    formatted: formatTime(remaining),
    isLessThan5Min: remaining !== null && remaining <= 300,
    isExpired: remaining === 0,
    hasWarned5Min,
    setHasWarned5Min
  };
}
