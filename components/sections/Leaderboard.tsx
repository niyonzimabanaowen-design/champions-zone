import Image from "next/image";
import { CountUp } from "@/components/motion/CountUp";

export interface LeaderboardRow {
  id: number;
  crest: string;
  name: string;
  subtitle?: string;
  value: number;
}

export function Leaderboard({ rows }: { rows: LeaderboardRow[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <ul className="space-y-3">
      {rows.map((row, i) => (
        <li key={row.id} className="flex items-center gap-3">
          <span className="w-5 shrink-0 text-center text-xs tabular text-muted">{i + 1}</span>
          <Image
            src={row.crest}
            alt=""
            width={22}
            height={22}
            className="h-5.5 w-5.5 shrink-0 object-contain"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-text">{row.name}</p>
            {row.subtitle && <p className="truncate text-xs text-muted">{row.subtitle}</p>}
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            </div>
          </div>
          <span className="tabular w-6 shrink-0 text-right text-sm font-semibold text-text">
            <CountUp value={row.value} />
          </span>
        </li>
      ))}
    </ul>
  );
}
