"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { OutsideScreen } from "@/components/OutsideScreen";
import { useT } from "@/components/LanguageProvider";
import type { DictKey } from "@/lib/i18n/dict";

type Form = {
  fullName: string;
  gender: "BRIDE" | "GROOM" | "";
  dateOfBirth: string;
  height: string;
  education: string;
  profession: string;
  salary: string;
  location: string;
  community: string;
  subCaste: string;
  hasHoroscope: boolean | null;
  parentContact: string; // 10 digits, sent as "+91 ..."
  profilePhoto: string;
  additionalPhotos: string[];
};

const initial: Form = {
  fullName: "", gender: "", dateOfBirth: "", height: "", education: "", profession: "",
  salary: "", location: "", community: "", subCaste: "", hasHoroscope: null,
  parentContact: "", profilePhoto: "", additionalPhotos: [],
};

const heights = Array.from({ length: 25 }, (_, i) => `${4 + Math.floor((i + 6) / 12)}'${(i + 6) % 12}"`);
// Stored values stay English (existing data); labels are translated.
const educations: [string, DictKey][] = [
  ["High School", "reg.edu.hs"], ["Diploma", "reg.edu.dip"], ["Bachelor's Degree", "reg.edu.bach"],
  ["Master's Degree", "reg.edu.mast"], ["Doctorate (PhD)", "reg.edu.phd"],
  ["Professional Degree (MD, JD, etc.)", "reg.edu.prof"], ["Other", "reg.edu.other"],
];
const stepKeys: DictKey[] = ["reg.s1", "reg.s2", "reg.s3", "reg.s4"];
const TOTAL = 4;
const MAX_MORE = 5;
const MAX_BYTES = 5 * 1024 * 1024;

const ageOf = (dob: string) => {
  const b = new Date(dob);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a;
};
const digits = (v: string) => v.replace(/\D/g, "");

