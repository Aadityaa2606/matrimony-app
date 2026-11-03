import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getMember } from "@/lib/member";
import { createOrder, membershipAmountPaise } from "@/lib/razorpay";
import { logError } from "@/lib/errors";

export async function POST() {
  const m = await getMember();
  if (!m) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (m.status !== "PENDING_PAYMENT" && m.status !== "ACTIVE" && m.status !== "EXPIRED") {
    return NextResponse.json({ error: "inactive" }, { status: 403 });
  }
  const amount = membershipAmountPaise();
  try {
    const order = await createOrder(amount, m.id.slice(0, 40));
    await prisma.payment.create({
      data: { userId: m.id, amountPaise: amount, method: "RAZORPAY", razorpayOrderId: order.id },
    });
    return NextResponse.json({ orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (e) {
    await logError("payment.order", e, { userId: m.id });
    return NextResponse.json({ error: "gateway" }, { status: 502 });
  }
}
