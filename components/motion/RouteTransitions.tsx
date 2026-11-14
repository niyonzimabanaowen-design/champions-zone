"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Wraps route content so Motion's layoutId-based shared-element transitions
 * (e.g. a club crest flying from the grid card to the club page header) can
 * track an element across a route change, and gives every navigation a
 * quick cross-fade in the meantime. The floodlight-flash route wipe from the
 * spec's motion list is a later polish pass — this is the minimum plumbing
 * needed for shared layout animations to work at all in the App Router.
 */
export function RouteTransitions({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
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
  );
}
