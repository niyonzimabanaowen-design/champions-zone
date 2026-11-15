"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import type { CSSProperties } from "react";

export interface Final {
  year: number;
  winner: string;
  runnerUp: string;
  score: string;
  city: string;
  stadium: string;
  photo: string;
  note?: string;
}

/**
 * Scroll-pinned "Road to the Final" story on sm+ screens: a CSS-sticky panel
 * stays put while the page scrolls through a tall track behind it, and GSAP
 * (scrubbed to scroll position) crossfades each final's photo + caption in
 * turn. Below sm, the pin/crossfade/ScrollTrigger setup is skipped entirely
 * (measurably expensive on throttled mobile CPUs for a short scroll
 * distance that wouldn't read well anyway) in favor of a plain stacked
 * gallery — pure CSS via the sm: breakpoint, so this degrades correctly even
 * without JS.
 */
export function FinalsTimeline({ finals }: { finals: Final[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    const slides = slideRefs.current.filter((el): el is HTMLDivElement => el !== null);
    const markers = markerRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (reducedMotion || isMobile || !trackRef.current || slides.length === 0) return;

    let revert: (() => void) | undefined;
    let cancelled = false;

    // Dynamically imported so the gsap/ScrollTrigger module — and its
    // real registration cost at evaluation time — never loads on mobile or
    // reduced-motion, rather than just skipping the calls that use it.
    import("@/lib/gsap-scroll-trigger").then(({ gsap }) => {
      if (cancelled || !trackRef.current) return;
      const ctx = gsap.context(() => {
        gsap.set(slides.slice(1), { opacity: 0 });
        gsap.set(markers.slice(1), { opacity: 0.4, scale: 0.9 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: trackRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
          },
        });

        slides.forEach((slide, i) => {
          if (i === 0) return;
          const pos = i - 1;
          tl.to(slides[i - 1], { opacity: 0, duration: 1 }, pos)
            .to(slide, { opacity: 1, duration: 1 }, pos)
            .to(markers[i - 1], { opacity: 0.4, scale: 0.9, duration: 0.5 }, pos)
            .to(markers[i], { opacity: 1, scale: 1, duration: 0.5 }, pos);
        });
      }, trackRef);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [finals.length]);

  const trackStyle = { "--track-h": `${finals.length * 100}vh` } as CSSProperties;

  return (
    <div ref={trackRef} style={trackStyle} className="relative sm:h-[var(--track-h)]">
      <div className="static overflow-visible sm:sticky sm:top-0 sm:h-screen sm:overflow-hidden">
        {finals.map((f, i) => (
          <div
            key={f.year}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className={`relative mb-4 h-[70vh] sm:absolute sm:inset-0 sm:mb-0 sm:h-auto ${
              i === 0 ? "" : "sm:opacity-0"
            }`}
          >
            <Image
              src={f.photo}
              alt={`${f.stadium}, ${f.city} — host of the ${f.year} final`}
              fill
              sizes="100vw"
              priority={i === 0}
              fetchPriority={i === 0 ? "high" : "low"}
              loading={i === 0 ? "eager" : "lazy"}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-bg/60" />
            <div className="grain absolute inset-0" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
              <p className="font-display tabular text-6xl text-text sm:text-8xl">{f.year}</p>
              <p className="mt-3 font-display text-xl uppercase tracking-tight text-text sm:text-2xl">
                {f.winner}
              </p>
              <p className="mt-1 text-sm text-muted">
                beat {f.runnerUp} {f.score}
              </p>
              <p className="mt-2 text-sm text-accent">
                {f.stadium}, {f.city}
              </p>
              {f.note && <p className="mt-3 max-w-sm text-xs text-muted">{f.note}</p>}
            </div>
          </div>
        ))}

        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 hidden justify-center gap-2 sm:flex">
          {finals.map((f, i) => (
            <div
              key={f.year}
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
              className="rounded-full bg-surface/80 px-3 py-1 text-xs tabular text-text backdrop-blur-sm"
              style={{ opacity: i === 0 ? 1 : 0.4 }}
            >
              {f.year}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
