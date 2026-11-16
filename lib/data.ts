import "server-only";

import { cache } from "react";
import { fetchMatches, fetchScorers, fetchStandings, fetchTeams, hasApiKey } from "@/lib/api";
import {
  fallbackCapturedAt,
  getFallbackMatches,
  getFallbackScorers,
  getFallbackStandings,
  getFallbackTeams,
} from "@/lib/fallback";
import {
  computeForm,
  computeHomeAwayStandings,
  computePositionHistory,
  type FinishedResult,
  type PositionAtMatchday,
} from "@/lib/standings-splits";
import type { Match, Scorer, Standing, Team } from "@/types";

export interface DataResult<T> {
  data: T;
  source: "live" | "fallback";
  updatedAt: string;
}

/**
 * One snapshot of all four football-data.org endpoints this site ever
 * calls (standings, matches, teams, scorers), fetched in parallel exactly
 * once per request (cache()'d below) and reused by every page. Every other
 * view — a single matchday's fixtures, finished-only results, home/away
 * splits, form guides, a club's record, goals-per-matchday, position
 * history — is derived from this in plain JS in the functions below, never
 * by calling the API again.
 *
 * Each of the four endpoints degrades independently: if one keeps failing
 * after lib/api.ts's own retries (and has no last-good response cached
 * there either), only that endpoint falls back to its static seed — a
 * working /standings doesn't get thrown away just because /scorers is
 * having a bad moment. `source` is "fallback" if any of the four had to
 * fall back, so the UI's "Updated" badge stays honest about it.
 */
interface Snapshot {
  standings: Standing[];
  currentMatchday: number | null;
  matches: Match[];
  scorers: Scorer[];
  teams: Team[];
  source: "live" | "fallback";
  updatedAt: string;
}

async function loadSnapshot(): Promise<Snapshot> {
  if (!hasApiKey()) {
    return fallbackSnapshot();
  }

  const [standingsResult, matchesResult, scorersResult, teamsResult] = await Promise.allSettled([
    fetchStandings(),
    fetchMatches(),
    fetchScorers(),
    fetchTeams(),
  ]);

  let anyFallback = false;

  let standings: Standing[];
  let currentMatchday: number | null;
  if (standingsResult.status === "fulfilled") {
    ({ standings, currentMatchday } = standingsResult.value);
  } else {
    console.error("loadSnapshot: standings failed, using fallback", standingsResult.reason);
    standings = getFallbackStandings();
    currentMatchday = null;
    anyFallback = true;
  }

  let teams: Team[];
  if (teamsResult.status === "fulfilled") {
    teams = teamsResult.value;
  } else {
    console.error("loadSnapshot: teams failed, using fallback", teamsResult.reason);
    teams = getFallbackTeams();
    anyFallback = true;
  }

  let matches: Match[];
  if (matchesResult.status === "fulfilled") {
    const venueByTeamId = new Map(teams.map((t) => [t.id, t.venue]));
    matches = matchesResult.value.map((m) => ({
      ...m,
      venue: venueByTeamId.get(m.homeTeam.id),
    }));
  } else {
    console.error("loadSnapshot: matches failed, using fallback", matchesResult.reason);
    matches = getFallbackMatches();
    anyFallback = true;
  }

  let scorers: Scorer[];
  if (scorersResult.status === "fulfilled") {
    scorers = scorersResult.value;
  } else {
    console.error("loadSnapshot: scorers failed, using fallback", scorersResult.reason);
    scorers = getFallbackScorers();
    anyFallback = true;
  }

  return {
    standings,
    currentMatchday,
    matches,
    scorers,
    teams,
    source: anyFallback ? "fallback" : "live",
    updatedAt: anyFallback ? fallbackCapturedAt : new Date().toISOString(),
  };
}

function fallbackSnapshot(): Snapshot {
  return {
    standings: getFallbackStandings(),
    currentMatchday: null,
    matches: getFallbackMatches(),
    scorers: getFallbackScorers(),
    teams: getFallbackTeams(),
    source: "fallback",
    updatedAt: fallbackCapturedAt,
  };
}

/** Request-scoped: every lib/data.ts function below calls this, but it only
 * actually fetches once per request no matter how many of them run. */
const getSnapshot = cache(loadSnapshot);

function toFinishedResults(matches: Match[]): FinishedResult[] {
  return matches
    .filter(
      (m) => m.status === "FINISHED" && m.score.fullTime.home !== null && m.score.fullTime.away !== null,
    )
    .map((m) => ({
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeGoals: m.score.fullTime.home as number,
      awayGoals: m.score.fullTime.away as number,
      utcDate: m.utcDate,
      matchday: m.matchday,
    }));
}

