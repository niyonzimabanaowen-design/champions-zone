import standingsSeed from "@/data/standings.json";
import scorersSeed from "@/data/scorers.json";
import scheduleSeed from "@/data/schedule.json";
import type { Match, Scorer, Standing } from "@/types";
import { zoneForPosition } from "@/lib/zone";

/**
 * Local seed data captured from the real football-data.org API (see each
 * file's `note`/`capturedAt`). Used only when FOOTBALL_DATA_API_KEY is
 * missing or the live API call fails — never invented. Only the top 8
 * standings and top 5 scorers were captured, so the fallback table/leaderboard
 * are intentionally partial rather than padded with made-up rows.
 */

export function getFallbackStandings(): Standing[] {
  return standingsSeed.table.map((row) => ({
    ...row,
    zone: zoneForPosition(row.position),
  }));
}

export function getFallbackScorers(): Scorer[] {
  return scorersSeed.scorers.map((s) => ({
    ...s,
    assists: s.assists ?? undefined,
  }));
}

export function getFallbackSchedule() {
  return scheduleSeed;
}

/** No real fixture-level data was supplied for the fallback, so this is
 * honestly empty rather than invented — the Fixtures page shows a notice
 * when it falls back with no matches available. */
export function getFallbackMatches(): Match[] {
  return [];
}

export const fallbackCapturedAt = standingsSeed.capturedAt;
