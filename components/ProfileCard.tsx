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
    <div className="animate-fade-in overflow-hidden panel transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(120,80,20,.14)]">
      <Link href={`/profile/${p.id}`} className="group block">
        <div className="relative aspect-4/5 overflow-hidden bg-muted">
          <Image
            src={p.profilePhoto}
            alt={p.fullName}
            fill
            sizes="(max-width: 448px) 100vw, 448px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-black/25 to-transparent" />
        </div>
        <div className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-xl font-bold text-primary-dark">
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

// Placeholder with the same shape as ProfileCard while a list loads.
export function ProfileCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden panel">
      <div className="skeleton aspect-4/5 rounded-none" />
      <div className="space-y-2.5 p-4 pb-2">
        <div className="skeleton h-6 w-2/3" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-1/3" />
      </div>
      <div className="flex gap-3 p-4 pt-2">
        <div className="skeleton h-12 flex-1 rounded-xl" />
        <div className="skeleton h-12 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <main aria-busy="true" className="mx-auto max-w-md px-4 pt-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton h-4 w-16" />
      </div>
      <div className="grid gap-5">
        <ProfileCardSkeleton />
        <ProfileCardSkeleton />
      </div>
    </main>
  );
}
