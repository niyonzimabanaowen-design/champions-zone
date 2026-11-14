import Link from "next/link";
import Image from "next/image";
import { getCurrentMatchday, getScorers, getStandings } from "@/lib/data";
import { StandingsTable } from "@/components/sections/StandingsTable";
import { TopScorers } from "@/components/sections/TopScorers";
import { UpdatedBadge } from "@/components/sections/UpdatedBadge";
import { Hero } from "@/components/sections/Hero";
import scheduleSeed from "@/data/schedule.json";

export default async function Home() {
  const [{ data: standings, source, updatedAt }, { data: scorers }, currentMatchday] =
    await Promise.all([getStandings(), getScorers(5), getCurrentMatchday()]);

  const topEight = standings.slice(0, 8);

  return (
    <div>
      <Hero />

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 text-center sm:grid-cols-4 sm:px-6 lg:px-8">
          <Fact label="Clubs" value="36" />
          <Fact label="Matchday" value={String(currentMatchday)} />
          <Fact label="Holders" value="PSG" />
          <Fact label="Final" value="5 Jun 2027, Madrid" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl uppercase tracking-tight text-text">
                Top 8
              </h2>
              <UpdatedBadge source={source} updatedAt={updatedAt} />
            </div>
            <StandingsTable standings={topEight} />
            <Link
              href="/standings"
              className="mt-4 inline-block text-sm text-accent hover:underline"
            >
              Full table →
            </Link>
          </div>

          <div>
            <h2 className="mb-4 font-display text-2xl uppercase tracking-tight text-text">
              Top Scorers
            </h2>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <TopScorers scorers={scorers} />
            </div>
            <Link
              href="/stats"
              className="mt-4 inline-block text-sm text-accent hover:underline"
            >
              Full stats center →
            </Link>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-t border-line">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/final/estadio-metropolitano-night.jpg"
            alt="Estadio Metropolitano lit up at night during a match, Madrid"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-bg/70" />
          <div className="grain absolute inset-0" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-accent">
            Road to the Final
          </p>
          <h2 className="mt-2 font-display text-3xl uppercase tracking-tight text-text sm:text-4xl">
            {scheduleSeed.final.venue}, {scheduleSeed.final.city}
          </h2>
          <p className="mt-2 text-muted">
            5 June 2027 · the final stop on the road to the 2027 UEFA
            Champions League title.
          </p>
          <Link
            href="/final"
            className="mt-6 inline-block rounded-full border border-line bg-surface-2 px-6 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-bg"
          >
            Madrid 2027 →
          </Link>
        </div>
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display tabular text-2xl text-text sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
