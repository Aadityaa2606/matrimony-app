import Link from "next/link";
import type { PaymentStatus } from "@prisma/client";
import prisma from "@/lib/db";
import { requireStaff } from "@/lib/staff";
import { Badge, Chips, PageHeader, Pagination, Table, fmtDateTime, rupees, statusLabel } from "@/app/admin/_components/ui";

export const metadata = { title: "Payments" };

const PAGE = 50;
const STATUSES: PaymentStatus[] = ["PAID", "CREATED", "FAILED"];

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
  const href = (o: { status?: string; page?: number }) => {
    const sp = new URLSearchParams();
    const v = { status, page: 1, ...o };
    if (v.status) sp.set("status", v.status);
    if (v.page > 1) sp.set("page", String(v.page));
    return `/admin/payments${sp.size ? `?${sp}` : ""}`;
  };
  return (
    <div>
      <PageHeader title="Payments" sub={`${total.toLocaleString("en-IN")} ${total === 1 ? "payment" : "payments"}`} />
      <Chips value={status} href={(s) => href({ status: s })} options={[["", "All"], ...STATUSES.map((s) => [s, statusLabel(s)] as [string, string])]} />
      <Table head={["Member", "Amount", "Status", "Method", "Created", "Paid", "Reference"]} empty={payments.length === 0 && "No payments"}>
        {payments.map((x) => (
          <tr key={x.id} className="align-top">
            <td><Link href={`/admin/users/${x.userId}`} className="font-medium hover:underline">{x.user.displayName}</Link></td>
            <td className="font-medium tabular-nums">{rupees(x.amountPaise)}</td>
            <td>
              <Badge status={x.status} />
              {x.failureReason && <div className="mt-1 max-w-48 text-xs text-rose-600">{x.failureReason}</div>}
            </td>
            <td className="whitespace-nowrap text-zinc-600">
              {x.method === "MANUAL" ? `Manual${x.markedById ? ` · ${marker.get(x.markedById) ?? "staff"}` : ""}` : "Razorpay"}
            </td>
            <td className="whitespace-nowrap text-zinc-600">{fmtDateTime(x.createdAt)}</td>
            <td className="whitespace-nowrap text-zinc-600">{fmtDateTime(x.paidAt)}</td>
            <td className="font-mono text-xs text-zinc-500">
              {x.razorpayOrderId && <div>{x.razorpayOrderId}</div>}
              {x.razorpayPaymentId && <div>{x.razorpayPaymentId}</div>}
              {!x.razorpayOrderId && !x.razorpayPaymentId && "—"}
            </td>
          </tr>
        ))}
      </Table>
      <Pagination page={p} total={total} size={PAGE} href={(n) => href({ page: n })} />
    </div>
  );
}
