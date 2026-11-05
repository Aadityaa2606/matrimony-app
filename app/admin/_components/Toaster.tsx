"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; ok: boolean; text: string };
let push: (t: Omit<Toast, "id">) => void = () => {};

export const toast = {
  success: (text: string) => push({ ok: true, text }),
  error: (text: string) => push({ ok: false, text }),
};

// Mounted once in the admin layout, so toasts survive client-side navigation (e.g. create → user page).
export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    let n = 0;
    push = (t) => {
      const id = ++n;
      setItems((x) => [...x.slice(-3), { ...t, id }]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), t.ok ? 3500 : 6000);
    };
    return () => {
      push = () => {};
    };
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end">
      {items.map((t) => (
        <div
          key={t.id}
          role={t.ok ? "status" : "alert"}
          className="adm-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 text-sm text-zinc-800 shadow-lg shadow-zinc-900/5"
        >
          <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-white ${t.ok ? "bg-emerald-500" : "bg-rose-500"}`}>
            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d={t.ok ? "m4.5 12.75 6 6 9-13.5" : "M6 18 18 6M6 6l12 12"} />
            </svg>
          </span>
          <p className="flex-1 font-medium">{t.text}</p>
          <button
            type="button"
            onClick={() => setItems((x) => x.filter((i) => i.id !== t.id))}
            className="-m-1 rounded p-1 text-zinc-400 hover:text-zinc-700"
            aria-label="Dismiss"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
