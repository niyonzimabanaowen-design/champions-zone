import "server-only";

import {
  fetchCurrentMatchday,
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
import type { Match, Scorer, Standing, Team } from "@/types";

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
