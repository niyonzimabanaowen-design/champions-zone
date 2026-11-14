"use client";

import { useMemo, useState } from "react";
import { ClubCard } from "@/components/sections/ClubCard";
import type { Team } from "@/types";

export function ClubsGrid({ teams }: { teams: Team[] }) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");

  const countries = useMemo(() => [...new Set(teams.map((t) => t.country))].sort(), [teams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter((t) => {
      const matchesQuery =
        q.length === 0 ||
        t.name.toLowerCase().includes(q) ||
        t.shortName.toLowerCase().includes(q) ||
        t.tla.toLowerCase().includes(q);
      const matchesCountry = country === "all" || t.country === country;
      return matchesQuery && matchesCountry;
    });
  }, [teams, query, country]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search clubs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none sm:w-64"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm text-text focus:border-accent focus:outline-none sm:w-52"
        >
          <option value="all">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface px-4 py-6 text-center text-sm text-muted">
          No clubs match your search.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {filtered.map((team) => (
            <ClubCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
