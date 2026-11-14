"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: string): TimeLeft {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
  };
}

function useCountdown(target: string): TimeLeft | null {
  const cacheRef = useRef<TimeLeft | null>(null);

  const subscribe = useCallback((onChange: () => void) => {
    const id = setInterval(onChange, 1000);
    return () => clearInterval(id);
  }, []);

  // getSnapshot must return a referentially stable value when nothing has
  // actually changed, or useSyncExternalStore re-renders in a loop — so
  // this only allocates a new object when the second-granularity value
  // differs from the cached one.
  const getSnapshot = useCallback(() => {
    const next = getTimeLeft(target);
    const prev = cacheRef.current;
    if (
      prev &&
      prev.days === next.days &&
      prev.hours === next.hours &&
      prev.minutes === next.minutes &&
      prev.seconds === next.seconds
    ) {
      return prev;
    }
    cacheRef.current = next;
    return next;
  }, [target]);

  const getServerSnapshot = () => null;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function Countdown({ target }: { target: string }) {
  const timeLeft = useCountdown(target);

  const units: { label: string; value: number }[] = [
    { label: "Days", value: timeLeft?.days ?? 0 },
    { label: "Hours", value: timeLeft?.hours ?? 0 },
    { label: "Minutes", value: timeLeft?.minutes ?? 0 },
    { label: "Seconds", value: timeLeft?.seconds ?? 0 },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <span className="font-display tabular text-4xl text-text sm:text-6xl">
            {timeLeft ? String(u.value).padStart(2, "0") : "--"}
          </span>
          <span className="mt-1 text-[11px] uppercase tracking-wide text-muted sm:text-xs">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
