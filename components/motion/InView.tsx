"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "motion/react";

/**
 * Mounts `children` only once the wrapper scrolls near the viewport. Used to
 * defer fetching and hydrating below-the-fold client chunks (Recharts
 * charts, the player comparison picker) until they're about to be seen,
 * instead of on initial page load.
 */
export function InView({
  children,
  fallback = null,
  className,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "200px" });

  return (
    <div ref={ref} className={className}>
      {inView ? children : fallback}
    </div>
  );
}
