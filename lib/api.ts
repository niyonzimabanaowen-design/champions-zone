import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Match, MatchStatus, Scorer, Standing, Team } from "@/types";
import { zoneForPosition } from "@/lib/zone";
import { CLUB_SLUG_OVERRIDES } from "@/lib/club-slugs";

/**
 * Server-only football-data.org v4 helpers for competition CL (UEFA
 * Champions League). Never import this from a client component — the API
 * key must stay server-side. Callers should go through `lib/data.ts`, which
 * falls back to local seed data when this throws or no key is configured.
 *
 * Exactly four endpoints are ever called, each with a single, unchanging
 * URL (no per-matchday, per-status, or per-limit query variations) so
 * Next's fetch cache — keyed by URL — holds exactly one entry per endpoint,
 * shared by every page and every visitor, refreshed at most once every
 * REVALIDATE_SECONDS regardless of traffic. Every other view on the site
 * (a single matchday's fixtures, a club's results, finished-only results,
 * home/away splits, form guides, stats) is derived in lib/data.ts from
 * these four responses in plain JS — never from its own API call.
 */

const BASE_URL = "https://api.football-data.org/v4";
const COMPETITION = "CL";
const REVALIDATE_SECONDS = 300;
const MAX_ATTEMPTS = 3;

export function hasApiKey(): boolean {
  return Boolean(process.env.FOOTBALL_DATA_API_KEY);
}

// In-memory per-instance cache, checked before every network attempt and
// updated after every success. This alone is enough to dedupe repeat calls
// within one warm server instance at runtime, but `next build`'s static
// generation spreads the 36 club pages across several parallel *worker
// processes* — each with its own memory — so relying on this (or on
// Next's own fetch cache, which turned out not to dedupe reliably across
// those workers either) still meant one real request per worker per
// endpoint. The disk cache below is what actually makes "fetched once per
// build" true: a plain JSON file under the OS temp dir, visible to every
// worker process, read before any network attempt and written after every
// success.
const lastGood = new Map<string, unknown>();

const DISK_CACHE_DIR = join(tmpdir(), "champions-zone-football-data-cache");

function diskCacheFile(path: string): string {
  return join(DISK_CACHE_DIR, `${path.replace(/[^a-zA-Z0-9]/g, "_")}.json`);
}

async function readDiskCache<T>(path: string): Promise<{ data: T; cachedAt: number } | undefined> {
  try {
    const raw = await readFile(diskCacheFile(path), "utf8");
    return JSON.parse(raw) as { data: T; cachedAt: number };
  } catch {
    return undefined;
  }
}

