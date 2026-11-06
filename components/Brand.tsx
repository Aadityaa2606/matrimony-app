"use client";

import { useT } from "@/components/LanguageProvider";
import { Emblem } from "@/components/Ornaments";

// Brand lockup for the maroon band: gold rings, ivory serif name, gold sub-line between rules.
export function Brand({ size = "sm" }: { size?: "lg" | "sm" }) {
  const { t, lang } = useT();
  const lg = size === "lg";
  return (
    <div className="flex flex-col items-center text-center leading-tight">
      <Emblem className={lg ? "mb-1 h-11 w-16" : "h-6 w-9"} />
      <div className={`font-serif font-bold tracking-wide text-[#fdf6e7] ${lg ? "text-4xl" : "text-xl"}`}>
        {t("brand.name")}
      </div>
      <div className={`mt-0.5 flex items-center gap-2 font-medium uppercase text-accent-light ${lang === "en" ? "tracking-[0.25em]" : ""} ${lg ? "text-xs" : "text-[9px]"}`}>
        <span className="h-px w-5 bg-accent-light/60" />
        {t("brand.sub")}
        <span className="h-px w-5 bg-accent-light/60" />
      </div>
    </div>
  );
}
