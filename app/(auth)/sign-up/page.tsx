"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OutsideScreen } from "@/components/OutsideScreen";
import { PhoneInput } from "@/components/PhoneInput";
import { PasswordInput } from "@/components/PasswordInput";
import { useT } from "@/components/LanguageProvider";
import { normalizePhone } from "@/lib/phone";
import { errorKey } from "@/lib/i18n/errors";
import type { DictKey } from "@/lib/i18n/dict";

export default function SignUpPage() {
  const { t } = useT();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<DictKey | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = normalizePhone(phone);
    if (!name.trim()) return setErr("err.name");
    if (!p) return setErr("err.phone");
    if (password.length < 8) return setErr("err.password");
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: p, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErr(res.status === 409 ? "signup.exists" : errorKey(body?.error));
        return;
      }
      const r = await signIn("member", { phone: p, password, redirect: false });
      if (r?.error) return setErr("err.generic");
      router.push("/dashboard");
    } catch {
      setErr("err.generic");
    } finally {
      setBusy(false);
    }
  }

  return (
    <OutsideScreen>
      <h1 className="mb-6 text-center font-serif text-2xl font-bold text-primary">{t("signup.title")}</h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 font-semibold">
          {t("signup.name")}
          <input className="input font-normal" value={name} maxLength={60} autoComplete="name" onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="flex flex-col gap-2 font-semibold">
          {t("signup.phone")}
          <PhoneInput value={phone} onChange={setPhone} />
        </label>
        <label className="flex flex-col gap-2 font-semibold">
          {t("signup.password")}
          <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" />
        </label>
        {err && (
          <p role="alert" className="text-error">
            {t(err)}{" "}
            {err === "signup.exists" && (
              <Link href="/sign-in" className="font-semibold underline">
                {t("welcome.signIn")}
              </Link>
            )}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn btn-primary btn-pill w-full">
          {t("signup.submit")}
        </button>
      </form>
      <p className="mt-6 text-center">
        {t("signup.haveAccount")}{" "}
        <Link href="/sign-in" className="font-semibold text-primary underline">
          {t("welcome.signIn")}
        </Link>
      </p>
    </OutsideScreen>
  );
}
