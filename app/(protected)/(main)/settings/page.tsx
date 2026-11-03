"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LangToggle } from "@/components/LangToggle";
import { useT } from "@/components/LanguageProvider";
import { PasswordInput } from "@/components/PasswordInput";
import type { DictKey } from "@/lib/i18n/dict";

type Me = { fullName: string; profilePhoto: string; location: string; community: string };
type Blocked = { userId: string; name: string; photo: string | null };

const card = "rounded-[18px] bg-white p-4 shadow-[0_4px_16px_rgba(120,80,20,.08)]";

export default function SettingsPage() {
  const { t, lang } = useT();
  const [me, setMe] = useState<Me | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<Blocked[]>([]);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [pwMsg, setPwMsg] = useState<{ key: DictKey; ok: boolean } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((d) => setMe(d.profile ?? null)).catch(() => {});
    fetch("/api/user/status").then((r) => r.json()).then((d) => setExpiresAt(d.expiresAt ?? null)).catch(() => {});
    fetch("/api/blocks").then((r) => r.json()).then((d) => Array.isArray(d) && setBlocked(d)).catch(() => {});
  }, []);

  async function unblock(userId: string) {
    const res = await fetch("/api/blocks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).catch(() => null);
    if (res?.ok) setBlocked((b) => b.filter((x) => x.userId !== userId));
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) return setPwMsg({ key: "err.password", ok: false });
    setPwBusy(true);
    setPwMsg(null);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: cur, newPassword: next }),
      });
      if (res.ok) {
        setCur("");
        setNext("");
        setPwMsg({ key: "settings.pw.ok", ok: true });
      } else {
        setPwMsg({ key: res.status === 401 ? "settings.pw.wrong" : res.status === 400 ? "err.password" : "err.generic", ok: false });
      }
    } catch {
      setPwMsg({ key: "err.generic", ok: false });
    } finally {
      setPwBusy(false);
    }
  }

  const date = expiresAt
    ? new Date(expiresAt).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 pt-2">
      <h1 className="font-serif text-xl font-bold text-primary">{t("settings.title")}</h1>

      <div className={`${card} flex items-center gap-4`}>
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-accent bg-muted">
          {me?.profilePhoto && <Image src={me.profilePhoto} alt="" fill sizes="80px" className="object-cover" />}
        </div>
        <div className="min-w-0">
          <h2 className="font-serif text-lg font-bold">{me?.fullName}</h2>
          {me && <p className="text-sm text-muted-foreground">{me.location} · {me.community}</p>}
          <span className="mt-1 inline-block rounded-full bg-[#e6f2e8] px-2.5 py-1 text-xs font-bold text-success">
            ✓ {t("settings.verified")}
          </span>
        </div>
      </div>

      <Link href="/edit-profile" className="btn btn-outline w-full">{t("settings.edit")}</Link>

      <section className={card}>
        {date && <p className="mb-3 font-semibold">{t("settings.until", { date })}</p>}
        <Link href="/payment" className="btn btn-primary w-full">{t("banner.renew")}</Link>
      </section>

      <section className={`${card} flex items-center justify-between`}>
        <span className="font-semibold">{t("settings.lang")}</span>
        <LangToggle />
      </section>

      <form onSubmit={changePassword} className={`${card} space-y-3`}>
        <h2 className="font-serif text-lg font-bold text-primary">{t("settings.pw.title")}</h2>
        <PasswordInput value={cur} onChange={setCur} autoComplete="current-password" placeholder={t("settings.pw.current")} />
        <PasswordInput value={next} onChange={setNext} autoComplete="new-password" placeholder={t("settings.pw.new")} />
        {pwMsg && (
          <p role="alert" className={`font-medium ${pwMsg.ok ? "text-success" : "text-error"}`}>{t(pwMsg.key)}</p>
        )}
        <button className="btn btn-primary w-full" disabled={pwBusy || !cur || !next}>
          {pwBusy ? <span className="spinner" /> : t("settings.pw.save")}
        </button>
      </form>

      <section className={card}>
        <h2 className="mb-3 font-serif text-lg font-bold text-primary">{t("settings.blocked.title")}</h2>
        {blocked.length === 0 ? (
          <p className="text-muted-foreground">{t("settings.blocked.none")}</p>
        ) : (
          <ul className="space-y-3">
            {blocked.map((b) => (
              <li key={b.userId} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                  {b.photo && <Image src={b.photo} alt="" fill sizes="48px" className="object-cover" />}
                </div>
                <span className="min-w-0 flex-1 truncate font-semibold">{b.name}</span>
                <button onClick={() => unblock(b.userId)} className="btn btn-outline min-h-12 px-3 py-2">
                  {t("settings.unblock")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button onClick={() => signOut({ callbackUrl: "/welcome" })} className="btn btn-outline w-full border-error text-error">
        {t("common.signOut")}
      </button>
    </main>
  );
}
