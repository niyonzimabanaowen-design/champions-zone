import standingsSeed from "@/data/standings.json";
import scorersSeed from "@/data/scorers.json";
import scheduleSeed from "@/data/schedule.json";
import teamsSeed from "@/data/teams.json";
import matchesSeed from "@/data/matches.json";
import type { Match, MatchStatus, Scorer, Standing, Team } from "@/types";
import { zoneForPosition } from "@/lib/zone";

/**
 * Local seed data captured from the real football-data.org API (see each
 * file's `note`/`capturedAt`). Used only when FOOTBALL_DATA_API_KEY is
 * missing or the live API call fails — never invented. Standings and
 * scorers only captured the top 8 / top 5, so those stay intentionally
 * partial; teams and matches captured the full competition, so club pages,
 * fixtures, and Form guides all have real data to work with even on
 * fallback.
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

export function getFallbackTeams(): Team[] {
  return teamsSeed.teams.map((t) => ({
    ...t,
    founded: t.founded ?? undefined,
    clubColors: t.clubColors ?? undefined,
    venue: t.venue ?? undefined,
    website: t.website ?? undefined,
  }));
}

export function getFallbackMatches(): Match[] {
  return matchesSeed.matches.map((m) => ({
    id: m.id,
    utcDate: m.utcDate,
    status: m.status as MatchStatus,
    matchday: m.matchday,
    stage: m.stage,
    venue: m.venue ?? undefined,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    score: { fullTime: m.score.fullTime },
  }));
}

export const fallbackCapturedAt = standingsSeed.capturedAt;
