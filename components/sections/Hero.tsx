"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type gsap from "gsap";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/use-media-query";
import { useIdle } from "@/lib/use-idle";
import { HeroLightLayer } from "@/components/three/HeroLightLayer";
import { Magnetic } from "@/components/motion/Magnetic";

const INTRO_SESSION_KEY = "cz-intro-played";

export function Hero() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const [introPlaying, setIntroPlaying] = useState(false);

  const isTabletUp = useMediaQuery("(min-width: 640px)");
  const reducedMotion = usePrefersReducedMotion();
  const idle = useIdle();
  // Deferred until idle so the 5MB video never competes with the poster
  // image for bandwidth during the critical first paint / LCP window.
  const showVideo = isTabletUp && !reducedMotion && idle;

  useLayoutEffect(() => {
    const alreadyPlayed =
      typeof window !== "undefined" && sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Mobile never gets the video/3D payoff behind the flicker reveal, so the
    // SplitText + timeline CPU cost isn't earning its keep there — skip
    // straight to the final visible state, same as reduced motion.
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;

    if (alreadyPlayed || reduced || isMobile || !headlineRef.current) {
      return;
    }

    let revert: (() => void) | undefined;
    let cancelled = false;

    // Dynamically imported so the gsap/SplitText module — and its real
    // registration cost at evaluation time — never loads on mobile or
    // reduced-motion, rather than just skipping the calls that use it.
    import("@/lib/gsap-split-text").then(({ gsap, SplitText }) => {
      if (cancelled || !headlineRef.current) return;

      const ctx = gsap.context(() => {
        const split = new SplitText(headlineRef.current, { type: "chars" });

        gsap.set(overlayRef.current, { opacity: 1, pointerEvents: "auto" });
        gsap.set(split.chars, { opacity: 0, y: 24 });
        gsap.set([labelRef.current, subRef.current, ctaRef.current], { opacity: 0, y: 16 });

        setIntroPlaying(true);

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => {
            sessionStorage.setItem(INTRO_SESSION_KEY, "1");
            gsap.set(overlayRef.current, { pointerEvents: "none" });
            setIntroPlaying(false);
            split.revert();
          },
        });
        timelineRef.current = tl;

        // Floodlights flickering on, then settling.
        tl.to(overlayRef.current, { opacity: 0.55, duration: 0.09 })
          .to(overlayRef.current, { opacity: 0.92, duration: 0.07 })
          .to(overlayRef.current, { opacity: 0.3, duration: 0.12 })
          .to(overlayRef.current, { opacity: 0.85, duration: 0.06 })
          .to(overlayRef.current, { opacity: 0.15, duration: 0.1 })
          .to(overlayRef.current, { opacity: 0, duration: 0.9, ease: "power2.inOut" })
          .to(split.chars, { opacity: 1, y: 0, stagger: 0.025, duration: 0.6 }, "-=0.45")
          .to(labelRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.55")
          .to(subRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.35")
          .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3");
      });
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  function handleSkip() {
    timelineRef.current?.progress(1);
  }

  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/hero/stadium-crowd-night.jpg"
          alt="A packed stadium crowd under floodlights on a European night"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
        />
        {showVideo && (
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700"
            poster="/images/hero/stadium-crowd-night.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onPlaying={(e) => e.currentTarget.classList.add("opacity-100")}
          >
            <source src="/video/hero-stadium.mp4" type="video/mp4" />
          </video>
        )}
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bg/70 via-bg/15 to-transparent" />
      <div className="grain absolute inset-0 -z-10" />

      <HeroLightLayer />

      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 z-30 bg-bg opacity-0"
        aria-hidden
      />

      {introPlaying && (
        <button
          type="button"
          onClick={handleSkip}
          className="absolute right-4 top-4 z-40 rounded-full border border-line/60 bg-bg/40 px-3 py-1.5 text-xs text-muted backdrop-blur-sm transition-colors hover:text-text sm:right-6 sm:top-6"
        >
          Skip intro
        </button>
      )}

      <div className="relative z-20 mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
        <p
          ref={labelRef}
          className="font-display text-sm uppercase tracking-[0.2em] text-accent"
        >
          2026/27 League Phase
        </p>
        <h1
          ref={headlineRef}
          className="mt-3 font-display text-5xl uppercase tracking-tight text-text sm:text-7xl"
        >
          UEFA Champions League
        </h1>
        <p ref={subRef} className="mx-auto mt-4 max-w-xl text-muted">
          Live standings, fixtures, and stats for the 2026/27 season — on the
          road to the final at the Estadio Metropolitano, Madrid.
        </p>
        <div ref={ctaRef} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <Link
              href="/standings"
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
            >
              Live Table
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              href="/fixtures"
              className="rounded-full border border-line bg-surface-2 px-6 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-surface"
            >
              Fixtures
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
