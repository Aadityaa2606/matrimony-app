import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getMember } from "@/lib/member";
import { verifyCheckoutSignature } from "@/lib/razorpay";
import { logError } from "@/lib/errors";
import { capturePayment } from "@/lib/payments";
import { effectiveStatus, landingPath } from "@/lib/lifecycle";

export async function POST(req: Request) {
  const m = await getMember();
  if (!m) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const orderId = b?.razorpay_order_id, paymentId = b?.razorpay_payment_id, sig = b?.razorpay_signature;
  if (![orderId, paymentId, sig].every((v) => typeof v === "string" && v)) {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    await logError("payment.verify", "RAZORPAY_KEY_SECRET not set", { userId: m.id });
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }
  if (!verifyCheckoutSignature(orderId, paymentId, sig, secret)) {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }
  const own = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId }, select: { userId: true } });
  if (!own || own.userId !== m.id) return NextResponse.json({ error: "unknown_order" }, { status: 404 });
  const outcome = await capturePayment(orderId, paymentId, new Date());
  if (outcome === "unknown_order") return NextResponse.json({ error: "unknown_order" }, { status: 404 });
  const u = await prisma.user.findUniqueOrThrow({ where: { id: m.id }, select: { status: true, expiresAt: true } });
  return NextResponse.json({ ok: true, next: landingPath(effectiveStatus(u, new Date())) });
}
