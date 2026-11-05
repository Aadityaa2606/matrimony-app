"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { shrinkImage } from "@/lib/shrink-image";
import { toast } from "./Toaster";
import { btn } from "./ui";

// Runs a server action from a form: confirm dialog, spinner on the submit button while pending, and a toast
// with the outcome. With `field`, the action gets that input's string value; otherwise it gets the FormData
// (or nothing, for pre-bound actions).
export default function ActionForm({
  action,
  field,
  confirm,
  danger,
  success = "Saved",
  redirectTo,
  resetOnSuccess,
  className,
  children,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (arg: any) => Promise<{ error?: string; id?: string }>;
  field?: string;
  confirm?: string;
  danger?: boolean;
  success?: string;
  redirectTo?: string;
  resetOnSuccess?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmed = useRef(false);

  async function run(fd: FormData) {
    setPending(true);
    try {
      if (!field) {
        const entries = [...fd.entries()];
        for (const k of new Set(entries.map(([k]) => k))) fd.delete(k);
        for (const [k, v] of entries) {
          const small = v instanceof File && v.size > 0 && v.type.startsWith("image/") ? await shrinkImage(v) : v;
          if (small instanceof File && small.size > 4 * 1024 * 1024) return toast.error("Photo is too large (max 4MB)");
          fd.append(k, small);
        }
      }
      const r = await action(field ? String(fd.get(field) ?? "") : fd);
      if (r.error) return toast.error(r.error);
      toast.success(success);
      if (resetOnSuccess) formRef.current?.reset();
      if (redirectTo) router.push(redirectTo.replace("{id}", r.id ?? ""));
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      className={className}
      data-pending={pending || undefined}
      // onSubmit rather than the `action` prop: React 19 resets action forms even when the server returns an
      // error, which would wipe what the admin typed.
      onSubmit={(e) => {
        e.preventDefault();
        if (pending) return;
        if (confirm && !confirmed.current) return dialogRef.current?.showModal();
        confirmed.current = false;
        run(new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter));
      }}
    >
      <fieldset disabled={pending} className="contents">{children}</fieldset>
      {confirm && (
        <dialog
          ref={dialogRef}
          className="adm-dialog m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-900/40 backdrop:backdrop-blur-[2px]"
        >
          <div className="p-5">
            <h2 className="text-base font-semibold">{confirm}</h2>
            <p className="mt-1 text-sm text-zinc-500">Please confirm to continue.</p>
          </div>
          <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50/60 px-5 py-3">
            <button type="button" className={btn.secondary} onClick={() => dialogRef.current?.close()}>Cancel</button>
            <button
              type="button"
              autoFocus
              className={danger ? btn.dangerSolid : btn.primary}
              onClick={() => {
                dialogRef.current?.close();
                confirmed.current = true;
                formRef.current?.requestSubmit();
              }}
            >
              Confirm
            </button>
          </div>
        </dialog>
      )}
    </form>
  );
}
