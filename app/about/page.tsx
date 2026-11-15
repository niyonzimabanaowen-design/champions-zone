import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  Camera,
  Code2,
  ExternalLink,
  Gamepad2,
  Layers,
  Palette,
  Radio,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { ParallaxHeader } from "@/components/motion/ParallaxHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageOpenGraph, pageTwitter } from "@/lib/seo";

const GITHUB_URL = "https://github.com/niyonzimabanaowen-design";
const LINKEDIN_URL = "https://www.linkedin.com/in/niyonzimabanaowen/";

const TITLE = "About Champions Zone: Built by Bana Owen";
const DESCRIPTION =
  "How and why Bana Owen built Champions Zone, the tech stack behind it, the features it includes, and how to get in touch about the project.";
const OG_TITLE = "About Champions Zone";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: pageOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    path: "/about",
    imageTitle: OG_TITLE,
  }),
  twitter: pageTwitter({ title: TITLE, description: DESCRIPTION, imageTitle: OG_TITLE }),
};

const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Bana Owen",
  sameAs: [GITHUB_URL, LINKEDIN_URL],
};

const BREADCRUMB_JSON_LD = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
]);

const STACK = [
  { name: "Next.js", icon: Layers, blurb: "App Router, server components, image optimization" },
  { name: "React", icon: Code2, blurb: "The UI layer, end to end" },
  { name: "TypeScript", icon: Zap, blurb: "Typed data, typed components" },
  { name: "Tailwind CSS", icon: Palette, blurb: "Design tokens as CSS variables" },
  { name: "Motion", icon: Sparkles, blurb: "Layout animation, shared-element transitions" },
  { name: "GSAP", icon: Wand2, blurb: "Scroll-pinned stories, the intro sequence" },
  { name: "Three.js / R3F", icon: Boxes, blurb: "The hero's particle light layer" },
  { name: "football-data.org API", icon: Radio, blurb: "Live standings, fixtures, and scorers" },
];

const FEATURES = [
  {
    icon: Radio,
    title: "Live Data",
    description:
      "Standings, fixtures, and scorers come straight from the football-data.org API, cached and refreshed — not hardcoded.",
  },
  {
    icon: Camera,
    title: "Real Photography",
    description:
      "Every stadium and atmosphere photo is a real, licensed photo from Unsplash, Pexels, or Wikimedia Commons, credited on the Credits page.",
  },
  {
    icon: Boxes,
    title: "3D Hero",
    description:
      "A React Three Fiber particle and floodlight layer sits over the hero video on desktop, reacting gently to the cursor.",
  },
  {
    icon: Wand2,
    title: "Motion Throughout",
    description:
      "GSAP scroll stories, Motion layout animations, shared-element transitions, and a floodlight-flash page wipe.",
  },
  {
    icon: Gamepad2,
    title: "Predictor Game",
    description:
      "Predict every matchday score, saved locally in your browser, with a scoring system and a celebration when results land.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <JsonLd data={PERSON_JSON_LD} />
      <JsonLd data={BREADCRUMB_JSON_LD} />
      <ParallaxHeader
        src="/images/about/code-dark-room.jpg"
        alt="A laptop screen glowing with code in a dark room at night"
        eyebrow="About"
        title="Champions Zone"
        overlayClassName="bg-gradient-to-br from-bg/80 via-bg/30 to-accent/25"
      />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-line">
            <Image
              src="/images/about/bana-owen.jpg"
              alt="Bana Owen"
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-display text-lg uppercase tracking-tight text-text">Bana Owen</p>
            <p className="text-sm text-muted">Designer &amp; builder of Champions Zone</p>
          </div>
        </div>

        <section className="mb-16">
          <h2 className="mb-4 font-display text-xl uppercase tracking-tight text-text">
            About the Project
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-muted sm:text-base">
            <p>
              I built Champions Zone because I&apos;m a fan of two things: the
              UEFA Champions League, and building things for the web. I
              wanted a project that let me go all-in on both — real
              competition data treated with respect, real photography
              instead of stock gradients, and the kind of cinematic motion
              and polish you don&apos;t often get to justify on a typical
              project.
            </p>
            <p>
              It&apos;s an unofficial fan site, not affiliated with or
              endorsed by UEFA — just something built by someone who watches
              every matchday and happens to enjoy the engineering as much as
              the football.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 font-display text-xl uppercase tracking-tight text-text">
            Built With
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STACK.map((item) => (
              <div
                key={item.name}
                className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface p-4 text-center"
              >
                <item.icon className="h-6 w-6 text-accent" aria-hidden />
                <p className="text-sm font-medium text-text">{item.name}</p>
                <p className="text-xs text-muted">{item.blurb}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 font-display text-xl uppercase tracking-tight text-text">
            Features
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-line bg-surface p-5">
                <feature.icon className="h-5 w-5 text-accent" aria-hidden />
                <p className="mt-3 text-sm font-medium text-text">{feature.title}</p>
                <p className="mt-1 text-sm text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 font-display text-xl uppercase tracking-tight text-text">
            Get in Touch
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-2"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              GitHub
            </Link>
            <Link
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-2"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              LinkedIn
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
