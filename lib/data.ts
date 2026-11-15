import "server-only";

import { cache } from "react";
import {
  fetchCurrentMatchday,
  fetchFinishedResults,
  fetchMatches,
  fetchScorers,
  fetchStandings,
  fetchTeams,
  hasApiKey,
} from "@/lib/api";
import {
  fallbackCapturedAt,
  getFallbackMatches,
  getFallbackScorers,
  getFallbackStandings,
} from "@/lib/fallback";
import {
  computeForm,
  computeHomeAwayStandings,
  computePositionHistory,
  type PositionAtMatchday,
} from "@/lib/standings-splits";
import type { Match, Scorer, Standing, Team, TeamRef } from "@/types";

export interface DataResult<T> {
  data: T;
  source: "live" | "fallback";
  updatedAt: string;
}

/**
 * Single entry point for competition data: prefers the live football-data.org
 * API whenever a key is configured, and falls back to the captured seed data
 * in /data on any error (missing key, network failure, rate limit). Every
 * page should read through here instead of calling lib/api or lib/fallback
 * directly, so the live/fallback choice and "Updated" timestamp stay
 * consistent across the site.
 */

export async function getStandings(): Promise<DataResult<Standing[]>> {
  if (hasApiKey()) {
    try {
      const data = await fetchStandings();
      return { data, source: "live", updatedAt: new Date().toISOString() };
    } catch (err) {
      console.error("getStandings: live fetch failed, using fallback", err);
    }
  }
  return { data: getFallbackStandings(), source: "fallback", updatedAt: fallbackCapturedAt };
}

export interface StandingsSplits {
  full: Standing[];
  home: Standing[];
  away: Standing[];
  source: "live" | "fallback";
  updatedAt: string;
}

/**
 * Full table plus real Home-only and Away-only tables and last-5 form,
 * derived from finished match results (football-data.org doesn't expose
 * home/away splits for this competition's league-phase format). Home/Away
 * come back empty when live data isn't available — the fallback seed has no
 * match-level results to honestly derive them from.
 */
