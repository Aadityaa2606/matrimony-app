"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/components/LanguageProvider";

export function LangToggle() {
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
      className="rounded-full border border-accent px-3 py-1 text-sm font-semibold text-primary"
    >
      {t("lang.toggle")}
    </button>
  );
}
