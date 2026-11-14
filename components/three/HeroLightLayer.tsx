"use client";

import dynamic from "next/dynamic";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/use-media-query";

const LightParticles = dynamic(() => import("@/components/three/LightParticles"), {
  ssr: false,
});

/**
 * Desktop-only decorative layer on top of the hero video/photo. Skipped on
 * small screens (perf + the spec's "skip the 3D layer on mobile") and under
 * prefers-reduced-motion.
 */
export function HeroLightLayer() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const reducedMotion = usePrefersReducedMotion();

  if (!isDesktop || reducedMotion) return null;

  return (
    <div className="absolute inset-0 z-10" aria-hidden>
      <LightParticles />
    </div>
  );
}
