/**
 * Manual slug overrides, keyed by football-data.org team ID, for the clubs
 * whose auto-generated slug (shortName, lowercased and hyphenated) comes out
 * unreadable, ambiguous, or just wrong — a lost special character, a typo
 * preserved from the API's own shortName, or an abbreviation nobody
 * recognizes. Every other club's slug is clean enough to generate directly
 * (see slugify() in lib/api.ts) and isn't listed here.
 *
 * Changing an entry here is a breaking URL change — add a matching redirect
 * in next.config.ts's redirects() from the old auto-generated slug.
 */
export const CLUB_SLUG_OVERRIDES: Record<number, string> = {
  78: "atletico-madrid", // was "atleti" (shortName "Atleti")
  81: "barcelona", // was "barca" (shortName "Barça")
  546: "lens", // was "rc-lens" (shortName "RC Lens")
  930: "slavia-prague", // was "slavia-praha" (shortName "Slavia Praha")
  1887: "shakhtar-donetsk", // was "shaktar" (shortName typo'd "Shaktar")
  1899: "aek-athens", // was "pae-aek" (shortName "PAE AEK")
  5721: "bodo-glimt", // was "bod-glimt" ("ø" isn't transliterated by slugify)
  7397: "como", // was "como-1907" (shortName "Como 1907")
  7509: "slovan-bratislava", // was "sl-bratislava" (shortName "Sl. Bratislava")
  10233: "sabah", // was "sabah-fk" (shortName "Sabah FK")
};
