#!/usr/bin/env node
/**
 * Runs once, before `next build`, and warms the same disk cache
 * lib/api.ts's footballDataFetch() reads from (see DISK_CACHE_DIR / the
 * cache-file naming there — kept identical here on purpose).
 *
 * Without this, `next build`'s static generation spreads the 36 club pages
 * across several parallel worker processes, each hitting these endpoints
 * before any shared cache has a chance to warm up — the actual cause of
 * the 429s this was written to fix. Pre-fetching all four endpoints here,
 * sequentially, in one process, before any page generation starts, means
 * every worker's first real request is already a cache hit.
 *
 * If FOOTBALL_DATA_API_KEY isn't set, or a request fails, this just logs
 * and exits 0 — the build still proceeds, and lib/data.ts's own fallback
 * (static seed data) takes over per-endpoint as usual.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DISK_CACHE_DIR = join(tmpdir(), "champions-zone-football-data-cache");

function diskCacheFile(path) {
  return join(DISK_CACHE_DIR, `${path.replace(/[^a-zA-Z0-9]/g, "_")}.json`);
}

// On Vercel, env vars (including FOOTBALL_DATA_API_KEY) are already real
// process.env entries for the whole build shell. Locally, only `next`
// itself knows to load .env.local — a plain `node` script run before it
// doesn't — so read it by hand here, without adding a dotenv dependency
// just for this one script.
if (!process.env.FOOTBALL_DATA_API_KEY) {
  try {
    const envLocal = await readFile(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of envLocal.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // No .env.local — fine, the key may already be set some other way.
  }
}

const apiKey = process.env.FOOTBALL_DATA_API_KEY;
if (!apiKey) {
  console.log("[prefetch] FOOTBALL_DATA_API_KEY not set — skipping; build uses fallback seed data.");
  process.exit(0);
}

const BASE_URL = "https://api.football-data.org/v4";
const PATHS = [
  "/competitions/CL/standings",
  "/competitions/CL/matches",
  "/competitions/CL/scorers?limit=100",
  "/competitions/CL/teams",
];
const MAX_ATTEMPTS = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(path) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(`${BASE_URL}${path}`, { headers: { "X-Auth-Token": apiKey } });

    if (res.status === 429) {
      if (attempt === MAX_ATTEMPTS) return { ok: false, status: res.status, statusText: res.statusText };
      // This runs before anything user-facing, so it can afford to actually
      // wait out the real reset window rather than capping it short.
      const resetSeconds = Number(res.headers.get("X-RequestCounter-Reset"));
      const waitMs = (Number.isFinite(resetSeconds) ? Math.max(resetSeconds, 1) : 10 * attempt) * 1000;
      console.log(`[prefetch] ${path} -> 429, waiting ${Math.round(waitMs / 1000)}s then retrying`);
      await sleep(waitMs);
      continue;
    }

    if (!res.ok) return { ok: false, status: res.status, statusText: res.statusText };
    return { ok: true, data: await res.json() };
  }
}

await mkdir(DISK_CACHE_DIR, { recursive: true });

for (const path of PATHS) {
  try {
    const result = await fetchWithRetry(path);
    if (!result.ok) {
      console.error(`[prefetch] ${path} -> ${result.status} ${result.statusText}; build will fall back for this endpoint.`);
      continue;
    }
    await writeFile(diskCacheFile(path), JSON.stringify({ data: result.data, cachedAt: Date.now() }));
    console.log(`[prefetch] cached ${path}`);
  } catch (err) {
    console.error(`[prefetch] ${path} errored:`, err instanceof Error ? err.message : err);
  }
}
