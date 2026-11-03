"use client";

import { useState } from "react";
import { useT } from "@/components/LanguageProvider";

export function PasswordInput(props: {
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder?: string;
}) {
  const { t } = useT();
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className="input pr-20"
        value={props.value}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        onChange={(e) => props.onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-1 top-1/2 min-h-12 min-w-12 -translate-y-1/2 px-3 text-sm font-semibold text-primary"
      >
        {show ? t("pw.hide") : t("pw.show")}
      </button>
    </div>
  );
}
