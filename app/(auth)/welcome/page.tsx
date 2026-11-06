"use client";

import Link from "next/link";
import { OutsideScreen } from "@/components/OutsideScreen";
import { GoldDivider } from "@/components/Ornaments";
import { useT } from "@/components/LanguageProvider";

const BADGES = [
  { k: "welcome.safe", d: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z M9 12l2 2 4-4" },
  { k: "welcome.verified", d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM5 21a7 7 0 0114 0 M15.5 17.5l1.5 1.5 3-3" },
] as const;

export default function WelcomePage() {
  const { t } = useT();
  return (
    <OutsideScreen hero>
      <div className="flex flex-col items-center gap-5 text-center">
        <p className="font-serif text-xl font-bold leading-snug sm:text-2xl text-primary">{t("welcome.tagline")}</p>
        <GoldDivider />
        <div className="grid w-full grid-cols-2 gap-4">
          {BADGES.map(({ k, d }) => (
            <div key={k} className="flex flex-col items-center gap-2">
              <span className="flex size-20 items-center justify-center rounded-full border border-accent/60 bg-[radial-gradient(circle,#fffdf8_55%,#f6ead0)] text-primary shadow-[0_4px_14px_rgba(120,80,20,.12)]">
                <svg className="size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <path d={d} />
                </svg>
              </span>
              <span className="text-sm font-semibold">{t(k)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex w-full flex-col gap-3">
          <Link href="/features" className="btn btn-primary btn-pill w-full">
            {t("welcome.getStarted")}
            <svg aria-hidden className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </Link>
          <Link href="/sign-in" className="btn btn-outline btn-pill w-full">
            {t("welcome.signIn")}
          </Link>
        </div>
      </div>
    </OutsideScreen>
  );
}
