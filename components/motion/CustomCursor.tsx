"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/use-media-query";

const CLICKABLE_SELECTOR = 'a, button, [role="button"], input, select, textarea, label';

/**
 * A small dot that follows the pointer and grows over clickable elements.
 * Desktop-with-a-precise-pointer only, off under prefers-reduced-motion.
 * Position tracking is applied directly to the DOM (no React state) so
 * mousemove never triggers a re-render — only the inner element's CSS
 * transition animates (its scale), keeping the outer tracking instantaneous.
 */
export function CustomCursor() {
  const isPrecisePointer = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
  const reducedMotion = usePrefersReducedMotion();
  const active = isPrecisePointer && !reducedMotion;

  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    function handleMove(e: MouseEvent) {
      const outer = outerRef.current;
      const inner = innerRef.current;
      if (!outer || !inner) return;

      outer.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;

      const isClickable = Boolean((e.target as HTMLElement).closest(CLICKABLE_SELECTOR));
      inner.style.transform = isClickable
        ? "translate(-50%, -50%) scale(2.6)"
        : "translate(-50%, -50%) scale(1)";
      inner.style.opacity = isClickable ? "0.2" : "0.5";
    }

    document.addEventListener("mousemove", handleMove);
    document.body.classList.add("custom-cursor-active");

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={outerRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90]"
      style={{ transform: "translate3d(-100px, -100px, 0)" }}
    >
      <div
        ref={innerRef}
        className="h-4 w-4 rounded-full bg-accent transition-transform duration-200 ease-out"
        style={{ transform: "translate(-50%, -50%) scale(1)", opacity: 0.5 }}
      />
    </div>
  );
}