export async function getStandingsSplits(): Promise<StandingsSplits> {
  if (hasApiKey()) {
    try {
      const [total, results] = await Promise.all([fetchStandings(), fetchFinishedResults()]);
      const formMap = computeForm(
        results,
        total.map((s) => s.team.id),
      );
      const full = total.map((s) => ({ ...s, form: formMap.get(s.team.id) ?? s.form }));
      const { home, away } = computeHomeAwayStandings(full, results);
      const withForm = (rows: Standing[]) =>
        rows.map((r) => ({ ...r, form: formMap.get(r.team.id) ?? r.form }));
      return {
        full,
        home: withForm(home),
        away: withForm(away),
        source: "live",
        updatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error("getStandingsSplits: live fetch/compute failed, using fallback", err);
    }
  }
  return {
    full: getFallbackStandings(),
    home: [],
    away: [],
    source: "fallback",
    updatedAt: fallbackCapturedAt,
  };
}

/** Falls back to matchday 5 — the next scheduled round per the spec's seed
 * schedule — if the live API's current matchday can't be read. */
export async function getCurrentMatchday(): Promise<number> {
  if (hasApiKey()) {
    try {
      const matchday = await fetchCurrentMatchday();
      if (matchday) return matchday;
    } catch (err) {
      console.error("getCurrentMatchday: live fetch failed, using fallback", err);
    }
  }
  return 5;
}

export async function getMatches(matchday?: number): Promise<DataResult<Match[]>> {
  if (hasApiKey()) {
    try {
      const data = await fetchMatches(matchday);
      return { data, source: "live", updatedAt: new Date().toISOString() };
    } catch (err) {
      console.error("getMatches: live fetch failed, using fallback", err);
    }
  }
  return { data: getFallbackMatches(), source: "fallback", updatedAt: fallbackCapturedAt };
}

/** The most recently finished results across all matchdays, for the Home
 * page ticker — reuses the same /matches endpoint fetchMatches() already
 * hits elsewhere (Next dedupes identical fetches within one request). */
export async function getLatestResults(limit = 10): Promise<DataResult<Match[]>> {
  if (hasApiKey()) {
    try {
      const all = await fetchMatches();
      const finished = all
        .filter((m) => m.status === "FINISHED")
        .sort((a, b) => b.utcDate.localeCompare(a.utcDate))
        .slice(0, limit);
      return { data: finished, source: "live", updatedAt: new Date().toISOString() };
    } catch (err) {
      console.error("getLatestResults: live fetch failed, using fallback", err);
    }
  }
  // No real fixture-level fallback data exists (see getMatches), so this is
  // honestly empty rather than invented.
  return { data: [], source: "fallback", updatedAt: fallbackCapturedAt };
}

export async function getScorers(limit = 10): Promise<DataResult<Scorer[]>> {
  if (hasApiKey()) {
    try {
      const data = await fetchScorers(limit);
      return { data, source: "live", updatedAt: new Date().toISOString() };
    } catch (err) {
      console.error("getScorers: live fetch failed, using fallback", err);
    }
  }
  return { data: getFallbackScorers().slice(0, limit), source: "fallback", updatedAt: fallbackCapturedAt };
}

export async function getTeams(): Promise<DataResult<Team[]>> {
  if (hasApiKey()) {
    try {
      const data = await fetchTeams();
      return { data, source: "live", updatedAt: new Date().toISOString() };
    } catch (err) {
      console.error("getTeams: live fetch failed, using fallback", err);
    }
  }
  // No real per-team content (founded year, venue, etc.) was supplied for the
  // fallback beyond what's embedded in the standings/scorers seed, so without
  // a key or a working API call there is honestly no team list to show.
  return { data: [], source: "fallback", updatedAt: fallbackCapturedAt };
}

export interface ClubDetail {
  team: Team;
  standing?: Standing;
  matches: Match[];
  topScorer?: Scorer;
  positionHistory: PositionAtMatchday[];
  updatedAt: string;
}

export type ClubDetailResult = ClubDetail | "unavailable" | "not-found";

/**
 * Everything a club page needs, aggregated from real live data: the team
 * record, its row in the full standings, every match it's played or has
 * scheduled, its top scorer among the competition's scorers list, and a
 * position-over-time series recomputed from finished results (the API only
 * exposes the current standings snapshot, not historical ones). Returns
 * "unavailable" when live data isn't reachable (no honest fallback exists
 * for this much team-specific detail) or "not-found" for an unknown slug.
 * Wrapped in React's cache() so the page and generateMetadata share one
 * fetch instead of duplicating the whole aggregation per request.
 */
export const getClubDetail = cache(async (slug: string): Promise<ClubDetailResult> => {
  if (!hasApiKey()) return "unavailable";
  try {
    const [teams, standings, matches, scorers, results] = await Promise.all([
      fetchTeams(),
      fetchStandings(),
      fetchMatches(),
      fetchScorers(100),
      fetchFinishedResults(),
    ]);

    const team = teams.find((t) => t.slug === slug);
    if (!team) return "not-found";

    const standing = standings.find((s) => s.team.id === team.id);
    const clubMatches = matches.filter(
      (m) => m.homeTeam.id === team.id || m.awayTeam.id === team.id,
    );
    const topScorer = scorers
      .filter((s) => s.team.id === team.id)
      .sort((a, b) => b.goals - a.goals)[0];

    const playedMatchdays = [...new Set(results.map((r) => r.matchday))].sort((a, b) => a - b);
    const positionHistory = computePositionHistory(team.id, teams, results, playedMatchdays);

    return {
      team,
      standing,
      matches: clubMatches,
      topScorer,
      positionHistory,
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("getClubDetail: live fetch failed", err);
    return "unavailable";
  }
});

export interface BigWin {
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  homeGoals: number;
  awayGoals: number;
  matchday: number;
}

export interface CleanSheetEntry {
  team: TeamRef;
  count: number;
}

export interface StatsOverview {
  topScorers: Scorer[];
  topAssists: Scorer[];
  /** Every scorer fetched (up to 100), for the player comparison picker's
   * pool — wider than the top-10 leaderboards. */
  allScorers: Scorer[];
  goalsByMatchday: { matchday: number; goals: number }[];
  biggestWins: BigWin[];
  cleanSheets: CleanSheetEntry[];
  source: "live" | "fallback";
  updatedAt: string;
}

/**
 * Everything on the Stats Center, all derived from real data: the scorers
 * endpoint (fetched with a high limit so assists/clean-sheets have a
 * reasonable pool to work from) and the 72 finished results, aggregated
 * client-side for goals-per-matchday, biggest wins, and clean sheets — none
 * of which football-data.org exposes directly as an endpoint.
 */
export async function getStatsOverview(): Promise<StatsOverview> {
  if (hasApiKey()) {
    try {
      const [scorers, results] = await Promise.all([fetchScorers(100), fetchFinishedResults()]);

      const topScorers = [...scorers].sort((a, b) => b.goals - a.goals).slice(0, 10);
      const topAssists = scorers
        .filter((s) => (s.assists ?? 0) > 0)
        .sort((a, b) => (b.assists ?? 0) - (a.assists ?? 0))
        .slice(0, 10);

      const goalsByMatchdayMap = new Map<number, number>();
      for (const r of results) {
        goalsByMatchdayMap.set(
          r.matchday,
          (goalsByMatchdayMap.get(r.matchday) ?? 0) + r.homeGoals + r.awayGoals,
        );
      }
      const goalsByMatchday = [...goalsByMatchdayMap.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([matchday, goals]) => ({ matchday, goals }));

      const biggestWins: BigWin[] = [...results]
        .filter((r) => r.homeGoals !== r.awayGoals)
        .sort(
          (a, b) =>
            Math.abs(b.homeGoals - b.awayGoals) - Math.abs(a.homeGoals - a.awayGoals),
        )
        .slice(0, 5)
        .map((r) => ({
          homeTeam: r.homeTeam,
          awayTeam: r.awayTeam,
          homeGoals: r.homeGoals,
          awayGoals: r.awayGoals,
          matchday: r.matchday,
        }));

      const cleanSheetMap = new Map<number, CleanSheetEntry>();
      for (const r of results) {
        if (r.awayGoals === 0) {
          const entry = cleanSheetMap.get(r.homeTeam.id) ?? { team: r.homeTeam, count: 0 };
          entry.count += 1;
          cleanSheetMap.set(r.homeTeam.id, entry);
        }
        if (r.homeGoals === 0) {
          const entry = cleanSheetMap.get(r.awayTeam.id) ?? { team: r.awayTeam, count: 0 };
          entry.count += 1;
          cleanSheetMap.set(r.awayTeam.id, entry);
        }
      }
      const cleanSheets = [...cleanSheetMap.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      return {
        topScorers,
        topAssists,
        allScorers: [...scorers].sort((a, b) => b.goals - a.goals),
        goalsByMatchday,
        biggestWins,
        cleanSheets,
        source: "live",
        updatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error("getStatsOverview: live fetch failed, using fallback", err);
    }
  }

  const fallbackScorers = getFallbackScorers();
  return {
    topScorers: fallbackScorers,
    topAssists: fallbackScorers
      .filter((s) => (s.assists ?? 0) > 0)
      .sort((a, b) => (b.assists ?? 0) - (a.assists ?? 0)),
    allScorers: fallbackScorers,
    // No real match-level fallback data exists to honestly derive these.
    goalsByMatchday: [],
    biggestWins: [],
    cleanSheets: [],
    source: "fallback",
    updatedAt: fallbackCapturedAt,
  };
}
