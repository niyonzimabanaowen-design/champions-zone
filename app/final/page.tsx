import type { Metadata } from "next";
import Image from "next/image";
import { Countdown } from "@/components/motion/Countdown";
import { RoadToMadridBracket } from "@/components/sections/RoadToMadridBracket";
import scheduleSeed from "@/data/schedule.json";

export const metadata: Metadata = {
  title: "Madrid 2027",
  description: "The road to the 2027 UEFA Champions League final at the Estadio Metropolitano, Madrid.",
};

export default function FinalPage() {
  const finalDateTime = `${scheduleSeed.final.date}T00:00:00Z`;

  return (
    <div>
      <section className="relative isolate flex min-h-[90vh] items-center justify-center overflow-hidden border-b border-line">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/final/estadio-metropolitano-exterior.jpg"
            alt="Estadio Metropolitano, Madrid, from outside"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/30" />
          <div className="grain absolute inset-0" />
        </div>

        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-accent">
            UEFA Champions League Final
          </p>
          <h1 className="mt-3 font-display text-5xl uppercase tracking-tight text-text sm:text-7xl">
            Madrid 2027
          </h1>
          <p className="mt-3 text-muted">
            {scheduleSeed.final.venue}, {scheduleSeed.final.city} · 5 June 2027
          </p>
          <div className="mt-10">
            <Countdown target={finalDateTime} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="font-display text-sm uppercase tracking-widest text-accent">
            The Venue
          </p>
          <h2 className="font-display text-3xl uppercase tracking-tight text-text sm:text-4xl">
            Estadio Metropolitano
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line sm:row-span-2 sm:aspect-auto">
            <Image
              src="/images/final/estadio-metropolitano-night.jpg"
              alt="Interior of Estadio Metropolitano lit up at night during a match"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line">
            <Image
              src="/images/final/estadio-metropolitano-exterior.jpg"
              alt="Exterior panoramic view of Estadio Metropolitano"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line">
            <Image
              src="/images/final/madrid-skyline.jpg"
              alt="Madrid skyline at dusk, with the Torrespaña Tower and Cuatro Torres skyscrapers"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="font-display text-sm uppercase tracking-widest text-accent">
              Knockouts
            </p>
            <h2 className="font-display text-3xl uppercase tracking-tight text-text sm:text-4xl">
              Road to Madrid
            </h2>
          </div>
          <RoadToMadridBracket />
        </div>
      </section>
    </div>
  );
}
