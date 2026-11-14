"use client";

import { useMemo, useState } from "react";
import { StandingsTable } from "@/components/sections/StandingsTable";
import { formPoints } from "@/lib/standings-splits";
import type { Standing } from "@/types";

type ViewKey = "full" | "home" | "away";
type SortKey = "points" | "goalDifference" | "goalsFor" | "form";

const VIEW_OPTIONS: { key: ViewKey; label: string }[] = [
  { key: "full", label: "Full" },
  { key: "home", label: "Home" },
  { key: "away", label: "Away" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "points", label: "Points" },
  { key: "goalDifference", label: "Goal Difference" },
  { key: "goalsFor", label: "Goals For" },
  { key: "form", label: "Form" },
];

function sortRows(rows: Standing[], key: SortKey): Standing[] {
  if (key === "points") return rows;
  const copy = [...rows];
  if (key === "form") {
    copy.sort((a, b) => formPoints(b.form) - formPoints(a.form) || b.points - a.points);
  } else {
    copy.sort((a, b) => b[key] - a[key] || b.points - a.points);
  }
  return copy;
}

/**
 * Full/Home/Away view switcher + Points/Goal Difference/Goals For/Form sort,
 * both driving the same Motion row-reorder animation with transient
 * position-change arrows. Home and Away are real tables derived from
 * finished match results (see lib/standings-splits.ts) — when they're empty
 * (no live match data to derive them from), those tabs are disabled rather
 * than showing an empty or duplicated table.
 */
export function StandingsExplorer({
  full,
  home,
  away,
}: {
  full: Standing[];
  home: Standing[];
  away: Standing[];
}) {
  const [view, setView] = useState<ViewKey>("full");
  const [sortBy, setSortBy] = useState<SortKey>("points");
  const [deltas, setDeltas] = useState<Map<number, number>>(new Map());

  const datasets: Record<ViewKey, Standing[]> = { full, home, away };
  const hasHomeAway = home.length > 0 && away.length > 0;

  const rows = useMemo(
    () => sortRows(datasets[view], sortBy),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, sortBy, full, home, away],
  );

  function applyChange(nextView: ViewKey, nextSort: SortKey) {
    if (nextView === view && nextSort === sortBy) return;

    const prevOrder = new Map(rows.map((s, i) => [s.team.id, i]));
    const nextRows = sortRows(datasets[nextView], nextSort);
    const newDeltas = new Map<number, number>();
    nextRows.forEach((s, newIndex) => {
      const oldIndex = prevOrder.get(s.team.id);
      if (oldIndex !== undefined && oldIndex !== newIndex) {
        newDeltas.set(s.team.id, oldIndex - newIndex);
      }
    });

    setDeltas(newDeltas);
    setView(nextView);
    setSortBy(nextSort);
    window.setTimeout(() => setDeltas(new Map()), 1800);
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {VIEW_OPTIONS.map((opt) => {
            const disabled = opt.key !== "full" && !hasHomeAway;
            return (
              <button
                key={opt.key}
                type="button"
                disabled={disabled}
                title={disabled ? "Needs live match results to compute" : undefined}
                onClick={() => applyChange(opt.key, sortBy)}
                className={`rounded-full px-3.5 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  view === opt.key
                    ? "bg-accent text-bg"
                    : "bg-surface text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted">Sort by</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => applyChange(view, opt.key)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                sortBy === opt.key
                  ? "bg-accent text-bg"
                  : "bg-surface text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <StandingsTable standings={rows} deltas={deltas} />
    </div>
  );
}
