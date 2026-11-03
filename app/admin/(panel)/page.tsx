import Link from "next/link";
import prisma from "@/lib/db";
import { activeMemberWhere } from "@/lib/member";
import { requireStaff } from "@/lib/staff";

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const staff = await requireStaff("view");
  const { denied } = await searchParams;
  const now = new Date();
  const in7 = new Date(+now + 7 * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [waitlist, active, expiring, expired, rejected, suspended, paid] = await Promise.all([
    prisma.user.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.user.count({ where: activeMemberWhere(now) }),
    prisma.user.count({ where: { status: "ACTIVE", expiresAt: { gt: now, lte: in7 } } }),
    prisma.user.count({ where: { status: "ACTIVE", expiresAt: { lte: now } } }),
    prisma.user.count({ where: { status: "REJECTED" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: monthStart } },
      _count: true,
      _sum: { amountPaise: true },
    }),
  ]);
  const rows: [string, string | number, string?][] = [
    ["Waitlist", waitlist, "/admin/waitlist"],
    ["Active members", active, "/admin/users?status=ACTIVE"],
    ["Expiring within 7 days", expiring],
    ["Expired", expired, "/admin/users?status=EXPIRED"],
    ["Rejected", rejected, "/admin/users?status=REJECTED"],
    ["Suspended", suspended, "/admin/users?status=SUSPENDED"],
    ["Payments this month", paid._count],
    ["Collected this month", `₹${((paid._sum.amountPaise ?? 0) / 100).toLocaleString("en-IN")}`],
  ];
  return (
    <div>
      {denied === "1" && <p className="mb-4 text-red-600">You don&apos;t have access to that page</p>}
      <h1 className="mb-4 text-xl font-semibold">Welcome, {staff.username}</h1>
      <table className="border">
        <tbody>
          {rows.map(([label, n, href]) => (
            <tr key={label} className="border-b">
              <td className="p-2">{href ? <Link href={href} className="underline">{label}</Link> : label}</td>
              <td className="p-2 font-medium">{n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
