'use client';

import { useState, useEffect } from 'react';
import { getTimeRemaining } from '@/lib/eventUtils';

const ZERO = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };

export const useCountdown = (targetDate: string) => {
  // Start with zeroes so server and client first-render always match (no hydration mismatch).
  const [countdown, setCountdown] = useState(ZERO);

  useEffect(() => {
    // Immediately update to the real value once we're on the client.
    setCountdown(getTimeRemaining(targetDate));

    const interval = setInterval(() => {
      setCountdown(getTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return countdown;
};
