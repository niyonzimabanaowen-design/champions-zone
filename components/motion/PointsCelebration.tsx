"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

const COLORS = ["#46d3ff", "#c9d3ea", "#3ddc97", "#f2c14e"];

/** Deterministic pseudo-random in [0, 1) — React's purity rules disallow
 * calling Math.random() during render (even memoized), so this scatters the
 * confetti from a pure function of the seed instead. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Lightweight confetti burst built from plain Motion-animated divs — no
 * extra dependency needed for a one-off celebration effect. */
export function PointsCelebration({
  points,
  maxPoints,
}: {
  points: number;
  maxPoints: number;
}) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        x: pseudoRandom(i + 1) * 100,
        delay: pseudoRandom(i + 101) * 0.5,
        color: COLORS[i % COLORS.length],
        rotate: pseudoRandom(i + 201) * 360 - 180,
      })),
    [],
  );

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-line bg-surface p-8 text-center">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            className="absolute top-0 h-2 w-2 rounded-sm"
            style={{ left: `${p.x}%`, backgroundColor: p.color }}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{ y: 260, opacity: 0, rotate: p.rotate }}
            transition={{ duration: 1.8, delay: p.delay, ease: "easeIn" }}
          />
        ))}
      </div>
      <p className="font-display tabular text-5xl text-text">
        {points} / {maxPoints}
      </p>
      <p className="mt-1 text-sm text-muted">points earned this matchday</p>
    </div>
  );
}
