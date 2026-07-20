'use client';

import { useState, useEffect } from 'react';
import { getTimeRemaining } from '@/lib/eventUtils';

export const useCountdown = (targetDate: string) => {
  const [countdown, setCountdown] = useState(getTimeRemaining(targetDate));
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);
  return countdown;
};
