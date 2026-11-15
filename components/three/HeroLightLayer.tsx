"use client";

import dynamic from "next/dynamic";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/use-media-query";
import { useIdle } from "@/lib/use-idle";

const LightParticles = dynamic(() => import("@/components/three/LightParticles"), {
  ssr: false,
});

/**
 * Desktop-only decorative layer on top of the hero video/photo. Skipped on
 * small screens (perf + the spec's "skip the 3D layer on mobile") and under
 * prefers-reduced-motion. Deferred until idle so its ~240KB Three.js chunk
 * never competes with the hero's critical image/text for bandwidth or
 * main-thread time during the initial paint.
 */
export function HeroLightLayer() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const reducedMotion = usePrefersReducedMotion();
  const idle = useIdle();

  if (!isDesktop || reducedMotion || !idle) return null;

  return (
    <div className="absolute inset-0 z-10" aria-hidden>
      <LightParticles />
    </div>
  );
}
