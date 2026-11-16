import type { NextConfig } from "next";

// Old auto-generated slug -> new clean slug (see lib/club-slugs.ts for why
// each of these needed a manual override). Permanent so search engines and
// anyone with the old link transfer straight to the new one.
const CLUB_SLUG_REDIRECTS: Array<[string, string]> = [
  ["atleti", "atletico-madrid"],
  ["barca", "barcelona"],
  ["rc-lens", "lens"],
  ["slavia-praha", "slavia-prague"],
  ["shaktar", "shakhtar-donetsk"],
  ["pae-aek", "aek-athens"],
  ["bod-glimt", "bodo-glimt"],
  ["como-1907", "como"],
  ["sl-bratislava", "slovan-bratislava"],
  ["sabah-fk", "sabah"],
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "crests.football-data.org" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return CLUB_SLUG_REDIRECTS.map(([from, to]) => ({
      source: `/clubs/${from}`,
      destination: `/clubs/${to}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
