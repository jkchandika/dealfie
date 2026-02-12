import { useState, useEffect } from 'react';
import { formatTimeRemaining } from '../lib/utils';

export function useCountdown(endTime: string) {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return timeRemaining;
}
