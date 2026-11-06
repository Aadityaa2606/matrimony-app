"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OutsideScreen } from "@/components/OutsideScreen";
import { PhoneInput } from "@/components/PhoneInput";
import { PasswordInput } from "@/components/PasswordInput";
import { SupportLine } from "@/components/SupportLine";
import { useT } from "@/components/LanguageProvider";
import { normalizePhone } from "@/lib/phone";
import type { DictKey } from "@/lib/i18n/dict";

export default function SignInPage() {
  const { t } = useT();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<DictKey | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = normalizePhone(phone);
    if (!p) return setErr("err.phone");
    if (!password) return setErr("err.credentials");
    setBusy(true);
    setErr(null);
    try {
      const r = await signIn("member", { phone: p, password, redirect: false });
      if (r?.error) setErr("err.credentials");
      else router.push("/dashboard");
    } catch {
      setErr("err.generic");
    } finally {
      setBusy(false);
    }
  }

  return (
    <OutsideScreen>
      <h1 className="mb-6 text-center font-serif text-2xl font-bold text-primary">{t("signin.title")}</h1>
      <form onSubmit={submit} className="panel flex flex-col gap-4 p-5">
        <label className="flex flex-col gap-2 font-semibold">
          {t("signup.phone")}
          <PhoneInput value={phone} onChange={setPhone} />
        </label>
        <label className="flex flex-col gap-2 font-semibold">
          {t("signin.password")}
          <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
        </label>
        {err && (
          <p role="alert" className="text-error">
            {t(err)}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn btn-primary btn-pill w-full">
          {t("signin.submit")}
        </button>
      </form>
      <div className="mt-6 flex flex-col items-center gap-1 text-center">
        <span>{t("signin.forgot")}</span>
        <SupportLine label={t("common.callUs")} />
        <Link href="/sign-up" className="mt-2 inline-flex min-h-12 items-center font-semibold text-primary underline">
          {t("signin.new")}
        </Link>
      </div>
    </OutsideScreen>
  );
}
