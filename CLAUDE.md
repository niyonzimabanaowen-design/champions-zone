# Champions Zone — Project Rules

Unofficial UEFA Champions League fan site (2026/27 season). Full spec: [ucl-site-prompt-v2.md](ucl-site-prompt-v2.md).

## Permanent rules

1. **Work only inside `C:\dev\champions-zone`.** Never build inside OneDrive.
2. **Never invent fixtures, scores, standings, or stats.** Use only real data from the football-data.org API (key in `.env.local` as `FOOTBALL_DATA_API_KEY`) or the real seed data given in the spec. If data isn't available from one of those two sources, say so instead of making it up.
3. **Follow `ucl-site-prompt-v2.md`.** Build MVP first: Home, Standings, and Fixtures fully polished — then the other pages.
4. **Only use real, properly licensed photos** (Unsplash, Pexels, Wikimedia Commons) with credits recorded in `/content/credits.json` and shown on `/credits`. No illustrations, gradients-as-placeholders, or AI-generated imagery standing in for real photography.
5. **The footer must include:** "Football data provided by the Football-Data.org API."
6. **Never put the API key in code or chat.** It stays in `.env.local` only (gitignored), read server-side only.

## Status

See conversation / commit history for current build phase. Build order follows the spec's own "Build order" section: foundation → data layer → photos → Home → Standings → Fixtures → Clubs → Stats/History/Final/Predictor/Credits → motion polish → perf/a11y/SEO → deploy.
