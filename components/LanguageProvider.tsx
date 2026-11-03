"use client";

import { createContext, useContext, useState } from "react";
import { en, ta, type DictKey, type Lang } from "@/lib/i18n/dict";

type Ctx = {
  lang: Lang;
  setLang(l: Lang): void;
  t(k: DictKey, vars?: Record<string, string | number>): string;
};

const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const t: Ctx["t"] = (k, vars) =>
    (lang === "en" ? en : ta)[k].replace(/\{(\w+)\}/g, (m, name) =>
      vars && name in vars ? String(vars[name]) : m,
    );
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT(): Ctx {
  const c = useContext(LangContext);
  if (!c) throw new Error("useT must be used within LanguageProvider");
  return c;
}
