"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

/**
 * Wraps route content so Motion's layoutId-based shared-element transitions
 * (e.g. a club crest flying from the grid card to the club page header) can
 * track an element across a route change, gives every navigation a quick
 * cross-fade, and layers a brief floodlight-flash wipe on top of the swap —
 * the spec's signature page-transition moment. Both collapse to an instant
 * swap under prefers-reduced-motion.
 */
export function RouteTransitions({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div key={pathname}>{children}</div>;
  }

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence initial={false}>
        <motion.div
          key={pathname}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[200]"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--accent) 65%, white) 0%, transparent 55%)",
          }}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </AnimatePresence>
    </>
  );
}
