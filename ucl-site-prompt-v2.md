# Build Prompt: Champions League Fan Hub

## The product

Build a premium, unofficial Champions League fan website for the 2026/27 season. It should feel like a top sports-media product, with the polish of Apple product pages or a high-end sports broadcaster. It should have cinematic motion, live data, **real photography throughout**, and a dark "European night under floodlights" atmosphere.

- **Site brand:** Champions Zone (used in the nav, footer, and browser title)
- **Landing page headline:** UEFA Champions League. The hero is about the competition itself, not the brand.
- **Footer disclaimer:** "Unofficial fan site. Not affiliated with or endorsed by UEFA. Club names and crests belong to their owners. Photo credits on the Credits page."

Start by reading this whole prompt. Then propose the folder structure and a short build plan before writing any code.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js, latest stable (App Router) + React + TypeScript** | Fast pages, routing, server-side data fetching, image optimization |
| Styling | **Tailwind CSS v4** with design tokens as CSS variables | Fast, consistent styling |
| UI primitives | **shadcn/ui** (Radix underneath) | Accessible tabs, dialogs, tooltips, dropdowns |
| Motion (UI) | **Motion** (`motion` package, import from `motion/react`) | Page transitions, layout animations, hover and tap, shared-element transitions |
| Motion (scroll) | **GSAP + ScrollTrigger + SplitText** (all GSAP plugins are free) | Pinned scroll sections, scrubbed timelines, text reveals |
| Smooth scroll | **Lenis** (`lenis` package) | Smooth scrolling that stays in sync with ScrollTrigger |
| 3D | **React Three Fiber + drei** | Particle and lighting effects layered over real photos |
| Charts | **Recharts** | Stats and form charts |
| Data fetching | Server components with `fetch` revalidation, **TanStack Query** for client refresh | Caching and background updates |
| Live data | **football-data.org API v4**, competition code `CL` | Standings, matches, scorers, and official club crests (free tier covers the Champions League) |
| Images | **`next/image`** with AVIF/WebP, `placeholder="blur"`, and `sizes` set on every image | Sharp, fast-loading photos |
| Icons | **Lucide** | Clean icon set |
| Fonts | Display: **Clash Display** (Fontshare) or **Barlow Condensed** (Google Fonts) as a fallback. Body: **Inter**. Use tabular figures for all numbers. | Broadcast-sports feel |
| Deploy | **Vercel** | One-click deploy for Next.js |

Store the API key in `.env.local` as `FOOTBALL_DATA_API_KEY`, and call the API only from the server (route handlers or server components), never from the browser. The free tier allows about 10 requests per minute, so cache responses (`revalidate: 300`). Include local JSON fallback data in `/data` so the site still works without a key.

---

## Real photography (most important for the look)

The site must use **real-life photographs**, not illustrations, gradients, or placeholder boxes. Photos carry the atmosphere: floodlit stadiums, packed stands, smoke and flares, the pitch at night, the trophy, and fans.

### Where to get them (legal sources only)

| Source | What it has | License and credit |
|---|---|---|
| **Unsplash** (unsplash.com, or the Unsplash API) | Stadiums at night, crowds, floodlights, balls, pitch close-ups, fans | Free to use. Credit the photographer on the Credits page. |
| **Pexels** (pexels.com) | The same, plus **free stock video** for the hero (stadium crowds, floodlights) | Free to use. Credit the photographer. |
| **Wikimedia Commons** (commons.wikimedia.org) | Real photos of specific stadiums: Bernabéu, Camp Nou, Allianz Arena, Parc des Princes, Anfield, Emirates, Etihad, Metropolitano | Usually CC BY or CC BY-SA. **Must** credit the author and license and link the source. |
| **football-data.org API** | Official club crests (the `crest` field on each team) | Use as provided and don't alter them. |

**Do not** use images from Google Images, news sites, Getty, AP, Reuters, or club websites. They are copyrighted. Photos of named players in real matches are almost always copyrighted, so use the real **stadium, crowd, and atmosphere** photos above. Show players with their club crest and stats instead of a match photo.

