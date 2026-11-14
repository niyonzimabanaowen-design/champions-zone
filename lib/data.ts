import "server-only";

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
import { computeForm, computeHomeAwayStandings } from "@/lib/standings-splits";
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
