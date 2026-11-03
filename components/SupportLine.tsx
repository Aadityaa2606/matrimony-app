"use client";

import { useT } from "@/components/LanguageProvider";

const PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE;

export function SupportLine({ label }: { label?: string }) {
  const { t } = useT();
  const text = label ?? t("common.help");
  return PHONE ? (
    <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="inline-flex min-h-12 items-center font-semibold text-primary underline">
      {text}: {PHONE}
    </a>
  ) : (
    <span className="font-semibold text-primary">{text}</span>
  );
}
