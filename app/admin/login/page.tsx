"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function StaffLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const res = await signIn("staff", {
      username: f.get("username"),
      password: f.get("password"),
      redirect: false,
    });
    setBusy(false);
    if (res?.error || !res?.ok) return setError("Invalid username or password");
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-xs p-8">
      <h1 className="mb-4 text-xl font-semibold">Staff sign in</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input name="username" placeholder="Username" required className="border p-2" />
        <input name="password" type="password" placeholder="Password" required className="border p-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="bg-black p-2 text-white disabled:opacity-50">
          Sign in
        </button>
      </form>
    </main>
  );
}
