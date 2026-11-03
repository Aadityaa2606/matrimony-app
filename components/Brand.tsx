"use client";

import { useT } from "@/components/LanguageProvider";

export function Brand({ size = "sm" }: { size?: "lg" | "sm" }) {
  const { t } = useT();
  const lg = size === "lg";
  return (
    <div className="text-center leading-tight">
      <div
        className={`font-serif font-bold text-primary ${lg ? "text-4xl" : "text-xl"}`}
      >
        {t("brand.name")}
      </div>
      <div
        className={`font-semibold uppercase tracking-[0.25em] text-accent ${lg ? "text-sm" : "text-[10px]"}`}
      >
        {t("brand.sub")}
      </div>
    </div>
  );
}
