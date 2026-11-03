"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useT } from "@/components/LanguageProvider";
import { educations } from "../../../register/RegisterClient";
import { errorKey } from "@/lib/i18n/errors";

type Detail = {
  id: string;
  userId: string;
  fullName: string;
  age: number;
  gender: string;
  height: string;
  location: string;
  profession: string;
  education: string;
  salary: string | null;
  community: string;
  subCaste: string | null;
  hasHoroscope: boolean;
  parentContact: string;
  profilePhoto: string;
  additionalPhotos: string[];
};

const card = "rounded-[18px] bg-white p-4 shadow-[0_4px_16px_rgba(120,80,20,.08)]";

export default function ProfileDetailPage() {
  const { t } = useT();
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Detail | null>(null);
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [photo, setPhoto] = useState(0);

  useEffect(() => {
    fetch(`/api/profiles/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.profile) return router.push("/home");
        setP(d.profile);
        setFav(d.isFavorite);
      })
      .catch(() => router.push("/home"));
  }, [id, router]);

  async function toggleFav() {
    if (!p) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch("/api/favorites", {
        method: fav ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: p.id }),
      });
      if (!res.ok) throw new Error();
      setFav(!fav);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  async function message() {
    if (!p) return;
    setChatBusy(true);
    setFailed(false);
    try {
      const res = await fetch("/api/chat/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: p.userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      router.push(`/chats/${data.channelId}`);
    } catch {
      setFailed(true);
    } finally {
      setChatBusy(false);
    }
  }

  if (!p) {
    return (
      <div className="flex justify-center py-20">
        <span className="spinner h-8 w-8 text-primary" />
      </div>
    );
  }

  const photos = [p.profilePhoto, ...p.additionalPhotos];
  const edu = educations.find(([v]) => v === p.education);
  const Item = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-xl bg-muted p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 pt-2">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="btn btn-outline min-h-12 px-4 py-2">
          {t("common.back")}
        </button>
        <button onClick={toggleFav} disabled={busy} aria-pressed={fav} aria-label={t("prof.fav")}
          className={`btn min-h-12 px-4 py-2 ${fav ? "btn-primary" : "btn-outline"}`}>
          {fav ? "♥" : "♡"} {t("prof.fav")}
        </button>
      </div>

      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_4px_16px_rgba(120,80,20,.08)]">
        <div className="relative aspect-4/5 bg-muted">
          <Image src={photos[photo]} alt={p.fullName} fill sizes="(max-width: 448px) 100vw, 448px" className="object-cover" />
        </div>
        {photos.length > 1 && (
          <div className="flex justify-center gap-1 p-2">
            {photos.map((_, i) => (
              <button key={i} onClick={() => setPhoto(i)} aria-label={String(i + 1)}
                className="flex h-8 w-8 items-center justify-center">
                <span className={`h-2.5 rounded-full ${i === photo ? "w-5 bg-primary" : "w-2.5 bg-border"}`} />
              </button>
            ))}
          </div>
        )}
        <div className="p-4 text-center">
          <h1 className="font-serif text-2xl font-bold text-primary">{p.fullName}</h1>
          <p className="mt-1 text-muted-foreground">
            {t("card.years", { age: p.age })} · {p.height} · {t(p.gender === "BRIDE" ? "reg.bride" : "reg.groom")}
          </p>
          <span className="mt-2 inline-block rounded-full bg-[#e6f2e8] px-2.5 py-1 text-xs font-bold text-success">
            ✓ {t("card.verified")}
          </span>
        </div>
      </div>

      <section className={card}>
        <h2 className="mb-3 font-serif text-lg font-bold text-primary">{t("prof.personal")}</h2>
        <div className="grid grid-cols-2 gap-3">
          <Item label={t("reg.loc")} value={p.location} />
          <Item label={t("reg.comm")} value={p.community} />
          {p.subCaste && <Item label={t("reg.sub")} value={p.subCaste} />}
          <Item label={t("prof.horo")} value={t(p.hasHoroscope ? "prof.horo.yes" : "prof.horo.no")} />
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-3 font-serif text-lg font-bold text-primary">{t("prof.work")}</h2>
        <div className="grid grid-cols-2 gap-3">
          <Item label={t("reg.edu")} value={edu ? t(edu[1]) : p.education} />
          <Item label={t("reg.job")} value={p.profession} />
          {p.salary && <Item label={t("prof.income")} value={p.salary} />}
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-3 font-serif text-lg font-bold text-primary">{t("prof.contact")}</h2>
        <Item label={t("prof.parent")} value={p.parentContact} />
      </section>

      {failed && <p role="alert" className="font-medium text-error">{t(errorKey())}</p>}
      {p.userId !== session?.user?.id && (
        <button onClick={message} disabled={chatBusy} className="btn btn-primary btn-pill w-full">
          {chatBusy ? <span className="spinner" /> : t("prof.message")}
        </button>
      )}
    </main>
  );
}
