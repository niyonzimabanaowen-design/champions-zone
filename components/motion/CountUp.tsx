"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/use-media-query";

/** Counts up to `value` once it scrolls into view. Jumps straight to the
 * final value under prefers-reduced-motion, and on phones — pages like Stats
 * mount a couple dozen of these at once, and animating all of them at the
 * same time is real main-thread work a small screen doesn't need to pay. */
export function CountUp({
  value,
  duration = 1.2,
  prefix = "",
  suffix = "",
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reducedMotion = usePrefersReducedMotion();
  const isPhone = useMediaQuery("(max-width: 639px)");
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    // Routes reduced-motion/phone through the same animate() callback path
    // (just with duration 0, jumping straight to the end) rather than a
    // separate direct setState call, which the lint rule above disallows in
    // effects.
    const controls = animate(0, value, {
      duration: reducedMotion || isPhone ? 0 : duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration, reducedMotion, isPhone]);

  return (
    <span ref={ref} className="tabular">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
