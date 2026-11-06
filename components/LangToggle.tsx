"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/components/LanguageProvider";

export function LangToggle({ onDark = false }: { onDark?: boolean }) {
  const { lang, setLang, t } = useT();
  const router = useRouter();
  const next = lang === "ta" ? "en" : "ta";
  return (
    <button
      type="button"
      aria-label={t("lang.switch")}
      onClick={() => {
        document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
        setLang(next);
        router.refresh();
      }}
      className={`min-h-12 min-w-12 rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
        onDark ? "border-accent-light/60 bg-white/10 text-[#fdf6e7] hover:bg-white/20" : "border-accent text-primary hover:bg-accent/10"
      }`}
    >
      {t("lang.toggle")}
    </button>
  );
}