export function RegisterClient() {
  const { t } = useT();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [f, setF] = useState<Form>(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<DictKey | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setErr(null);
  };

  function validate(): DictKey | null {
    if (step === 1) {
      if (!f.fullName.trim()) return "reg.e.name";
      if (!f.gender) return "reg.e.gender";
      if (!f.dateOfBirth) return "reg.e.dob";
      if (ageOf(f.dateOfBirth) < 18) return "reg.e.age";
      if (!f.height) return "reg.e.height";
    } else if (step === 2) {
      if (!f.education) return "reg.e.edu";
      if (!f.profession.trim()) return "reg.e.job";
    } else if (step === 3) {
      if (!f.location.trim()) return "reg.e.loc";
      if (!f.community.trim()) return "reg.e.comm";
      if (f.hasHoroscope === null) return "reg.e.horo";
      if (f.parentContact.length !== 10) return "reg.e.parent";
    } else if (!f.profilePhoto) return "reg.e.photo";
    return null;
  }

  async function upload(file: File, main: boolean) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setErr("reg.e.type");
    if (file.size > MAX_BYTES) return setErr("reg.e.size");
    if (!main && f.additionalPhotos.length >= MAX_MORE) return setErr("reg.e.max");
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/upload", { method: "POST", body: fd });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.url) return setErr("err.generic");
      setF((p) =>
        main
          ? { ...p, profilePhoto: body.url }
          : { ...p, additionalPhotos: [...p.additionalPhotos, body.url].slice(0, MAX_MORE) },
      );
    } catch {
      setErr("err.generic");
    } finally {
      setUploading(false);
    }
  }

  function next() {
    const e = validate();
    if (e) return setErr(e);
    setErr(null);
    setStep((s) => s + 1);
  }

  async function submit() {
    const e = validate();
    if (e) return setErr(e);
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, parentContact: `+91 ${f.parentContact}` }),
      });
      if (!res.ok) return setErr("err.generic");
      router.push("/dashboard");
    } catch {
      setErr("err.generic");
    } finally {
      setBusy(false);
    }
  }

  const Label = ({ k, children }: { k: DictKey; children?: React.ReactNode }) => (
    <label className="mb-2 block text-base font-semibold">{t(k)}{children}</label>
  );
  const choice = (on: boolean) =>
    `min-h-[56px] rounded-xl border-2 p-3 text-lg font-semibold transition-all ${
      on ? "border-primary bg-primary/10" : "border-border"
    }`;
  const removeBtn = (onClick: () => void) => (
    <button type="button" aria-label={t("reg.photo.remove")} onClick={onClick}
      className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-error text-white">
      ×
    </button>
  );
  const picker = (main: boolean, cls: string) => (
    <label className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border p-1 text-center text-sm text-muted-foreground ${cls}`}>
      <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) upload(file, main);
        }} />
      {uploading ? <span className="spinner" /> : <><span className="text-2xl">+</span><span>{t("reg.photo.add")}</span></>}
    </label>
  );

  return (
    <OutsideScreen>
      <h1 className="font-serif text-2xl font-bold text-primary">{t("reg.title")}</h1>
      <p className="mb-4 text-muted-foreground">{t("reg.step", { n: step, total: TOTAL })}</p>

      <div className="mb-6">
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step}>
          <div className="h-full bg-primary transition-all" style={{ width: `${(step / TOTAL) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          {stepKeys.map((k, i) => (
            <span key={k} className={i + 1 === step ? "font-bold text-primary" : ""}>{t(k)}</span>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        {step === 1 && (
          <>
            <div>
              <Label k="reg.name" />
              <input className="input" autoComplete="name" placeholder={t("reg.name.ph")} value={f.fullName}
                onChange={(e) => set("fullName", e.target.value)} />
            </div>
            <div>
              <Label k="reg.iam" />
              <div className="grid grid-cols-2 gap-3">
                {(["BRIDE", "GROOM"] as const).map((g) => (
                  <button key={g} type="button" className={choice(f.gender === g)} onClick={() => set("gender", g)}>
                    {t(g === "BRIDE" ? "reg.bride" : "reg.groom")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label k="reg.dob" />
              <input type="date" className="input" value={f.dateOfBirth}
                onChange={(e) => set("dateOfBirth", e.target.value)} />
              {f.dateOfBirth && <p className="mt-1 text-muted-foreground">{t("reg.age", { age: ageOf(f.dateOfBirth) })}</p>}
            </div>
            <div>
              <Label k="reg.height" />
              <select className="input" value={f.height} onChange={(e) => set("height", e.target.value)}>
                <option value="">{t("reg.height.ph")}</option>
                {heights.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <Label k="reg.edu" />
              <select className="input" value={f.education} onChange={(e) => set("education", e.target.value)}>
                <option value="">{t("reg.edu.ph")}</option>
                {educations.map(([v, k]) => <option key={v} value={v}>{t(k)}</option>)}
              </select>
            </div>
            <div>
              <Label k="reg.job" />
              <input className="input" placeholder={t("reg.job.ph")} value={f.profession}
                onChange={(e) => set("profession", e.target.value)} />
            </div>
            <div>
              <Label k="reg.salary" />
              <input className="input" placeholder={t("reg.salary.ph")} value={f.salary}
                onChange={(e) => set("salary", e.target.value)} />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <Label k="reg.loc" />
              <input className="input" placeholder={t("reg.loc.ph")} value={f.location}
                onChange={(e) => set("location", e.target.value)} />
            </div>
            <div>
              <Label k="reg.comm" />
              <input className="input" placeholder={t("reg.comm.ph")} value={f.community}
                onChange={(e) => set("community", e.target.value)} />
            </div>
            <div>
              <Label k="reg.sub" />
              <input className="input" placeholder={t("reg.sub.ph")} value={f.subCaste}
                onChange={(e) => set("subCaste", e.target.value)} />
            </div>
            <div>
              <Label k="reg.horo" />
              <div className="grid grid-cols-2 gap-3">
                {[true, false].map((v) => (
                  <button key={String(v)} type="button" className={choice(f.hasHoroscope === v)} onClick={() => set("hasHoroscope", v)}>
                    {t(v ? "reg.yes" : "reg.no")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label k="reg.parent" />
              <div className="flex items-stretch gap-2">
                <span className="flex min-h-[52px] items-center rounded-xl border-2 border-border bg-muted px-3 font-semibold">+91</span>
                <input type="tel" inputMode="numeric" className="input min-w-0 flex-1" placeholder="98765 43210"
                  value={f.parentContact}
                  onChange={(e) => set("parentContact", digits(e.target.value).slice(0, 10))} />
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <Label k="reg.photo" />
              <p className="mb-3 text-muted-foreground">{t("reg.photo.hint")}</p>
              {f.profilePhoto ? (
                <div className="relative mx-auto h-32 w-32">
                  <Image src={f.profilePhoto} alt="" fill className="rounded-xl object-cover" />
                  {removeBtn(() => set("profilePhoto", ""))}
                </div>
              ) : (
                picker(true, "mx-auto h-32 w-32")
              )}
            </div>
            <div>
              <Label k="reg.more" />
              <p className="mb-3 text-muted-foreground">{t("reg.more.hint")}</p>
              <div className="grid grid-cols-3 gap-3">
                {f.additionalPhotos.map((p, i) => (
                  <div key={p + i} className="relative aspect-square">
                    <Image src={p} alt="" fill className="rounded-xl object-cover" />
                    {removeBtn(() => set("additionalPhotos", f.additionalPhotos.filter((_, j) => j !== i)))}
                  </div>
                ))}
                {f.additionalPhotos.length < MAX_MORE && picker(false, "aspect-square")}
              </div>
            </div>
          </>
        )}

        {err && <p role="alert" className="text-base font-medium text-error">{t(err)}</p>}

        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <button type="button" className="btn btn-outline px-4" onClick={() => { setErr(null); setStep((s) => s - 1); }}>
              {t("common.back")}
            </button>
          )}
          <button type="button" className="btn btn-primary min-w-0 flex-1 px-3 text-center text-lg" disabled={busy || uploading}
            onClick={step < TOTAL ? next : submit}>
            {busy ? <span className="spinner" /> : t(step < TOTAL ? "reg.continue" : "reg.submit")}
          </button>
        </div>
      </div>
    </OutsideScreen>
  );
}
