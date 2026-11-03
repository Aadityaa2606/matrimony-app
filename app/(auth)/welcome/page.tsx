"use client";

import Link from "next/link";
import { OutsideScreen } from "@/components/OutsideScreen";
import { Brand } from "@/components/Brand";
import { GoldDivider } from "@/components/Garland";
import { useT } from "@/components/LanguageProvider";

export default function WelcomePage() {
  const { t } = useT();
  return (
    <OutsideScreen>
      <div className="mt-8 flex flex-col items-center gap-5 text-center">
        <Brand size="lg" />
        <GoldDivider />
        <p className="text-lg leading-relaxed text-muted-foreground">{t("welcome.tagline")}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {(["welcome.safe", "welcome.verified"] as const).map((k) => (
            <span key={k} className="rounded-full border border-accent bg-white px-4 py-2 text-sm font-semibold text-primary">
              ✓ {t(k)}
            </span>
          ))}
        </div>
        <div className="mt-6 flex w-full flex-col gap-3">
          <Link href="/features" className="btn btn-primary btn-pill w-full">
            {t("welcome.getStarted")}
          </Link>
          <Link href="/sign-in" className="btn w-full border-2 border-accent text-primary">
            {t("welcome.signIn")}
          </Link>
        </div>
      </div>
    </OutsideScreen>
  );
}
