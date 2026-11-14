import clubPhotos from "@/content/clubs.json";

/**
 * Real Wikimedia Commons stadium photos, sourced and credited in
 * content/credits.json, for the clubs we've covered so far (see /credits).
 * A missing entry means honestly no photo yet — never a placeholder.
 */
export function getClubStadiumPhoto(slug: string): string | undefined {
  return (clubPhotos as Record<string, { stadiumPhoto?: string }>)[slug]?.stadiumPhoto;
}
