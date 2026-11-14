"use client";

import { motion } from "motion/react";

export function TitlesByClubChart({ data }: { data: { club: string; titles: number }[] }) {
  const max = Math.max(...data.map((d) => d.titles), 1);

  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.club} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-sm text-text sm:w-40">{d.club}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              whileInView={{ width: `${(d.titles / max) * 100}%` }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-sm font-semibold tabular text-text">
            {d.titles}
          </span>
        </div>
      ))}
    </div>
  );
}
