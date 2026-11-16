"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/use-media-query";

/**
 * Shows `value` immediately — in the server-rendered HTML, and as React's
 * initial client render — so crawlers, no-JS visitors, and slow devices
 * always see the real number straight away. Once mounted, if motion is
 * allowed and the viewport is big enough, it then *also* plays a count-up
 * animation from 0 on scrolling into view, purely as a layered-on-top
 * client enhancement; reduced-motion and phones skip that entirely and just
 * keep showing the real value, untouched.
 */
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
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || reducedMotion || isPhone) return;
    const controls = animate(0, value, {
      duration,
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
