import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import credits from "@/content/credits.json";
import type { PhotoCredit } from "@/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageOpenGraph, pageTwitter } from "@/lib/seo";

const TITLE = "Credits";
const DESCRIPTION =
  "Every photo and video on Champions Zone, with photographer, source, and license.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/credits" },
  openGraph: pageOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/credits" }),
  twitter: pageTwitter({ title: TITLE, description: DESCRIPTION }),
};

const BREADCRUMB_JSON_LD = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Credits", path: "/credits" },
]);

const data = credits as PhotoCredit[];

export default function CreditsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd data={BREADCRUMB_JSON_LD} />
      <div className="mb-10 text-center">
        <p className="font-display text-sm uppercase tracking-widest text-accent">
          Real Photography
        </p>
        <h1 className="font-display text-4xl uppercase tracking-tight text-text sm:text-5xl">
          Credits
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Every photo and video used on Champions Zone, generated from this
          site&apos;s own credit ledger. Thank you to every photographer below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.map((credit) => (
          <CreditCard key={credit.file} credit={credit} />
        ))}
      </div>
    </div>
  );
}

function CreditCard({ credit }: { credit: PhotoCredit }) {
  const isVideo = credit.file.endsWith(".mp4");

  return (
    <div className="flex gap-4 rounded-2xl border border-line bg-surface p-4">
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-surface-2">
        {isVideo ? (
          // A static poster frame, not a playing/downloading video — this is
          // a small decorative thumbnail, not worth the full file size.
          <Image
            src="/images/hero/stadium-crowd-night.jpg"
            alt=""
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <Image src={credit.file} alt="" fill sizes="112px" className="object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text">{credit.title}</p>
        <p className="text-xs text-muted">
          by{" "}
          {credit.authorUrl ? (
            <Link
              href={credit.authorUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline hover:text-text"
            >
              {credit.author}
            </Link>
          ) : (
            credit.author
          )}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <Link
            href={credit.sourceUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-accent hover:underline"
          >
            Source ↗
          </Link>
          <Link
            href={credit.licenseUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-muted hover:text-text hover:underline"
          >
            {credit.license}
          </Link>
        </div>
      </div>
    </div>
  );
}
