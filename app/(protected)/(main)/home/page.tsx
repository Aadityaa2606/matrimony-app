"use client";

import { useCallback, useEffect, useState } from "react";
import { ListSkeleton, ProfileCard, type ProfileCardData } from "@/components/ProfileCard";
import { useT } from "@/components/LanguageProvider";
import { errorKey } from "@/lib/i18n/errors";

export default function HomePage() {
  const { t } = useT();
  const [profiles, setProfiles] = useState<ProfileCardData[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    fetch("/api/profiles")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => setProfiles(d.profiles ?? []))
      .catch(() => {
        setProfiles([]);
        setFailed(true);
      });
  }, []);
  useEffect(load, [load]);

  function retry() {
    setFailed(false);
    setProfiles(null);
    load();
  }

  async function act(url: string, profileId: string) {
    setBusy(profileId);
    setFailed(false);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      if (!res.ok) throw new Error();
      setProfiles((prev) => prev?.filter((p) => p.id !== profileId) ?? null);
    } catch {
      setFailed(true);
    } finally {
      setBusy(null);
    }
  }

  if (!profiles) return <ListSkeleton />;

  return (
    <main className="mx-auto max-w-md px-4 pt-2">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-lg font-bold text-primary">{t("home.title")}</h1>
        <span className="shrink-0 text-sm text-muted-foreground">{t("home.count", { n: profiles.length })}</span>
      </div>
      {failed && (
        <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-[14px] bg-error/10 px-4 py-3 font-medium text-error">
          <span>{t(errorKey())}</span>
          <button onClick={retry} className="min-h-12 shrink-0 font-semibold underline">{t("common.retry")}</button>
        </div>
      )}
      {profiles.length === 0 ? (
        <div className="panel p-8 text-center">
          <h2 className="font-serif text-lg font-bold">{t("home.empty.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("home.empty.body")}</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {profiles.map((p) => (
            <ProfileCard key={p.id} p={p}>
              <button disabled={busy === p.id} onClick={() => act("/api/dismissed", p.id)} className="btn btn-outline min-w-0 flex-1 px-3">
                {t("card.skip")}
              </button>
              <button disabled={busy === p.id} onClick={() => act("/api/favorites", p.id)} className="btn btn-primary min-w-0 flex-1 px-3">
                {t("card.like")}
              </button>
            </ProfileCard>
          ))}
        </div>
      )}
    </main>
  );
}
