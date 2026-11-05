import Link from "next/link";
import prisma from "@/lib/db";
import { activeMemberWhere } from "@/lib/member";
import { requireStaff } from "@/lib/staff";
import { Icon, PageHeader, card, rupees, type IconName } from "@/app/admin/_components/ui";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
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
  const stats: { label: string; value: string | number; href?: string; icon: IconName; tone: string; hint?: string }[] = [
    { label: "Waiting review", value: waitlist, href: "/admin/waitlist", icon: "clock", tone: "bg-amber-50 text-amber-600", hint: waitlist ? "Needs attention" : "All caught up" },
    { label: "Active members", value: active, href: "/admin/users?status=ACTIVE", icon: "users", tone: "bg-emerald-50 text-emerald-600" },
    { label: "Expiring in 7 days", value: expiring, icon: "clock", tone: "bg-orange-50 text-orange-600" },
    { label: "Expired", value: expired, href: "/admin/users?status=EXPIRED", icon: "alert", tone: "bg-zinc-100 text-zinc-600" },
    { label: "Disapproved", value: rejected, href: "/admin/users?status=REJECTED", icon: "x", tone: "bg-rose-50 text-rose-600" },
    { label: "Suspended", value: suspended, href: "/admin/users?status=SUSPENDED", icon: "ban", tone: "bg-rose-50 text-rose-600" },
    { label: "Payments this month", value: paid._count, href: "/admin/payments?status=PAID", icon: "card", tone: "bg-sky-50 text-sky-600" },
    { label: "Collected this month", value: rupees(paid._sum.amountPaise ?? 0), icon: "rupee", tone: "bg-violet-50 text-violet-600" },
  ];
  return (
    <div>
      {denied === "1" && (
        <p role="alert" className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <Icon name="alert" /> You don&apos;t have access to that page.
        </p>
      )}
      <PageHeader
        title={`Welcome back, ${staff.username}`}
        sub={now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long" })}
      >
        {waitlist > 0 && (
          <Link href="/admin/waitlist" className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-3.5 text-sm font-medium text-white hover:bg-zinc-700">
            Review {waitlist} waiting <Icon name="right" />
          </Link>
        )}
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const body = (
            <>
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-zinc-500">{s.label}</span>
                <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${s.tone}`}><Icon name={s.icon} /></span>
              </div>
              <div className="mt-3 text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">{s.value}</div>
              {s.hint && <div className="mt-1 text-xs text-zinc-500">{s.hint}</div>}
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className={`${card} p-4 transition hover:border-zinc-300 hover:shadow-md sm:p-5`}>{body}</Link>
          ) : (
            <div key={s.label} className={`${card} p-4 sm:p-5`}>{body}</div>
          );
        })}
      </div>
    </div>
  );
}
