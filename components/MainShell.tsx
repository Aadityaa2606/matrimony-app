"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/Brand";
import { Garland } from "@/components/Garland";
import { LangToggle } from "@/components/LangToggle";
import { useT } from "@/components/LanguageProvider";
import type { DictKey } from "@/lib/i18n/dict";

const navItems: { href: string; label: DictKey; d: string }[] = [
  { href: "/home", label: "nav.home", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/favorites", label: "nav.favorites", d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { href: "/chats", label: "nav.chats", d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { href: "/settings", label: "nav.profile", d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function MainShell({
  children,
  expiresAt,
}: {
  children: React.ReactNode;
  expiresAt: string | null;
}) {
  const pathname = usePathname();
  const { t } = useT();
  const [daysLeft] = useState(() =>
    expiresAt ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 864e5) : 0,
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="relative">
        <Garland variant="thin" />
        <div className="relative mx-auto flex max-w-2xl items-center justify-between px-4 pb-2 pt-3">
          <Brand size="sm" />
          <LangToggle />
        </div>
      </header>

      {daysLeft > 0 && daysLeft <= 7 && (
        <div className="relative mx-4 mb-2 flex max-w-2xl items-center justify-between gap-3 rounded-[18px] bg-accent/20 px-4 py-2 sm:mx-auto">
          <span className="font-semibold">{t(daysLeft === 1 ? "banner.day" : "banner.days", { n: daysLeft })}</span>
          <Link href="/payment" className="btn btn-primary min-h-12 px-4 py-2">
            {t("banner.renew")}
          </Link>
        </div>
      )}

      {children}

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-white shadow-lg">
        <div className="mx-auto flex h-16 max-w-2xl items-stretch justify-around px-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-16 flex-1 flex-col items-center justify-center border-b-4 text-xs font-semibold ${
                  active ? "border-accent text-primary" : "border-transparent text-muted-foreground"
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
                </svg>
                <span className="mt-0.5">{t(item.label)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
