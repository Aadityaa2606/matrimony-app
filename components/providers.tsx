"use client";

import { SessionProvider } from "next-auth/react";
import { ChatProvider } from "@/components/ChatProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import type { Lang } from "@/lib/i18n/dict";

export function Providers({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: Lang;
}) {
  return (
    <SessionProvider>
      <LanguageProvider initialLang={initialLang}>
        <ChatProvider>{children}</ChatProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
