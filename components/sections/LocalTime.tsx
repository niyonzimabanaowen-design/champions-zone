"use client";

import { useSyncExternalStore } from "react";

function noopSubscribe() {
  return () => {};
}

function formatUtc(utcDate: string): string {
  return (
    new Date(utcDate).toLocaleString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC"
  );
}

function formatLocal(utcDate: string): string {
  return new Date(utcDate).toLocaleString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Renders a kickoff time in the viewer's own local timezone. Server and
 * client render in different timezones in general, so this uses
 * useSyncExternalStore's server/client snapshot split (rather than setState
 * in an effect) to show a neutral UTC-labelled snapshot during SSR/hydration
 * and the viewer-local time right after, without a hydration mismatch.
 */
export function LocalTime({ utcDate }: { utcDate: string }) {
  const label = useSyncExternalStore(
    noopSubscribe,
    () => formatLocal(utcDate),
    () => formatUtc(utcDate),
  );

  return <span suppressHydrationWarning>{label}</span>;
}
