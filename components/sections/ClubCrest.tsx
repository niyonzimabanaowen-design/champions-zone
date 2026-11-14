"use client";

import { motion } from "motion/react";
import Image from "next/image";

/** Shared-element crest: the same layoutId on the grid card and the club
 * page header lets Motion fly/scale it between them across the route
 * transition (see RouteTransitions). */
export function ClubCrest({
  teamId,
  src,
  alt,
  size = 64,
}: {
  teamId: number;
  src: string;
  alt: string;
  size?: number;
}) {
  return (
    <motion.div
      layoutId={`crest-${teamId}`}
      style={{ width: size, height: size }}
      className="relative shrink-0"
    >
      <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-contain" />
    </motion.div>
  );
}
