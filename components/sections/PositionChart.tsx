"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PositionAtMatchday } from "@/lib/standings-splits";

/** Position-over-time, recomputed from real finished results at each
 * matchday boundary (see lib/standings-splits.ts) since the API only gives
 * the current standings snapshot, not a history. SVG color attributes don't
 * resolve CSS custom properties, so the design tokens are hardcoded here. */
export function PositionChart({ data }: { data: PositionAtMatchday[] }) {
  if (data.length < 2) {
    return (
      <p className="text-sm text-muted">
        Not enough matchdays played yet to chart a trend.
      </p>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="matchday"
            tickFormatter={(v) => `MD${v}`}
            stroke="#93a0c2"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            reversed
            domain={[1, 36]}
            stroke="#93a0c2"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: "#0b1430",
              border: "1px solid rgba(238,241,248,0.1)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#eef1f8" }}
            labelFormatter={(v) => `Matchday ${v}`}
            formatter={(value) => [`#${value}`, "Position"]}
          />
          <Line
            type="monotone"
            dataKey="position"
            stroke="#46d3ff"
            strokeWidth={2}
            dot={{ r: 3, fill: "#46d3ff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
