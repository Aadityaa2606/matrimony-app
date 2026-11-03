import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { capturePayment } from "@/lib/payments";
import { logError } from "@/lib/errors";

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    await logError("payment.webhook", "RAZORPAY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }
  if (!verifyWebhookSignature(raw, sig, secret)) {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }
  try {
    const event = JSON.parse(raw);
    const entity = event.payload?.payment?.entity;
    if (event.event === "payment.captured" || event.event === "order.paid") {
      await capturePayment(entity.order_id, entity.id, new Date());
    } else if (event.event === "payment.failed") {
      await prisma.payment.updateMany({
        where: { razorpayOrderId: entity.order_id, status: "CREATED" },
        data: { status: "FAILED", failureReason: entity.error_description },
      });
      await logError("payment.failed", entity.error_description ?? "payment failed", { orderId: entity.order_id, paymentId: entity.id });
    }
  } catch (e) {
    await logError("payment.webhook", e);
  }
  return NextResponse.json({ ok: true });
}
