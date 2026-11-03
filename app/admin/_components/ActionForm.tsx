"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { shrinkImage } from "@/lib/shrink-image";

// Runs a server action from a form and shows its error inline. With `field`, the action gets that input's
// string value; otherwise it gets the FormData (or nothing, for pre-bound actions).
export default function ActionForm({
  action,
  field,
  confirm,
  redirectTo,
  className,
  children,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (arg: any) => Promise<{ error?: string; id?: string }>;
  field?: string;
  confirm?: string;
  redirectTo?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const router = useRouter();
  return (
    <form
      className={className}
      action={async (fd) => {
        if (confirm && !window.confirm(confirm)) return;
        setPending(true);
        if (!field) {
          const entries = [...fd.entries()];
          for (const k of new Set(entries.map(([k]) => k))) fd.delete(k);
          for (const [k, v] of entries) {
            const small = v instanceof File && v.size > 0 && v.type.startsWith("image/") ? await shrinkImage(v) : v;
            if (small instanceof File && small.size > 4 * 1024 * 1024) {
              setPending(false);
              return setError("Photo is too large (max 4MB)");
            }
            fd.append(k, small);
          }
        }
        const r = await action(field ? String(fd.get(field) ?? "") : fd);
        setPending(false);
        setError(r.error);
        if (!r.error && redirectTo) router.push(redirectTo.replace("{id}", r.id ?? ""));
      }}
    >
      <fieldset disabled={pending} className="contents">{children}</fieldset>
      {error && <p className="mt-1 text-red-600">{error}</p>}
    </form>
  );
}