### Image workflow

1. Download each chosen image into `/public/images/<section>/` with a clear lowercase file name (e.g. `/public/images/stadiums/bernabeu-night.jpg`).
2. Record every image in `/content/credits.json`: file, title, author, source URL, license, and license URL.
3. Generate a `/credits` page from that file automatically.
4. Optimize everything: long edge no larger than 2400px for hero images and 1200px for cards, compressed, served as AVIF/WebP via `next/image`, with blur placeholders.
5. Write descriptive `alt` text for every image (e.g. "Santiago Bernabéu stadium lit up at night, seen from the upper tier").

### Shot list

| Where | Image | Search terms |
|---|---|---|
| Home hero | **Looping background video** (10–20s, muted) of a floodlit stadium or crowd, with a still image as the poster and mobile fallback | Pexels video: "stadium night", "football crowd", "stadium lights" |
| Home hero (fallback still) | Wide shot of a packed stadium at night under floodlights | "stadium night lights", "football stadium crowd night" |
| Home, final teaser | Estadio Metropolitano, exterior or interior | Wikimedia: "Estadio Metropolitano" |
| Home, "next matchday" | Players' tunnel or pitch-level view before kickoff | "stadium tunnel", "football pitch night" |
| Standings header | Aerial or top-down pitch with white lines | "football pitch aerial", "soccer field from above" |
| Fixtures header | Floodlight towers close-up | "stadium floodlights" |
| Clubs grid hover | A photo of each club's real stadium (one per club, at least for the top 8) | Wikimedia: stadium name |
| Club page header | That club's stadium, full width, with a club-color gradient over it | Wikimedia: stadium name + "night" |
| Stats header | Ball on the penalty spot or in the net | "football in net", "soccer ball goal net" |
| History header | Silver trophy-style close-up (a generic trophy, not passed off as the official one) | "silver trophy", "football trophy" |
| History, finals timeline | Real photo of each final's host stadium (Istanbul's Atatürk Olympic Stadium 2023, Wembley 2024, Munich's Allianz Arena 2025, Budapest's Puskás Aréna 2026) | Wikimedia: stadium name |
| Final 2027 page | Metropolitano at night, plus a Madrid skyline shot | Wikimedia: "Estadio Metropolitano", Unsplash: "Madrid skyline night" |
| Predictor page | Fans celebrating, flares, scarves | "football fans celebrating", "stadium flares" |
| 404 page | Empty stadium seats | "empty stadium seats" |

### How photos are treated in the design

- Hero: full-bleed video or photo, a dark navy gradient from the bottom and left so text stays readable, a subtle grain overlay, and a slow Ken Burns zoom on stills.
- Section headers: photo with a parallax effect (moves slower than scrolling), dimmed to about 40–50% brightness.
- Club pages: the stadium photo tinted with the club's primary color via a gradient overlay.
- Cards: photo zooms slightly on hover, and the caption slides up.
- Use the 3D particle and floodlight effects as a **layer on top of** the real hero video or photo, not as a replacement.
- Never stretch or distort a photo. Use `object-fit: cover` with a sensible `object-position`.

---

## Design system

**Mood:** a European night at a sold-out stadium. Deep navy sky, floodlight glows, trophy silver, crisp white type, and one electric accent.

**Color tokens**
- `--bg`: #05091a (night sky)
- `--surface`: #0b1430 (cards)
- `--surface-2`: #121e45 (hover, raised)
- `--text`: #eef1f8
- `--muted`: #93a0c2
- `--line`: rgba(238,241,248,0.10)
- `--silver`: #c9d3ea (trophy, highlights)
- `--accent`: #46d3ff (floodlight cyan, used sparingly)
- Zone colors: `--qualify` #3ddc97, `--playoff` #f2c14e, `--out` #ff6b6b

**Rules**
- Big, confident uppercase display type for headings and calm, readable body text.
- Glassmorphism (blurred, translucent panels) only for the nav and overlays.
- Generous spacing on an 8px grid, with 16–24px rounded corners on cards.
- A subtle grain/noise texture over backgrounds and photos for a cinematic feel.
- Each club page re-themes itself with that club's primary color as a secondary accent.
- Fully responsive (mobile first), keyboard accessible, and WCAG AA contrast, including text on photos.
- Respect `prefers-reduced-motion`: replace big motion with simple fades and pause the hero video.

