import { createHmac, timingSafeEqual } from "crypto";

export const membershipAmountPaise = (): number => Number(process.env.MEMBERSHIP_AMOUNT_PAISE ?? 50000);

function hmacMatches(data: string, signature: string, secret: string): boolean {
  const expected = Buffer.from(createHmac("sha256", secret).update(data).digest("hex"));
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export const verifyCheckoutSignature = (orderId: string, paymentId: string, signature: string, secret: string): boolean =>
  hmacMatches(`${orderId}|${paymentId}`, signature, secret);

export const verifyWebhookSignature = (rawBody: string, signature: string, secret: string): boolean =>
  hmacMatches(rawBody, signature, secret);

export async function createOrder(amountPaise: number, receipt: string): Promise<{ id: string; amount: number }> {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt }),
  });
  if (!res.ok) throw new Error(`Razorpay order creation failed: ${res.status}`);
  const o = await res.json();
  return { id: o.id, amount: o.amount };
}
