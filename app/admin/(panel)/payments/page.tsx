import Link from "next/link";
import type { PaymentStatus } from "@prisma/client";
import prisma from "@/lib/db";
import { requireStaff } from "@/lib/staff";

const PAGE = 50;
const STATUSES: PaymentStatus[] = ["CREATED", "PAID", "FAILED"];

export default async function Payments({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  await requireStaff("view");
  const { status = "", page = "1" } = await searchParams;
  const where = STATUSES.includes(status as PaymentStatus) ? { status: status as PaymentStatus } : {};
  const p = Math.max(1, parseInt(page) || 1);
  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({ where, orderBy: { createdAt: "desc" }, skip: (p - 1) * PAGE, take: PAGE, include: { user: true } }),
  ]);
  const staff = await prisma.staff.findMany({ where: { id: { in: payments.flatMap((x) => (x.markedById ? [x.markedById] : [])) } } });
  const marker = new Map(staff.map((s) => [s.id, s.username]));
  const href = (n: number) => `/admin/payments?${new URLSearchParams({ status, page: String(n) })}`;
  const dt = (d: Date | null) => d?.toLocaleString("en-IN") ?? "-";
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Payments ({total})</h1>
      <form className="mb-4 flex gap-2">
        <select name="status" defaultValue={status} className="rounded border p-1">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="rounded border px-3">Filter</button>
      </form>
      <table className="w-full border text-left">
        <thead><tr className="border-b"><th className="p-2">User</th><th className="p-2">Amount</th><th className="p-2">Method</th><th className="p-2">Status</th><th className="p-2">Razorpay order</th><th className="p-2">Razorpay payment</th><th className="p-2">Marked by</th><th className="p-2">Created</th><th className="p-2">Paid</th></tr></thead>
        <tbody>
          {payments.map((x) => (
            <tr key={x.id} className="border-b">
              <td className="p-2"><Link href={`/admin/users/${x.userId}`} className="underline">{x.user.displayName}</Link></td>
              <td className="p-2">₹{x.amountPaise / 100}</td>
              <td className="p-2">{x.method}</td>
              <td className="p-2">{x.status}{x.failureReason ? ` (${x.failureReason})` : ""}</td>
              <td className="p-2">{x.razorpayOrderId ?? "-"}</td>
              <td className="p-2">{x.razorpayPaymentId ?? "-"}</td>
              <td className="p-2">{x.markedById ? marker.get(x.markedById) ?? x.markedById : "-"}</td>
              <td className="p-2">{dt(x.createdAt)}</td>
              <td className="p-2">{dt(x.paidAt)}</td>
            </tr>
          ))}
          {payments.length === 0 && <tr><td className="p-2" colSpan={9}>No payments</td></tr>}
        </tbody>
      </table>
      <div className="mt-4 flex gap-4">
        {p > 1 && <Link href={href(p - 1)} className="underline">Previous</Link>}
        {p * PAGE < total && <Link href={href(p + 1)} className="underline">Next</Link>}
      </div>
    </div>
  );
}