async function writeDiskCache(path: string, data: unknown): Promise<void> {
  try {
    await mkdir(DISK_CACHE_DIR, { recursive: true });
    await writeFile(diskCacheFile(path), JSON.stringify({ data, cachedAt: Date.now() }));
  } catch (err) {
    // Best-effort — e.g. a read-only filesystem at runtime. A failed write
    // just means no cross-process sharing this time, not a broken request.
    console.error(`${path}: failed to write disk cache`, err);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Collapses concurrent callers for the same path into one real request.
// Without this, the ~36 static club pages generated during a build (or a
// burst of concurrent visitors at runtime) each start their own
// Promise.all of the four endpoints before any of them has finished and
// written back to the caches above — a classic thundering-herd miss on
// every one of those caches at once.
const inFlight = new Map<string, Promise<unknown>>();

async function footballDataFetch<T>(path: string): Promise<T> {
  const pending = inFlight.get(path);
  if (pending) return pending as Promise<T>;

  const promise = footballDataFetchUncached<T>(path).finally(() => {
    inFlight.delete(path);
  });
  inFlight.set(path, promise);
  return promise;
}

async function footballDataFetchUncached<T>(path: string): Promise<T> {
  if (lastGood.has(path)) {
    const cached = lastGood.get(path);
    if (cached !== undefined) return cached as T;
  }

  const onDisk = await readDiskCache<T>(path);
  if (onDisk && Date.now() - onDisk.cachedAt < REVALIDATE_SECONDS * 1000) {
    lastGood.set(path, onDisk.data);
    return onDisk.data;
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error("FOOTBALL_DATA_API_KEY is not set");
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // Only logged on an actual network request — a cache hit (memory or
      // disk, above) never reaches this line — so grepping build/runtime
      // logs for this prefix is a direct count of real API traffic.
      console.log(`[football-data] GET ${path} (attempt ${attempt})`);
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "X-Auth-Token": apiKey },
        next: { revalidate: REVALIDATE_SECONDS },
      });

      if (res.status === 429) {
        lastError = new Error(`football-data.org rate limited (429): ${path}`);
        if (attempt < MAX_ATTEMPTS) {
          // Respects the real reset window the API reports, capped so one
          // slow retry can't eat the whole request — a 429 this site
          // triggers almost never needs the full 60s to clear anyway, since
          // the cache keeps real traffic far under the limit already.
          const resetSeconds = Number(res.headers.get("X-RequestCounter-Reset"));
          const waitMs = Number.isFinite(resetSeconds)
            ? Math.min(Math.max(resetSeconds, 1), 5) * 1000
            : 1000 * 2 ** (attempt - 1);
          await sleep(waitMs);
          continue;
        }
        break;
      }

      if (!res.ok) {
        throw new Error(
          `football-data.org request failed: ${res.status} ${res.statusText} (${path})`,
        );
      }

      const data = (await res.json()) as T;
      lastGood.set(path, data);
      await writeDiskCache(path, data);
      return data;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(500 * 2 ** (attempt - 1));
      }
    }
  }

  // Exhausted retries — fall back to whatever's on disk even if it's past
  // its revalidate window, rather than letting the whole site drop to the
  // static fallback seed over one bad request.
  const stale = onDisk ?? (await readDiskCache<T>(path));
  if (stale) {
    console.error(`${path}: refresh failed, serving last good response instead`, lastError);
    lastGood.set(path, stale.data);
    return stale.data;
  }

  throw lastError;
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

/** The one and only call to /standings. Returns the table AND the season's
 * current matchday together, since both come from this single response —
 * there is no separate matchday endpoint to call. */
export async function fetchStandings(): Promise<{
  standings: Standing[];
  currentMatchday: number | null;
}> {
  const data = await footballDataFetch<RawStandingsResponse>(
    `/competitions/${COMPETITION}/standings`,
  );
  const total = data.standings.find((s) => s.type === "TOTAL") ?? data.standings[0];

  const standings = total.table.map((row) => ({
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

  return { standings, currentMatchday: data.season.currentMatchday };
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

/** The one and only call to /teams. */
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

/** The one and only call to /matches — every match in the league phase,
 * any status, no matchday or status filter. Callers filter this single
 * cached list in memory for "this matchday's fixtures" or "finished results
 * only" rather than requesting a different URL per filter. Venue isn't
 * filled in here (that needs the teams list, i.e. a second endpoint) — see
 * lib/data.ts, which already has both from the same snapshot load. */
export async function fetchMatches(): Promise<Match[]> {
  const data = await footballDataFetch<RawMatchesResponse>(
    `/competitions/${COMPETITION}/matches`,
  );

  return data.matches.map((m) => ({
    id: m.id,
    utcDate: m.utcDate,
    status: m.status,
    matchday: m.matchday,
    stage: m.stage,
    venue: undefined,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    score: m.score,
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

/** The one and only call to /scorers, always at the max limit anything on
 * the site needs (100) — callers slice this single cached list down for a
 * top-10 leaderboard rather than requesting a different limit each time. */
export async function fetchScorers(): Promise<Scorer[]> {
  const data = await footballDataFetch<RawScorersResponse>(
    `/competitions/${COMPETITION}/scorers?limit=100`,
  );

  return data.scorers.map((s) => ({
    player: s.player,
    team: s.team,
    goals: s.goals,
    assists: s.assists ?? undefined,
    playedMatches: s.playedMatches,
  }));
}
