"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function GoalsByMatchdayChart({
  data,
}: {
  data: { matchday: number; goals: number }[];
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">No matchday data available yet.</p>;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="matchday"
            tickFormatter={(v) => `MD${v}`}
            stroke="#93a0c2"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#93a0c2"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={28}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "#0b1430",
              border: "1px solid rgba(238,241,248,0.1)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#eef1f8" }}
            cursor={{ fill: "rgba(238,241,248,0.05)" }}
            labelFormatter={(v) => `Matchday ${v}`}
            formatter={(value) => [`${value}`, "Goals"]}
          />
          <Bar dataKey="goals" fill="#46d3ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
