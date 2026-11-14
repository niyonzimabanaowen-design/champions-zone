import Image from "next/image";
import Link from "next/link";
import type { Team } from "@/types";
import { getClubStadiumPhoto } from "@/lib/club-content";
import { ClubCrest } from "@/components/sections/ClubCrest";

export function ClubCard({ team }: { team: Team }) {
  const stadiumPhoto = getClubStadiumPhoto(team.slug);

  return (
    <Link
      href={`/clubs/${team.slug}`}
      className="group relative isolate block overflow-hidden rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent/40"
    >
      {stadiumPhoto && (
        <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <Image
            src={stadiumPhoto}
            alt=""
            fill
            sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-bg/70" />
        </div>
      )}
      <div className="flex flex-col items-center gap-3 text-center">
        <ClubCrest teamId={team.id} src={team.crest} alt={`${team.name} crest`} size={56} />
        <div>
          <p className="text-sm font-medium text-text">{team.shortName}</p>
          <p className="text-xs text-muted">{team.country}</p>
        </div>
      </div>
    </Link>
  );
}
