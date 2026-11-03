"use client";

import { useRef, useState } from "react";
import Script from "next/script";
import { OutsideScreen } from "@/components/OutsideScreen";
import { SupportLine } from "@/components/SupportLine";
import { useT } from "@/components/LanguageProvider";
import { errorKey } from "@/lib/i18n/errors";
import type { DictKey } from "@/lib/i18n/dict";

type RzpResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
declare global {
  interface Window {
    Razorpay?: new (o: Record<string, unknown>) => { open(): void };
  }
}

export function PaymentClient({ renew, amount }: { renew: boolean; amount: number }) {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<DictKey | null>(null);

  const inFlight = useRef(false);

  const fail = (k: DictKey) => {
    inFlight.current = false;
    setErr(k);
    setBusy(false);
  };

  async function verify(r: RzpResponse) {
    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(r),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.next) return fail(errorKey(body?.error));
      window.location.assign(body.next); // full reload so ChatProvider refetches its token
    } catch {
      fail("err.generic");
    }
  }

  async function pay() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/payment/order", { method: "POST" });
      const o = await res.json().catch(() => null);
      if (!res.ok || !o?.orderId) return fail(errorKey(o?.error));
      if (!window.Razorpay) return fail("err.generic");
      const rz = new window.Razorpay({
        key: o.keyId,
        order_id: o.orderId,
        amount: o.amount,
        currency: "INR",
        name: "Kalyana Varan Matrimony",
        handler: verify,
        modal: { ondismiss: () => fail("pay.cancelled") },
      });
      rz.open();
    } catch {
      fail("err.generic");
    }
  }

  const k = renew ? "renew" : "new";
  return (
    <OutsideScreen>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="mt-4 flex flex-col items-center gap-4 text-center">
        <h1 className="font-serif text-2xl font-bold text-primary">{t(`pay.title.${k}`)}</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{t(`pay.body.${k}`, { amount })}</p>
        {err && (
          <div role="alert" className="flex flex-col items-center gap-1 text-error">
            <p>{t(err)}</p>
            <SupportLine />
          </div>
        )}
        <button type="button" onClick={pay} disabled={busy} className="btn btn-primary btn-pill mt-2 w-full">
          {err ? t("pay.retry") : t("pay.button", { amount })}
        </button>
      </div>
    </OutsideScreen>
  );
}
