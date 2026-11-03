"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/components/LanguageProvider";

export type ProfileCardData = {
  id: string;
  fullName: string;
  age: number;
  height: string;
  location: string;
  profession: string;
  community: string;
  profilePhoto: string;
};

// White A1 card: photo, name + verified badge, meta line, then the caller's action buttons.
export function ProfileCard({ p, children }: { p: ProfileCardData; children: React.ReactNode }) {
  const { t } = useT();
  return (
    <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_4px_16px_rgba(120,80,20,.08)]">
      <Link href={`/profile/${p.id}`} className="block">
        <div className="relative aspect-4/5">
          <Image src={p.profilePhoto} alt={p.fullName} fill sizes="(max-width: 672px) 100vw, 672px" className="object-cover" />
        </div>
        <div className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-xl font-bold">
              {p.fullName}, {p.age}
            </h3>
            <span className="shrink-0 rounded-full bg-[#e6f2e8] px-2.5 py-1 text-xs font-bold text-success">
              ✓ {t("card.verified")}
            </span>
          </div>
          <p className="mt-1 text-muted-foreground">
            {p.profession} · {p.location.split(",")[0]}
          </p>
          <p className="text-sm text-muted-foreground">
            {p.height} · {p.community}
          </p>
        </div>
      </Link>
      <div className="flex gap-3 p-4 pt-2">{children}</div>
    </div>
  );
}
