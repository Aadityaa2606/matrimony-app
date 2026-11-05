"use client";

import { useActionState, useState } from "react";
import { staffLogin } from "@/app/admin/actions";
import { btn, input, label } from "@/app/admin/_components/ui";

export default function LoginForm() {
  const [state, action, pending] = useActionState(staffLogin, undefined);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <label className={label}>
        Username
        <input name="username" key={state?.username} defaultValue={state?.username} autoComplete="username" autoCapitalize="none" spellCheck={false} required autoFocus className={input} />
      </label>
      <label className={label}>
        Password
        <span className="relative">
          <input name="password" type={show ? "text" : "password"} autoComplete="current-password" required className={`${input} pr-16`} />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-zinc-500 hover:text-zinc-900"
          >
            {show ? "Hide" : "Show"}
          </button>
        </span>
      </label>
      {state?.error && (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
      )}
      <button disabled={pending} className={`${btn.primary} h-10 w-full`} data-pending={pending || undefined}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-xs text-zinc-400">You stay signed in on this device for 30 days.</p>
    </form>
  );
}
