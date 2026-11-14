import clubPhotos from "@/content/clubs.json";

interface ClubPhotoMeta {
  stadiumPhoto?: string;
  /** True when the photo is a generic stadium/floodlights shot standing in
   * for a real venue photo we couldn't legally source (e.g. PSG's Parc des
   * Princes — Wikimedia flags it "No Freedom of Panorama"). The alt text
   * must never claim it's that specific stadium. */
  generic?: boolean;
  alt?: string;
}

const CLUB_PHOTOS = clubPhotos as Record<string, ClubPhotoMeta>;

/**
 * Real Wikimedia Commons / Pexels stadium photos, sourced and credited in
 * content/credits.json, for the clubs we've covered so far. A missing entry
 * means honestly no photo yet — never a placeholder.
 */
export function getClubStadiumPhoto(slug: string): string | undefined {
  return CLUB_PHOTOS[slug]?.stadiumPhoto;
}

export function getClubPhotoMeta(slug: string): ClubPhotoMeta | undefined {
  return CLUB_PHOTOS[slug];
}
