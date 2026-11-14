import type { Zone } from "@/types";

/**
 * League-phase zones for the 2026/27 UCL 36-team format:
 * 1-8 go straight to the round of 16, 9-24 play the knockout play-off,
 * 25-36 are eliminated.
 */
export function zoneForPosition(position: number): Zone {
  if (position <= 8) return "qualify";
  if (position <= 24) return "playoff";
  return "out";
}
