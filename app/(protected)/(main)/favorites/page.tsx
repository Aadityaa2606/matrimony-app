"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProfileCard, type ProfileCardData } from "@/components/ProfileCard";
import { useT } from "@/components/LanguageProvider";
import { errorKey } from "@/lib/i18n/errors";

export default function FavoritesPage() {
  const { t } = useT();
  const [favs, setFavs] = useState<ProfileCardData[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => setFavs(d.profiles ?? []))
      .catch(() => {
        setFavs([]);
        setFailed(true);
      });
  }, []);

  async function remove(profileId: string) {
    setBusy(profileId);
    setFailed(false);
    try {
      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      if (!res.ok) throw new Error();
      setFavs((prev) => prev?.filter((p) => p.id !== profileId) ?? null);
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  }

  if (!favs) {
    return (
      <div className="flex justify-center py-20">
        <span className="spinner h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-2">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-lg font-bold text-primary">{t("fav.title")}</h1>
        <span className="shrink-0 text-sm text-muted-foreground">{t("fav.count", { n: favs.length })}</span>
      </div>
      {failed && <p role="alert" className="mb-3 font-medium text-error">{t(errorKey())}</p>}
      {favs.length === 0 ? (
        <div className="rounded-[18px] bg-white p-8 text-center shadow-[0_4px_16px_rgba(120,80,20,.08)]">
          <h2 className="font-serif text-lg font-bold">{t("fav.empty.title")}</h2>
          <p className="mb-4 mt-2 text-muted-foreground">{t("fav.empty.body")}</p>
          <Link href="/home" className="btn btn-primary">{t("fav.browse")}</Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {favs.map((p) => (
            <ProfileCard key={p.id} p={p}>
              <button disabled={busy === p.id} onClick={() => remove(p.id)} className="btn btn-outline min-w-0 flex-1 px-3">
                {t("fav.remove")}
              </button>
              <Link href={`/profile/${p.id}`} className="btn btn-primary min-w-0 flex-1 px-3">
                {t("fav.view")}
              </Link>
            </ProfileCard>
          ))}
        </div>
      )}
    </main>
  );
}
