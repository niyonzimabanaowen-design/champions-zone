const COLOR_MAP: Record<string, string> = {
  red: "#e21b1b",
  blue: "#1b5fe2",
  "navy blue": "#0a1a4d",
  navy: "#0a1a4d",
  "sky blue": "#6cc5f5",
  purple: "#6a2a8c",
  claret: "#7a1f3d",
  maroon: "#7a1f3d",
  yellow: "#f2c200",
  gold: "#caa43d",
  green: "#1f9d55",
  orange: "#f27b1f",
  black: "#111111",
  white: "#f2f2f2",
  grey: "#9aa0a6",
  gray: "#9aa0a6",
};

const NEUTRAL = new Set(["white", "black", "grey", "gray"]);

/**
 * Maps a team's real `clubColors` string from the API (e.g. "Red / Blue /
 * White") to a representative accent hex for the club-page tint — preferring
 * the first non-neutral color since white/black don't tint well. Falls back
 * to the site accent when colors are missing or unrecognized.
 */
export function getClubAccentColor(clubColors?: string): string {
  if (!clubColors) return "#46d3ff";
  const parts = clubColors.split(/[/,]/).map((p) => p.trim().toLowerCase());
  for (const part of parts) {
    if (NEUTRAL.has(part)) continue;
    if (COLOR_MAP[part]) return COLOR_MAP[part];
  }
  return COLOR_MAP[parts[0]] ?? "#46d3ff";
}
