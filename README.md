# Champions Zone

**A live fan hub for the 2026/27 UEFA Champions League:** standings, fixtures, results, top scorers, club pages and the road to the Madrid 2027 final.

**[Visit the live site →](https://champions-zone.vercel.app)**

[![Champions Zone: Champions League 2026/27 live table, results and stats](https://champions-zone.vercel.app/api/og?title=Champions%20League%202026%2F27%3A%20Live%20Table%2C%20Results%20%26%20Stats)](https://champions-zone.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)

---

## Features

| Page | What it shows |
|---|---|
| **Home** | Floodlit stadium hero, results ticker, top-8 snapshot with recent form, top scorers |
| **Standings** | Full 36-club league-phase table with qualification zones, Full / Home / Away views, and sorting by points, goal difference, goals for or form |
| **Fixtures** | Every matchday with results, upcoming kickoffs in your local time, and live / finished states |
| **Clubs** | All 36 clubs with search and country filter, plus a page per club with its record, results, form and position over the season |
| **Stats** | Top scorers and assists, goals per matchday, biggest wins, clean sheets, and a two-player comparison |
| **History** | A scroll-driven timeline of recent finals, most titles by club, records, and how the format works |
| **Final** | Countdown to the 5 June 2027 final at the Estadio Metropolitano, and the Road to Madrid bracket |
| **Predictor** | Predict each matchday's scores; picks are saved in your browser and scored against the real results |

Also included:

- **Fully responsive.** Tested at phone widths, with a full-screen mobile menu.
- **Accessible.** Keyboard navigation, focus management in the menu, an active-page indicator, and reduced-motion support.
- **SEO-ready.** Unique metadata per page, Open Graph images, a sitemap, robots.txt and structured data.

## Real data, never invented

All fixtures, scores, standings and stats come from the [football-data.org](https://www.football-data.org) API (competition code `CL`). When live data can't be reached, the site serves the last good response or a stored snapshot of real data, and labels it as such.

### How the data layer stays within the free tier

The free API plan allows 10 requests per minute, so the whole site is built from **4 shared endpoints**: `standings`, `matches`, `scorers` and `teams`.

- `scripts/prefetch-football-data.mjs` fetches them once before `next build`, so the whole build, including all 36 club pages, makes exactly 4 API calls.
- Every page, including the 36 club pages, derives its data from those responses (`lib/data.ts`). Home and away tables and recent form are calculated from finished match results.
- Pages are statically generated and revalidated every 5 minutes.
- On HTTP 429 the client respects `X-RequestCounter-Reset` and retries. If a refresh still fails, it keeps serving the last good response.

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui (Radix primitives) |
| Motion | Motion, GSAP + ScrollTrigger, Lenis, React Three Fiber (3D hero lights) |
| Charts | Recharts |
| Data | football-data.org API v4 |
| Hosting | Vercel, with Speed Insights |

## Run it locally

Requires Node.js 20 or newer.

```bash
git clone https://github.com/niyonzimabanaowen-design/champions-zone.git
cd champions-zone
npm install
```

Create a `.env.local` file in the project root:

```bash
# Free key from https://www.football-data.org/client/register
FOOTBALL_DATA_API_KEY=your-key-here

# Optional: the site's public URL (used for canonical links, sitemap and Open Graph)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then:

```bash
npm run dev      # development server at http://localhost:3000
npm run build    # production build (prefetches the 4 API endpoints first)
npm start        # serve the production build
```

Without an API key the site still runs, using the stored data snapshot.

## Project structure

```
app/            Routes: home, standings, fixtures, clubs, stats, history, final, predictor, about, credits
components/     Layout (nav, mobile menu, footer), page sections, motion helpers, UI primitives
lib/            Data layer (api.ts, data.ts), club slugs, SEO helpers, hooks
data/           Stored snapshot of real API data used as a fallback
content/        Club info, history content and photo credits
scripts/        Build-time API prefetch
```

## Credits

- Football data provided by the [Football-Data.org](https://www.football-data.org) API.
- Photography from Pexels and Wikimedia Commons. Every photo's author, source and license is listed on the [Credits page](https://champions-zone.vercel.app/credits).
- Unofficial fan site, not affiliated with or endorsed by UEFA. Club names and crests belong to their respective owners.

## Author

Designed and built by **Bana Owen**.

- GitHub: [@niyonzimabanaowen-design](https://github.com/niyonzimabanaowen-design)
- LinkedIn: [niyonzimabanaowen](https://www.linkedin.com/in/niyonzimabanaowen/)

If you like the project, a ⭐ on the repo is appreciated.
