import Link from "next/link";
import type { Prisma, UserStatus } from "@prisma/client";
import prisma from "@/lib/db";
import { requireStaff } from "@/lib/staff";
import { effectiveStatus } from "@/lib/lifecycle";

const PAGE = 50;
const STATUSES = ["PENDING_PAYMENT", "PENDING_PROFILE", "PENDING_REVIEW", "ACTIVE", "EXPIRED", "REJECTED", "SUSPENDED"];

export default async function Users({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireStaff("view");
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
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (p - 1) * PAGE, take: PAGE }),
  ]);
  const href = (n: number) => `/admin/users?${new URLSearchParams({ q, status, page: String(n) })}`;
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Users ({total})</h1>
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Name or phone" className="rounded border p-1" />
        <select name="status" defaultValue={status} className="rounded border p-1">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="rounded border px-3">Search</button>
      </form>
      <table className="w-full border text-left">
        <thead><tr className="border-b"><th className="p-2">Name</th><th className="p-2">Phone</th><th className="p-2">Status</th><th className="p-2">Expires</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2"><Link href={`/admin/users/${u.id}`} className="underline">{u.displayName}</Link></td>
              <td className="p-2">{u.phoneNumber}</td>
              <td className="p-2">{effectiveStatus(u, now)}</td>
              <td className="p-2">{u.expiresAt?.toLocaleDateString("en-IN") ?? "-"}</td>
            </tr>
          ))}
          {users.length === 0 && <tr><td className="p-2" colSpan={4}>No users found</td></tr>}
        </tbody>
      </table>
      <div className="mt-4 flex gap-4">
        {p > 1 && <Link href={href(p - 1)} className="underline">Previous</Link>}
        {p * PAGE < total && <Link href={href(p + 1)} className="underline">Next</Link>}
      </div>
    </div>
  );
}