---

## Signature motion and wow moments

1. **Cinematic hero:** a real floodlit-stadium video plays behind the headline. On top of it, a React Three Fiber layer adds drifting light particles and slow floodlight beams that react gently to the mouse. On mobile, show the still photo and skip the 3D layer.
2. **Intro sequence:** on first visit, the screen starts dark, the floodlights flicker on (the video fades up), and "UEFA Champions League" reveals letter by letter with GSAP SplitText. It plays once per session and can be skipped.
3. **Live results ticker** under the hero that scrolls like a broadcast ticker and pauses on hover.
4. **Animated standings:** rows slide into new positions when switching views (Motion `layout` animations), with animated position-change arrows.
5. **Club card to club page shared-element transition:** the crest flies from the card into the club page header while the stadium photo fades in behind it.
6. **Scroll-pinned "Road to the Final" story** on the history page: the timeline stays pinned while each final's stadium photo crossfades in.
7. **Parallax photo headers** on every page.
8. **Number count-ups** for stats when they scroll into view.
9. **Magnetic buttons and a custom cursor** that grows over clickable items (desktop only).
10. **Page transitions:** a quick floodlight-flash wipe between routes.

Keep motion purposeful. Every UI animation should finish in under about 800ms, except the intro and the scroll stories. Keep motion at 60fps: animate only `transform` and `opacity`.

---

## Pages

### `/` Home
- Cinematic hero (video + 3D light layer) with "UEFA Champions League", the label "2026/27 League Phase", and two CTAs: "Live Table" and "Fixtures"
- Live/latest results ticker
- Key facts strip: 36 clubs · current matchday · holders (PSG) · final on 5 June 2027 in Madrid
- Top-8 table snapshot
- Next matchday preview with a countdown, over a pitch-level photo
- Top scorers leaderboard with animated bars and club crests
- Featured match card for the biggest game of the next matchday, showing both clubs' stadium photos split diagonally
- Madrid 2027 final teaser over a Metropolitano photo

### `/standings` Live Table
- Photo header (aerial pitch)
- Full 36-team table: position, club (crest + name), P, W, D, L, GF, GA, GD, Pts, and form (last 5 as colored dots)
- Color-coded zones: 1–8 round of 16, 9–24 knockout play-off, 25–36 eliminated, with a legend
- Toggles: Full / Home / Away / Form
- Sticky header, and row hover shows a mini preview card with the club's stadium photo
- "What if" simulator: pick results for the next matchday and watch the table re-order live (client-side only)

### `/fixtures` Fixtures & Results
- Photo header (floodlights)
- Matchday tabs (1–8, then knockout rounds)
- Match cards with crests, score or kickoff time in the viewer's local timezone, and venue with a small stadium thumbnail
- Live matches show a pulsing "LIVE" badge
- Countdown to the next kickoff

### `/clubs` and `/clubs/[slug]` Clubs
- Grid of all 36 clubs with crests; hovering reveals the club's stadium photo. Filter by country and search.
- Club page: full-width stadium photo tinted in club colors, crest, stadium name and capacity, founded year, European titles, this season's record, results so far, a position-over-time chart, and the club's top scorer
- Shared-element crest transition from the grid to the club page

### `/stats` Stats Center
- Photo header (ball in the net)
- Top scorers, top assists, goals per matchday chart, biggest wins, clean sheets
- Player comparison: pick two players and see a side-by-side bar or radar chart

### `/history` History
- Photo header (trophy close-up)
- Scroll-pinned winners timeline with each final's host stadium photo: 2023 Manchester City (Istanbul), 2024 Real Madrid (Wembley), 2025 PSG (Munich), 2026 PSG (beat Arsenal on penalties in Budapest)
- Most titles by club (animated bar chart)
- Records: most goals, most appearances, biggest final wins
- "How the format works": league phase → knockout play-off → round of 16 → quarter-finals → semi-finals → final

