"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Scorer } from "@/types";

const PLAYER_A_COLOR = "#46d3ff";
const PLAYER_B_COLOR = "#c9d3ea";

export function PlayerComparison({ players }: { players: Scorer[] }) {
  const [aId, setAId] = useState<number | undefined>(players[0]?.player.id);
  const [bId, setBId] = useState<number | undefined>(players[1]?.player.id);

  const playerA = players.find((p) => p.player.id === aId);
  const playerB = players.find((p) => p.player.id === bId);

  const data = useMemo(() => {
    if (!playerA || !playerB) return [];
    return [
      { stat: "Goals", a: playerA.goals, b: playerB.goals },
      { stat: "Assists", a: playerA.assists ?? 0, b: playerB.assists ?? 0 },
      { stat: "Played", a: playerA.playedMatches ?? 0, b: playerB.playedMatches ?? 0 },
    ];
  }, [playerA, playerB]);

  if (players.length < 2) {
    return <p className="text-sm text-muted">Not enough scorers yet to compare.</p>;
  }

  return (
    <div>
      <p className="mb-3 text-xs text-muted">
        Choose from this season&apos;s scorers — players with no goals yet
        aren&apos;t in the competition&apos;s scorers list.
      </p>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <select
          value={aId}
          onChange={(e) => setAId(Number(e.target.value))}
          className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm text-text focus:border-accent focus:outline-none"
        >
          {players.map((p) => (
            <option key={p.player.id} value={p.player.id}>
              {p.player.name} ({p.team.shortName})
            </option>
          ))}
        </select>
        <select
          value={bId}
          onChange={(e) => setBId(Number(e.target.value))}
          className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm text-text focus:border-accent focus:outline-none"
        >
          {players.map((p) => (
            <option key={p.player.id} value={p.player.id}>
              {p.player.name} ({p.team.shortName})
            </option>
          ))}
        </select>
      </div>

      {playerA && playerB && (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="stat"
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
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "#93a0c2" }}
                formatter={(key) => (key === "a" ? playerA.player.name : playerB.player.name)}
              />
              <Bar dataKey="a" name={playerA.player.name} fill={PLAYER_A_COLOR} radius={[4, 4, 0, 0]} />
              <Bar dataKey="b" name={playerB.player.name} fill={PLAYER_B_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
