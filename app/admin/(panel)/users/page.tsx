import Link from "next/link";
import type { Prisma, UserStatus } from "@prisma/client";
import prisma from "@/lib/db";
import { can } from "@/lib/permissions";
import { requireStaff } from "@/lib/staff";
import { effectiveStatus } from "@/lib/lifecycle";
import { Avatar, Badge, Chips, Icon, PageHeader, Pagination, SearchBox, Table, btn, fmtDate, statusLabel } from "@/app/admin/_components/ui";

export const metadata = { title: "Users" };

const PAGE = 50;
const STATUSES = ["PENDING_REVIEW", "ACTIVE", "EXPIRED", "PENDING_PAYMENT", "PENDING_PROFILE", "REJECTED", "SUSPENDED"];

export default async function Users({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const staff = await requireStaff("view");
  const { q = "", status = "", page = "1" } = await searchParams;
  const now = new Date();
  const and: Prisma.UserWhereInput[] = [];
  const term = q.trim();
  if (term) {
    const digits = term.replace(/\D/g, "");
    and.push({ OR: [{ displayName: { contains: term, mode: "insensitive" } }, ...(digits ? [{ phoneNumber: { contains: digits } }] : [])] });
  }
  if (status === "EXPIRED") and.push({ status: "ACTIVE", expiresAt: { lte: now } });
  else if (status === "ACTIVE") and.push({ status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] });
  else if (STATUSES.includes(status)) and.push({ status: status as UserStatus });
  const where = { AND: and };
  const p = Math.max(1, parseInt(page) || 1);
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (p - 1) * PAGE,
      take: PAGE,
      include: { profile: { select: { profilePhoto: true } } },
    }),
  ]);
  const href = (o: { q?: string; status?: string; page?: number }) => {
    const sp = new URLSearchParams();
    const v = { q, status, page: 1, ...o };
    if (v.q) sp.set("q", v.q);
    if (v.status) sp.set("status", v.status);
    if (v.page > 1) sp.set("page", String(v.page));
    return `/admin/users${sp.size ? `?${sp}` : ""}`;
  };
  return (
    <div>
      <PageHeader title="Users" sub={`${total.toLocaleString("en-IN")} ${total === 1 ? "member" : "members"}${status ? ` · ${statusLabel(status)}` : ""}`}>
        {can(staff.role, "moderate") && (
          <Link href="/admin/users/new" className={btn.primary}><Icon name="userPlus" />Create user</Link>
        )}
      </PageHeader>
      <SearchBox q={q} placeholder="Search name or phone" hidden={{ status }} />
      <Chips
        value={status}
        href={(s) => href({ status: s })}
        options={[["", "All"], ...STATUSES.map((s) => [s, statusLabel(s)] as [string, string])]}
      />
      <Table head={["Member", "Status", "Expires", "Joined"]} empty={users.length === 0 && (term ? `No members match “${term}”` : "No members here yet")}>
        {users.map((u) => (
          <tr key={u.id}>
            <td>
              <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3">
                <Avatar name={u.displayName} src={u.profile?.profilePhoto} />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-zinc-900 hover:underline">{u.displayName}</span>
                  <span className="block text-xs text-zinc-500">{u.phoneNumber}</span>
                </span>
              </Link>
            </td>
            <td><Badge status={effectiveStatus(u, now)} /></td>
            <td className="whitespace-nowrap text-zinc-600">{fmtDate(u.expiresAt)}</td>
            <td className="whitespace-nowrap text-zinc-600">{fmtDate(u.createdAt)}</td>
          </tr>
        ))}
      </Table>
      <Pagination page={p} total={total} size={PAGE} href={(n) => href({ page: n })} />
    </div>
  );
}
