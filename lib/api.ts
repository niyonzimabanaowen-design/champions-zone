import "server-only";

import type { Match, MatchStatus, Scorer, Standing, Team } from "@/types";
import { zoneForPosition } from "@/lib/zone";
import { CLUB_SLUG_OVERRIDES } from "@/lib/club-slugs";
import type { FinishedResult } from "@/lib/standings-splits";

/**
 * Server-only football-data.org v4 helpers for competition CL (UEFA
 * Champions League). Never import this from a client component — the API
 * key must stay server-side. Callers should go through `lib/data.ts`, which
 * falls back to local seed data when this throws or no key is configured.
 */

const BASE_URL = "https://api.football-data.org/v4";
const COMPETITION = "CL";
const REVALIDATE_SECONDS = 300;

export function hasApiKey(): boolean {
  return Boolean(process.env.FOOTBALL_DATA_API_KEY);
}

async function footballDataFetch<T>(path: string): Promise<T> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error("FOOTBALL_DATA_API_KEY is not set");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "X-Auth-Token": apiKey },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(
      `football-data.org request failed: ${res.status} ${res.statusText} (${path})`,
    );
  }

  return res.json() as Promise<T>;
}

interface RawTeamRef {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface RawStandingsResponse {
  season: { currentMatchday: number | null };
  standings: Array<{
    type: string;
    table: Array<{
      position: number;
      team: RawTeamRef;
      playedGames: number;
      won: number;
      draw: number;
      lost: number;
      points: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
      form: string | null;
    }>;
  }>;
}

export async function fetchStandings(): Promise<Standing[]> {
  const data = await footballDataFetch<RawStandingsResponse>(
    `/competitions/${COMPETITION}/standings`,
  );
  const total = data.standings.find((s) => s.type === "TOTAL") ?? data.standings[0];

  return total.table.map((row) => ({
    position: row.position,
    team: row.team,
    playedGames: row.playedGames,
    won: row.won,
    draw: row.draw,
    lost: row.lost,
    points: row.points,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDifference: row.goalDifference,
    form: row.form
      ? (row.form.split(",").filter((r) => r === "W" || r === "D" || r === "L") as Standing["form"])
      : undefined,
    zone: zoneForPosition(row.position),
  }));
}

/** Reuses the standings endpoint (Next.js dedupes identical fetches per
 * request) purely to read the season's current matchday number. */
export async function fetchCurrentMatchday(): Promise<number | null> {
  const data = await footballDataFetch<RawStandingsResponse>(
    `/competitions/${COMPETITION}/standings`,
  );
  return data.season.currentMatchday;
}

interface RawTeamsResponse {
  teams: Array<{
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
    founded?: number;
    clubColors?: string;
    venue?: string;
    website?: string;
    area: { name: string };
  }>;
}

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function fetchTeams(): Promise<Team[]> {
  const data = await footballDataFetch<RawTeamsResponse>(
    `/competitions/${COMPETITION}/teams`,
  );

  return data.teams.map((t) => ({
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    tla: t.tla,
    crest: t.crest,
    slug: CLUB_SLUG_OVERRIDES[t.id] ?? slugify(t.shortName || t.name),
    country: t.area.name,
    founded: t.founded,
    clubColors: t.clubColors,
    venue: t.venue,
    website: t.website,
  }));
}

interface RawMatchesResponse {
  matches: Array<{
    id: number;
    utcDate: string;
    status: MatchStatus;
    matchday: number;
    stage: string;
    homeTeam: RawTeamRef;
    awayTeam: RawTeamRef;
    score: { fullTime: { home: number | null; away: number | null } };
  }>;
}

export async function fetchMatches(matchday?: number): Promise<Match[]> {
  const query = matchday ? `?matchday=${matchday}` : "";
  const [matchesData, teams] = await Promise.all([
    footballDataFetch<RawMatchesResponse>(`/competitions/${COMPETITION}/matches${query}`),
    fetchTeams(),
  ]);

  const venueByTeamId = new Map(teams.map((t) => [t.id, t.venue]));

  return matchesData.matches.map((m) => ({
    id: m.id,
    utcDate: m.utcDate,
    status: m.status,
    matchday: m.matchday,
    stage: m.stage,
    venue: venueByTeamId.get(m.homeTeam.id),
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    score: m.score,
  }));
}

/** All finished league-phase results, for deriving real home/away splits and
 * form guides client-side (see lib/standings-splits.ts). */
export async function fetchFinishedResults(): Promise<FinishedResult[]> {
  const data = await footballDataFetch<RawMatchesResponse>(
    `/competitions/${COMPETITION}/matches?status=FINISHED`,
  );

  return data.matches
    .filter((m) => m.score.fullTime.home !== null && m.score.fullTime.away !== null)
    .map((m) => ({
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeGoals: m.score.fullTime.home as number,
      awayGoals: m.score.fullTime.away as number,
      utcDate: m.utcDate,
      matchday: m.matchday,
    }));
}

interface RawScorersResponse {
  scorers: Array<{
    player: { id: number; name: string; nationality?: string };
    team: RawTeamRef;
    goals: number;
    assists: number | null;
    playedMatches: number;
  }>;
}

export async function fetchScorers(limit = 10): Promise<Scorer[]> {
  const data = await footballDataFetch<RawScorersResponse>(
    `/competitions/${COMPETITION}/scorers?limit=${limit}`,
  );

  return data.scorers.map((s) => ({
    player: s.player,
    team: s.team,
    goals: s.goals,
    assists: s.assists ?? undefined,
    playedMatches: s.playedMatches,
  }));
}
