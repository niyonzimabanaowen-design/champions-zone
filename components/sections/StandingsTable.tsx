import Image from "next/image";
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

export function StandingsTable({ standings }: { standings: Standing[] }) {
  return (
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
            {standings.map((row) => (
              <tr
                key={row.team.id}
                className="border-b border-line/60 transition-colors last:border-b-0 hover:bg-surface-2"
              >
                <td className="relative px-3 py-2.5 text-center tabular text-muted">
                  <span
                    className={`absolute left-0 top-0 h-full w-0.5 ${ZONE_DOT[row.zone]}`}
                    aria-hidden
                  />
                  {row.position}
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
                <td className="tabular px-2 py-2.5 text-center text-muted">{row.playedGames}</td>
                <td className="tabular px-2 py-2.5 text-center text-muted">{row.won}</td>
                <td className="tabular px-2 py-2.5 text-center text-muted">{row.draw}</td>
                <td className="tabular px-2 py-2.5 text-center text-muted">{row.lost}</td>
                <td className="tabular px-2 py-2.5 text-center text-muted">{row.goalsFor}</td>
                <td className="tabular px-2 py-2.5 text-center text-muted">{row.goalsAgainst}</td>
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
              </tr>
            ))}
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
  );
}
