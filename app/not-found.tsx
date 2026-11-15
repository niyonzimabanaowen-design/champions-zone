import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center sm:px-6">
      <p className="font-display text-sm uppercase tracking-[0.2em] text-accent">404</p>
      <h1 className="mt-3 font-display text-4xl uppercase tracking-tight text-text sm:text-5xl">
        Page Not Found
      </h1>
      <p className="mt-4 text-sm text-muted sm:text-base">
        That page doesn&apos;t exist — it may have moved, or the link was
        mistyped. Try one of these instead:
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
        >
          Home
        </Link>
        <Link
          href="/standings"
          className="rounded-full border border-line bg-surface-2 px-6 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-surface"
        >
          Standings
        </Link>
        <Link
          href="/clubs"
          className="rounded-full border border-line bg-surface-2 px-6 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-surface"
        >
          Clubs
        </Link>
      </div>
    </div>
  );
}
