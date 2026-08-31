import { useEffect, useState } from 'react';

/** Ticks once a second, always recomputed from the absolute end timestamp so it self-corrects if the JS timer was throttled. */
export function useCountdown(endTimestamp: number | null): number {
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(endTimestamp));

  useEffect(() => {
    setSecondsLeft(secondsUntil(endTimestamp));
    if (endTimestamp === null) return;

    const interval = setInterval(() => {
      setSecondsLeft(secondsUntil(endTimestamp));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTimestamp]);

  return secondsLeft;
}

function secondsUntil(endTimestamp: number | null): number {
  if (endTimestamp === null) return 0;
  return Math.max(0, Math.ceil((endTimestamp - Date.now()) / 1000));
}
