"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";

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
 * Scroll-pinned "Road to the Final" story: a CSS-sticky panel stays put
 * while the page scrolls through a tall track behind it, and GSAP
 * (scrubbed to scroll position) crossfades each final's photo + caption in
 * turn. Sticky positioning does the actual pinning — GSAP only drives the
 * crossfade — so the section still degrades gracefully (just stacks
 * normally) if JS or ScrollTrigger doesn't run.
 */
export function FinalsTimeline({ finals }: { finals: Final[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slides = slideRefs.current.filter((el): el is HTMLDivElement => el !== null);
    const markers = markerRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (reducedMotion || !trackRef.current || slides.length === 0) return;

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

    return () => ctx.revert();
  }, [finals.length]);

  return (
    <div ref={trackRef} style={{ height: `${finals.length * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
        {finals.map((f, i) => (
          <div
            key={f.year}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="absolute inset-0"
          >
            <Image
              src={f.photo}
              alt={`${f.stadium}, ${f.city} — host of the ${f.year} final`}
              fill
              sizes="100vw"
              priority={i === 0}
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

        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex justify-center gap-2">
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
