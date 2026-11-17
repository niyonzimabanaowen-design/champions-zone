"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

/**
 * Fades each page in on navigation (pure CSS, `.page-enter` in globals.css,
 * replayed because the wrapper is keyed by pathname) and layers the
 * floodlight-flash wipe on top. The page fade used to be a Motion
 * AnimatePresence mode="wait" cross-fade, which in the App Router left the
 * incoming page stuck at opacity 0 until a full refresh. A CSS animation
 * always completes and needs no JS to make content visible. Next.js handles
 * scroll-to-top and Back/Forward scroll restoration itself.
 */
export function RouteTransitions({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <>
      <div key={pathname} className="page-enter">
        {children}
      </div>

      {!reducedMotion && (
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
      )}
    </>
  );
}
