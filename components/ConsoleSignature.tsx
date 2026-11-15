"use client";

import { useEffect } from "react";

/**
 * Logs a styled attribution message to the browser console on load. Anyone
 * who opens devtools (now or by scrolling back up later) will see it —
 * there's no reliable, non-hacky way to detect devtools opening itself, and
 * this is the standard approach real sites use for this exact kind of
 * console easter egg.
 */
export function ConsoleSignature() {
  useEffect(() => {
    console.log(
      "%cChampions Zone%c\ndesigned & built by Bana Owen",
      "font-size: 20px; font-weight: bold; color: #46d3ff;",
      "font-size: 12px; color: #93a0c2;",
    );
  }, []);

  return null;
}
