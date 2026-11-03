"use client";

import { signOut } from "next-auth/react";
import { OutsideScreen } from "@/components/OutsideScreen";
import { SupportLine } from "@/components/SupportLine";
import { useT } from "@/components/LanguageProvider";

export function AccountStatusClient({ status }: { status: "REJECTED" | "SUSPENDED" }) {
  const { t } = useT();
  const k = status === "REJECTED" ? "rejected" : "suspended";
  return (
    <OutsideScreen>
      <div className="mt-4 flex flex-col items-center gap-4 text-center">
        <h1 className="font-serif text-2xl font-bold text-primary">{t(`status.${k}.title`)}</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{t(`status.${k}.body`)}</p>
        <SupportLine />
        <button type="button" onClick={() => signOut({ callbackUrl: "/welcome" })} className="btn mt-2 w-full border-2 border-accent text-primary">
          {t("common.signOut")}
        </button>
      </div>
    </OutsideScreen>
  );
}
