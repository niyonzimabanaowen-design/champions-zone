"use client";

import { useEffect, useState } from "react";

/**
 * True once the browser reports an idle moment after mount (falls back to a
 * short timeout where requestIdleCallback isn't available, e.g. Safari).
 * Lets non-critical, bandwidth/CPU-heavy mounts (the hero video, the 3D
 * light layer) wait until after the initial paint/LCP window instead of
 * competing with it for the same bandwidth and main-thread time.
 */
export function useIdle(timeout = 1500): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (idle) return;

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (w.requestIdleCallback) {
      const handle = w.requestIdleCallback(() => setIdle(true), { timeout });
      return () => w.cancelIdleCallback?.(handle);
    }

    const id = window.setTimeout(() => setIdle(true), 200);
    return () => window.clearTimeout(id);
  }, [idle, timeout]);

  return idle;
}
