"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Standing, Zone } from "@/types";

const ZONE_LABEL: Record<Zone, string> = {
  qualify: "Round of 16",
  playoff: "Knockout play-off",
  out: "Eliminated",
};

const ZONE_DOT: Record<Zone, string> = {
  qualify: "bg-qualify",
  playoff: "bg-playoff",
  out: "bg-out",
};

type SortKey = "points" | "goalDifference" | "goalsFor";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "points", label: "Points" },
  { key: "goalDifference", label: "Goal Difference" },
  { key: "goalsFor", label: "Goals For" },
];

/**
 * The football-data.org standings endpoint only returns a single TOTAL table
 * for this competition's league-phase (Swiss) format — there's no real
 * home/away split to toggle between. Sorting by a different real stat is the
 * honest way to demonstrate the same "rows reorder" motion the spec asks for.
 */
export function StandingsTable({
  standings,
  sortable = false,
}: {
  standings: Standing[];
  sortable?: boolean;
}) {
  const [sortBy, setSortBy] = useState<SortKey>("points");
  const [deltas, setDeltas] = useState<Map<number, number>>(new Map());

  const sorted = useMemo(() => {
    if (!sortable || sortBy === "points") return standings;
    return [...standings].sort(
      (a, b) => b[sortBy] - a[sortBy] || a.position - b.position,
    );
  }, [standings, sortBy, sortable]);

  function handleSort(key: SortKey) {
    if (key === sortBy) return;

    const prevOrder = new Map(sorted.map((s, i) => [s.team.id, i]));
    const next =
      key === "points"
        ? standings
        : [...standings].sort((a, b) => b[key] - a[key] || a.position - b.position);

    const newDeltas = new Map<number, number>();
    next.forEach((s, newIndex) => {
      const oldIndex = prevOrder.get(s.team.id) ?? newIndex;
      if (oldIndex !== newIndex) newDeltas.set(s.team.id, oldIndex - newIndex);
    });

    setDeltas(newDeltas);
    setSortBy(key);
    window.setTimeout(() => setDeltas(new Map()), 1800);
  }

  return (
    <div>
      {sortable && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted">Sort by</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleSort(opt.key)}
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
      )}

      <div className="overflow-hidden rounded-2xl border border-line">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-left text-xs uppercase tracking-wide text-muted">
                <th className="w-10 px-3 py-3 text-center">#</th>
                <th className="px-3 py-3">Club</th>
                <th className="tabular px-2 py-3 text-center">P</th>
                <th className="tabular px-2 py-3 text-center">W</th>
                <th className="tabular px-2 py-3 text-center">D</th>
                <th className="tabular px-2 py-3 text-center">L</th>
                <th className="tabular px-2 py-3 text-center">GF</th>
                <th className="tabular px-2 py-3 text-center">GA</th>
                <th className="tabular px-2 py-3 text-center">GD</th>
                <th className="tabular px-3 py-3 text-center font-semibold text-text">Pts</th>
                <th className="px-3 py-3">Form</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, idx) => {
                const delta = deltas.get(row.team.id);
                return (
                  <motion.tr
                    key={row.team.id}
                    layout
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="border-b border-line/60 transition-colors last:border-b-0 hover:bg-surface-2"
                  >
                    <td className="relative px-3 py-2.5 text-center tabular text-muted">
                      <span
                        className={`absolute left-0 top-0 h-full w-0.5 ${ZONE_DOT[row.zone]}`}
                        aria-hidden
                      />
                      <span className="inline-flex items-center gap-1">
                        {idx + 1}
                        <AnimatePresence>
                          {delta !== undefined && delta !== 0 && (
                            <motion.span
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className={`inline-flex items-center text-[10px] font-semibold ${
                                delta > 0 ? "text-qualify" : "text-out"
                              }`}
                            >
                              {delta > 0 ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Image
                          src={row.team.crest}
                          alt={`${row.team.name} crest`}
                          width={22}
                          height={22}
                          className="h-5.5 w-5.5 shrink-0 object-contain"
                        />
                        <span className="truncate text-text">{row.team.shortName}</span>
                      </div>
                    </td>
                    <td className="tabular px-2 py-2.5 text-center text-muted">
                      {row.playedGames}
                    </td>
                    <td className="tabular px-2 py-2.5 text-center text-muted">{row.won}</td>
                    <td className="tabular px-2 py-2.5 text-center text-muted">{row.draw}</td>
                    <td className="tabular px-2 py-2.5 text-center text-muted">{row.lost}</td>
                    <td className="tabular px-2 py-2.5 text-center text-muted">
                      {row.goalsFor}
                    </td>
                    <td className="tabular px-2 py-2.5 text-center text-muted">
                      {row.goalsAgainst}
                    </td>
                    <td className="tabular px-2 py-2.5 text-center text-muted">
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>
                    <td className="tabular px-3 py-2.5 text-center font-semibold text-text">
                      {row.points}
                    </td>
                    <td className="px-3 py-2.5">
                      {row.form && row.form.length > 0 ? (
                        <div className="flex gap-1">
                          {row.form.map((r, i) => (
                            <span
                              key={i}
                              className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold ${
                                r === "W"
                                  ? "bg-qualify/20 text-qualify"
                                  : r === "D"
                                    ? "bg-playoff/20 text-playoff"
                                    : "bg-out/20 text-out"
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-4 border-t border-line bg-surface px-4 py-3 text-xs text-muted">
          {(["qualify", "playoff", "out"] as Zone[]).map((zone) => (
            <span key={zone} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${ZONE_DOT[zone]}`} aria-hidden />
              {ZONE_LABEL[zone]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