### `/final` Madrid 2027
- Full-screen Metropolitano photo with a countdown to 5 June 2027
- Stadium feature section with real photos (exterior, interior, Madrid skyline)
- "Road to Madrid" bracket that fills in as the knockouts are decided

### `/predictor` Prediction Game
- Fans-celebrating photo header
- Predict scores for the next matchday, saved in localStorage
- After matches finish, show points earned with a confetti-style celebration

### `/credits` Photo Credits
- Generated from `/content/credits.json`, listing every photo with its author, source link, and license

---

## Data and content

- Use football-data.org endpoints for `CL`: standings, matches (by matchday), scorers, and teams (crests come from the API).
- Write typed API helpers in `/lib/api.ts` and TypeScript types in `/types`.
- Keep club history, records, stadium info, and photo mappings as local content in `/content` (JSON or MDX).
- Seed data for the fallback, accurate as of 4 November 2026 (after matchday 4):
  - Top 8: 1 PSG 12 pts (GD +15) · 2 Real Madrid 12 (+6) · 3 Arsenal 10 (+3) · 4 Como 9 (+13) · 5 Barcelona 9 (+8) · 6 Aston Villa 9 (+6) · 7 Manchester City 9 (+5) · 8 Liverpool 9 (+4)
  - Top scorers: Tasos Douvikas (Como) 6, Erling Haaland (Manchester City) 5, Nicolò Tresoldi (Club Brugge) 5, Harry Kane (Bayern Munich) 4, Kylian Mbappé (Real Madrid) 4
  - Schedule: Matchday 5 is 24–25 Nov 2026 · Matchday 6 is 8–9 Dec 2026 · Matchday 7 is 19–20 Jan 2027 · Matchday 8 is 27 Jan 2027 · Final is 5 June 2027, Estadio Metropolitano, Madrid
- Prefer live API data over the seed data whenever the key is present, and show an "Updated" timestamp.

---

## Quality bar

- Lighthouse 90+ for performance, accessibility, and best practices, even with real photos and video
- Hero video: compressed MP4/WebM, under about 5MB, `muted`, `playsInline`, `loop`, with a poster image and `preload="metadata"`
- Lazy-load the 3D layer, heavy charts, and all below-the-fold images; mark only the hero image as `priority`
- Skeleton loaders for data and photos, plus friendly error states
- SEO: metadata per page, Open Graph images (using real stadium photos), sitemap
- Clean structure: `/components/ui`, `/components/sections`, `/components/motion`, `/public/images`, `/content`
- ESLint + Prettier, no TypeScript errors

---

## Build order

1. Set up Next.js, Tailwind, design tokens, fonts, layout, nav, and footer
2. Source and download the photos and hero video from the shot list, optimize them, and fill in `credits.json`
3. Build the data layer: API helpers, types, and fallback JSON
4. Home page: the hero with real video and photo first, then the 3D light layer and intro
5. Standings, then Fixtures
6. Clubs grid and club pages with stadium photos and shared-element transitions
7. Stats, History, Final, Predictor, and Credits
8. Motion polish pass: page transitions, parallax, scroll stories, micro-interactions
9. Performance, accessibility, and SEO pass, then deploy to Vercel

After each step, run the dev server, open the page in a browser at desktop (1440px) and mobile (390px) widths, take screenshots, and fix anything broken or ugly before moving on. Check that every photo loads, looks sharp, and has its credit.

---

## Tools to use in Claude Code (if available)

- **frontend-design skill:** for distinctive, non-generic visual design decisions
- **Context7 MCP:** for up-to-date docs on Next.js, Tailwind v4, Motion, GSAP, and React Three Fiber
- **Playwright MCP** (or a browser tool): to screenshot pages and check layouts at desktop and mobile widths
- **Web search / fetch:** to find photos on Unsplash, Pexels, and Wikimedia Commons and read their license details
- **Figma MCP:** if I share a Figma design, match it
- **GitHub:** commit after each build step
- **Vercel:** for preview and production deploys
