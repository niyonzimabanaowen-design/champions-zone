import type { Metadata } from "next";
import { ParallaxHeader } from "@/components/motion/ParallaxHeader";
import { FinalsTimeline } from "@/components/sections/FinalsTimeline";
import { TitlesByClubChart } from "@/components/sections/TitlesByClubChart";
import { CountUp } from "@/components/motion/CountUp";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageOpenGraph, pageTwitter } from "@/lib/seo";
import historyData from "@/content/history.json";

const TITLE = "Champions League History: Winners, Finals & Records";
const DESCRIPTION =
  "A look back at UEFA Champions League history: every European Cup and Champions League final, the clubs with the most titles, and all-time records.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/history" },
  openGraph: pageOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/history" }),
  twitter: pageTwitter({ title: TITLE, description: DESCRIPTION }),
};

const BREADCRUMB_JSON_LD = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "History", path: "/history" },
]);

export default function HistoryPage() {
  const { finals, titlesByClub, records, format } = historyData;

  return (
    <div>
      <JsonLd data={BREADCRUMB_JSON_LD} />
      <ParallaxHeader
        src="/images/history/trophy.jpg"
        alt="A generic silver trophy on a blue background, not the official UEFA Champions League trophy"
        eyebrow="Road to the Final"
        title="Champions League History"
      >
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted sm:text-base">
          A look back at Champions League history: every European Cup and
          Champions League final, the clubs with the most titles, and the
          competition&apos;s longest-standing records. Scroll through the
          finals timeline below.
        </p>
      </ParallaxHeader>

      <FinalsTimeline finals={finals} />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section>
          <h2 className="mb-2 font-display text-2xl uppercase tracking-tight text-text">
            Most Titles by Club
          </h2>
          <p className="mb-6 text-xs text-muted">
            All-time European Cup / Champions League titles.
          </p>
          <div className="rounded-2xl border border-line bg-surface p-6">
            <TitlesByClubChart data={titlesByClub} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-6 font-display text-2xl uppercase tracking-tight text-text">
            Records
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <RecordTile label="Most Goals" name={records.mostGoals.name} value={records.mostGoals.value} />
            <RecordTile
              label="Most Appearances"
              name={records.mostAppearances.name}
              value={records.mostAppearances.value}
            />
            <RecordTile
              label="Most Titles"
              name={records.mostTitlesClub.name}
              value={records.mostTitlesClub.value}
            />
            <RecordTile
              label="Biggest Final Win"
              name={records.biggestFinalWin.name}
              value={records.biggestFinalWin.value}
            />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-6 font-display text-2xl uppercase tracking-tight text-text">
            How the Format Works
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {format.map((step, i) => (
              <li key={step.stage} className="rounded-xl border border-line bg-surface p-4">
                <span className="font-display text-sm text-accent">0{i + 1}</span>
                <p className="mt-1 font-medium text-text">{step.stage}</p>
                <p className="mt-1 text-sm text-muted">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

function RecordTile({ label, name, value }: { label: string; name: string; value: string }) {
  const match = value.match(/^(\d+)(.*)$/);

  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-4 text-center">
      <p className="font-display text-lg text-text">
        {match ? <CountUp value={Number(match[1])} suffix={match[2]} /> : value}
      </p>
      <p className="mt-1 truncate text-xs text-muted" title={name}>
        {name}
      </p>
      <p className="mt-2 text-[11px] uppercase tracking-wide text-accent">{label}</p>
    </div>
  );
}
