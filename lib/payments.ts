import type { Prisma, PaymentStatus } from "@prisma/client";
import prisma from "@/lib/db";
import { afterPayment } from "@/lib/lifecycle";

export type CaptureOutcome = "captured" | "already" | "unknown_order";

export function captureDecision(p: { status: PaymentStatus } | null): CaptureOutcome {
  if (!p) return "unknown_order";
  return p.status === "PAID" ? "already" : "captured";
}

async function applyAfterPayment(tx: Prisma.TransactionClient, userId: string, now: Date): Promise<void> {
  // Serialise concurrent captures for one user so expiry is never granted twice.
  await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, include: { profile: { select: { id: true } } } });
  const c = afterPayment({ status: user.status, expiresAt: user.expiresAt, hasProfile: !!user.profile, hasPaid: true }, now);
  await tx.user.update({
    where: { id: userId },
    data: {
      status: c.status,
      ...(c.expiresAt !== undefined && { expiresAt: c.expiresAt }),
      ...(c.approvedAt !== undefined && { approvedAt: c.approvedAt }),
    },
  });
}

// Conditional updateMany makes concurrent webhook + verify calls safe: only one flips the row to PAID.
export async function capturePayment(orderId: string, paymentId: string, now: Date): Promise<CaptureOutcome> {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.payment.updateMany({
      where: { razorpayOrderId: orderId, status: { not: "PAID" } },
      data: { status: "PAID", razorpayPaymentId: paymentId, paidAt: now },
    });
    const payment = await tx.payment.findUnique({ where: { razorpayOrderId: orderId } });
    if (count === 0 || !payment) return captureDecision(payment);
    await applyAfterPayment(tx, payment.userId, now);
    return "captured";
  });
}

export async function recordManualPayment(userId: string, staffId: string, now: Date): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        userId,
        amountPaise: Number(process.env.MEMBERSHIP_AMOUNT_PAISE ?? 50000),
        method: "MANUAL",
        status: "PAID",
        markedById: staffId,
        paidAt: now,
      },
    });
    await applyAfterPayment(tx, userId, now);
  });
}
