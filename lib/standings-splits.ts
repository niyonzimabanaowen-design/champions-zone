import type { FormResult, Standing, TeamRef, Zone } from "@/types";

export interface FinishedResult {
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  homeGoals: number;
  awayGoals: number;
  utcDate: string;
  matchday: number;
}

interface TeamAgg {
  team: TeamRef;
  played: number;
  won: number;
  draw: number;
  lost: number;
  gf: number;
  ga: number;
}

function emptyAgg(team: TeamRef): TeamAgg {
  return { team, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0 };
}

/**
 * Derives real Home-only and Away-only tables from finished match results.
 * football-data.org doesn't expose these splits for this competition's
 * league-phase (Swiss) format, so this aggregates them ourselves from actual
 * results rather than inventing numbers. Zone always reflects each team's
 * real overall qualification standing (from the official TOTAL table), not
 * its rank within the home/away subset.
 */
export function computeHomeAwayStandings(
  teams: { team: TeamRef; zone: Zone; position: number }[],
  results: FinishedResult[],
): { home: Standing[]; away: Standing[] } {
  const homeAgg = new Map<number, TeamAgg>();
  const awayAgg = new Map<number, TeamAgg>();
  const zoneByTeam = new Map(teams.map((t) => [t.team.id, t.zone]));
  const totalPositionByTeam = new Map(teams.map((t) => [t.team.id, t.position]));

  for (const { team } of teams) {
    homeAgg.set(team.id, emptyAgg(team));
    awayAgg.set(team.id, emptyAgg(team));
  }

  for (const r of results) {
    const h = homeAgg.get(r.homeTeam.id) ?? emptyAgg(r.homeTeam);
    h.played++;
    h.gf += r.homeGoals;
    h.ga += r.awayGoals;
    if (r.homeGoals > r.awayGoals) h.won++;
    else if (r.homeGoals === r.awayGoals) h.draw++;
    else h.lost++;
    homeAgg.set(r.homeTeam.id, h);

    const a = awayAgg.get(r.awayTeam.id) ?? emptyAgg(r.awayTeam);
    a.played++;
    a.gf += r.awayGoals;
    a.ga += r.homeGoals;
    if (r.awayGoals > r.homeGoals) a.won++;
    else if (r.awayGoals === r.homeGoals) a.draw++;
    else a.lost++;
    awayAgg.set(r.awayTeam.id, a);
  }

  function toStandings(agg: Map<number, TeamAgg>): Standing[] {
    const rows = [...agg.values()].map((a) => {
      const points = a.won * 3 + a.draw;
      const goalDifference = a.gf - a.ga;
      return {
        team: a.team,
        playedGames: a.played,
        won: a.won,
        draw: a.draw,
        lost: a.lost,
        points,
        goalsFor: a.gf,
        goalsAgainst: a.ga,
        goalDifference,
        zone: zoneByTeam.get(a.team.id) ?? ("out" as Zone),
      };
    });
    rows.sort((x, y) => {
      if (y.points !== x.points) return y.points - x.points;
      if (y.goalDifference !== x.goalDifference) return y.goalDifference - x.goalDifference;
      if (y.goalsFor !== x.goalsFor) return y.goalsFor - x.goalsFor;
      const posX = totalPositionByTeam.get(x.team.id) ?? 999;
      const posY = totalPositionByTeam.get(y.team.id) ?? 999;
      return posX - posY;
    });
    return rows.map((r, i) => ({ ...r, position: i + 1 }));
  }

  return { home: toStandings(homeAgg), away: toStandings(awayAgg) };
}

/** Each team's last `count` finished results (any venue), oldest first. */
export function computeForm(
  results: FinishedResult[],
  teamIds: number[],
  count = 5,
): Map<number, FormResult[]> {
  const byTeam = new Map<number, { date: string; result: FormResult }[]>();
  for (const id of teamIds) byTeam.set(id, []);

  for (const r of results) {
    const homeResult: FormResult =
      r.homeGoals > r.awayGoals ? "W" : r.homeGoals === r.awayGoals ? "D" : "L";
    const awayResult: FormResult =
      r.awayGoals > r.homeGoals ? "W" : r.awayGoals === r.homeGoals ? "D" : "L";
    byTeam.get(r.homeTeam.id)?.push({ date: r.utcDate, result: homeResult });
    byTeam.get(r.awayTeam.id)?.push({ date: r.utcDate, result: awayResult });
  }

  const formMap = new Map<number, FormResult[]>();
  for (const [id, list] of byTeam) {
    list.sort((a, b) => a.date.localeCompare(b.date));
    formMap.set(
      id,
      list.slice(-count).map((x) => x.result),
    );
  }
  return formMap;
}

export function formPoints(form: FormResult[] | undefined): number {
  if (!form) return 0;
  return form.reduce((sum, r) => sum + (r === "W" ? 3 : r === "D" ? 1 : 0), 0);
}

export interface PositionAtMatchday {
  matchday: number;
  position: number;
  points: number;
}

/**
 * Recomputes the full table from scratch using only results up to each given
 * matchday, then reads off one team's rank at each point — a real
 * "position over time" series derived from actual results, since the API
 * only exposes the current snapshot, not historical standings.
 */
export function computePositionHistory(
  teamId: number,
  teamRefs: TeamRef[],
  results: FinishedResult[],
  matchdays: number[],
): PositionAtMatchday[] {
  return matchdays.map((matchday) => {
    const upto = results.filter((r) => r.matchday <= matchday);
    const agg = new Map<number, { won: number; draw: number; lost: number; gf: number; ga: number }>();
    for (const t of teamRefs) agg.set(t.id, { won: 0, draw: 0, lost: 0, gf: 0, ga: 0 });

    for (const r of upto) {
      const h = agg.get(r.homeTeam.id);
      if (h) {
        h.gf += r.homeGoals;
        h.ga += r.awayGoals;
        if (r.homeGoals > r.awayGoals) h.won++;
        else if (r.homeGoals === r.awayGoals) h.draw++;
        else h.lost++;
      }
      const a = agg.get(r.awayTeam.id);
      if (a) {
        a.gf += r.awayGoals;
        a.ga += r.homeGoals;
        if (r.awayGoals > r.homeGoals) a.won++;
        else if (r.awayGoals === r.homeGoals) a.draw++;
        else a.lost++;
      }
    }

    const table = teamRefs.map((t) => {
      const s = agg.get(t.id)!;
      const points = s.won * 3 + s.draw;
      const goalDifference = s.gf - s.ga;
      return { id: t.id, points, goalDifference, goalsFor: s.gf };
    });
    table.sort(
      (x, y) =>
        y.points - x.points || y.goalDifference - x.goalDifference || y.goalsFor - x.goalsFor,
    );

    const index = table.findIndex((t) => t.id === teamId);
    return { matchday, position: index + 1, points: table[index]?.points ?? 0 };
  });
}
