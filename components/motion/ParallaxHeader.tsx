"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import type { ReactNode } from "react";

export function ParallaxHeader({
  src,
  alt,
  eyebrow,
  title,
  children,
}: {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Skipped on mobile: the scroll distance is usually too short for the
    // effect to read well there anyway, and merely *importing* gsap's
    // ScrollTrigger plugin (even if never used) runs real registration work
    // at module-evaluation time — measurably expensive on throttled mobile
    // CPUs. A dynamic import() keeps that module out of mobile's bundle
    // entirely, rather than just skipping the function calls that use it.
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (reducedMotion || isMobile || !sectionRef.current || !imgWrapRef.current) return;

    let revert: (() => void) | undefined;
    let cancelled = false;

    import("@/lib/gsap-scroll-trigger").then(({ gsap }) => {
      if (cancelled || !sectionRef.current || !imgWrapRef.current) return;
      const ctx = gsap.context(() => {
        gsap.to(imgWrapRef.current, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }, sectionRef);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative isolate overflow-hidden border-b border-line">
      <div ref={imgWrapRef} className="absolute -inset-y-[12%] inset-x-0 -z-10">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-bg/55" />
        <div className="grain absolute inset-0" />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl uppercase tracking-tight text-text sm:text-5xl">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