export async function getStandings(): Promise<DataResult<Standing[]>> {
  const s = await getSnapshot();
  return { data: s.standings, source: s.source, updatedAt: s.updatedAt };
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
 * home/away splits for this competition's league-phase format).
 */
export async function getStandingsSplits(): Promise<StandingsSplits> {
  const s = await getSnapshot();
  const finished = toFinishedResults(s.matches);
  const formMap = computeForm(
    finished,
    s.standings.map((row) => row.team.id),
  );
  const full = s.standings.map((row) => ({ ...row, form: formMap.get(row.team.id) ?? row.form }));
  const { home, away } = computeHomeAwayStandings(full, finished);
  const withForm = (rows: Standing[]) =>
    rows.map((r) => ({ ...r, form: formMap.get(r.team.id) ?? r.form }));

  return {
    full,
    home: withForm(home),
    away: withForm(away),
    source: s.source,
    updatedAt: s.updatedAt,
  };
}

/** Falls back to matchday 5 — the next scheduled round per the spec's seed
 * schedule — if the season's current matchday can't be read. */
export async function getCurrentMatchday(): Promise<number> {
  const s = await getSnapshot();
  return s.currentMatchday ?? 5;
}

export async function getMatches(matchday?: number): Promise<DataResult<Match[]>> {
  const s = await getSnapshot();
  const data = matchday ? s.matches.filter((m) => m.matchday === matchday) : s.matches;
  return { data, source: s.source, updatedAt: s.updatedAt };
}

/** The most recently finished results across all matchdays, for the Home
 * page ticker. */
export async function getLatestResults(limit = 10): Promise<DataResult<Match[]>> {
  const s = await getSnapshot();
  const finished = s.matches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate))
    .slice(0, limit);
  return { data: finished, source: s.source, updatedAt: s.updatedAt };
}

export async function getScorers(limit = 10): Promise<DataResult<Scorer[]>> {
  const s = await getSnapshot();
  return { data: s.scorers.slice(0, limit), source: s.source, updatedAt: s.updatedAt };
}

export async function getTeams(): Promise<DataResult<Team[]>> {
  const s = await getSnapshot();
  return { data: s.teams, source: s.source, updatedAt: s.updatedAt };
}

export interface ClubDetail {
  team: Team;
  standing?: Standing;
  matches: Match[];
  topScorer?: Scorer;
  positionHistory: PositionAtMatchday[];
  updatedAt: string;
}

export type ClubDetailResult = ClubDetail | "not-found";

/**
 * Everything a club page needs, aggregated from the shared snapshot: the
 * team record, its row in the full standings, every match it's played or
 * has scheduled, its top scorer among the competition's scorers list, and a
 * position-over-time series recomputed from finished results. Works on
 * fallback data too now that the fallback seed includes the full team and
 * match lists — only an unknown slug is "not-found".
 */
export const getClubDetail = cache(async (slug: string): Promise<ClubDetailResult> => {
  const s = await getSnapshot();
  const team = s.teams.find((t) => t.slug === slug);
  if (!team) return "not-found";

  const standing = s.standings.find((st) => st.team.id === team.id);
  const clubMatches = s.matches.filter(
    (m) => m.homeTeam.id === team.id || m.awayTeam.id === team.id,
  );
  const topScorer = s.scorers
    .filter((sc) => sc.team.id === team.id)
    .sort((a, b) => b.goals - a.goals)[0];

  const finished = toFinishedResults(s.matches);
  const playedMatchdays = [...new Set(finished.map((r) => r.matchday))].sort((a, b) => a - b);
  const positionHistory = computePositionHistory(team.id, s.teams, finished, playedMatchdays);

  return {
    team,
    standing,
    matches: clubMatches,
    topScorer,
    positionHistory,
    updatedAt: s.updatedAt,
  };
});

export interface BigWin {
  homeTeam: Match["homeTeam"];
  awayTeam: Match["awayTeam"];
  homeGoals: number;
  awayGoals: number;
  matchday: number;
}

export interface CleanSheetEntry {
  team: Match["homeTeam"];
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
 * Everything on the Stats Center, derived from the shared snapshot's
 * scorers list and finished results — none of which football-data.org
 * exposes directly as an endpoint.
 */
export async function getStatsOverview(): Promise<StatsOverview> {
  const s = await getSnapshot();
  const scorers = s.scorers;
  const finished = toFinishedResults(s.matches);

  const topScorers = [...scorers].sort((a, b) => b.goals - a.goals).slice(0, 10);
  const topAssists = scorers
    .filter((sc) => (sc.assists ?? 0) > 0)
    .sort((a, b) => (b.assists ?? 0) - (a.assists ?? 0))
    .slice(0, 10);

  const goalsByMatchdayMap = new Map<number, number>();
  for (const r of finished) {
    goalsByMatchdayMap.set(
      r.matchday,
      (goalsByMatchdayMap.get(r.matchday) ?? 0) + r.homeGoals + r.awayGoals,
    );
  }
  const goalsByMatchday = [...goalsByMatchdayMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([matchday, goals]) => ({ matchday, goals }));

  const biggestWins: BigWin[] = [...finished]
    .filter((r) => r.homeGoals !== r.awayGoals)
    .sort((a, b) => Math.abs(b.homeGoals - b.awayGoals) - Math.abs(a.homeGoals - a.awayGoals))
    .slice(0, 5)
    .map((r) => ({
      homeTeam: r.homeTeam,
      awayTeam: r.awayTeam,
      homeGoals: r.homeGoals,
      awayGoals: r.awayGoals,
      matchday: r.matchday,
    }));

  const cleanSheetMap = new Map<number, CleanSheetEntry>();
  for (const r of finished) {
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
  const cleanSheets = [...cleanSheetMap.values()].sort((a, b) => b.count - a.count).slice(0, 8);

  return {
    topScorers,
    topAssists,
    allScorers: [...scorers].sort((a, b) => b.goals - a.goals),
    goalsByMatchday,
    biggestWins,
    cleanSheets,
    source: s.source,
    updatedAt: s.updatedAt,
  };
}
