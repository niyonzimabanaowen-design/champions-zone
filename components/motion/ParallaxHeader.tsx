"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import type { ReactNode } from "react";

export function ParallaxHeader({
  src,
  alt,
  eyebrow,
  title,
  overlayClassName,
  sizes = "100vw",
  children,
}: {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  /** Extra tint layer painted between the dark base overlay and the grain —
   * e.g. a navy-to-cyan gradient for a page with its own accent mood. */
  overlayClassName?: string;
  /** Defaults to the full viewport. Override to request a smaller source
   * image on phones — this is a dark, tinted, grained background photo, so
   * the extra sharpness a full-width fetch buys there isn't worth the
   * bytes. */
  sizes?: string;
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
          sizes={sizes}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-bg/55" />
        {overlayClassName && <div className={`absolute inset-0 ${overlayClassName}`} />}
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
