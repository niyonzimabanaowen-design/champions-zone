export type Zone = "qualify" | "playoff" | "out";

export interface TeamRef {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface Team extends TeamRef {
  slug: string;
  country: string;
  founded?: number;
  clubColors?: string;
  venue?: string;
  venueCapacity?: number;
  website?: string;
}

export type FormResult = "W" | "D" | "L";

export interface Standing {
  position: number;
  team: TeamRef;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  /** Last-5 results, oldest first. Omitted when the source doesn't report it — never inferred. */
  form?: FormResult[];
  zone: Zone;
}

export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED";

export interface MatchScore {
  home: number | null;
  away: number | null;
}

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday: number;
  stage: string;
  venue?: string;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  score: {
    fullTime: MatchScore;
  };
}

export interface Scorer {
  player: {
    id: number;
    name: string;
    nationality?: string;
  };
  team: TeamRef;
  goals: number;
  assists?: number;
  playedMatches?: number;
}

export interface CompetitionSnapshot {
  standings: Standing[];
  matches: Match[];
  scorers: Scorer[];
  teams: Team[];
  updatedAt: string;
  source: "live" | "fallback";
}

export interface PhotoCredit {
  file: string;
  title: string;
  author: string;
  authorUrl?: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
}
