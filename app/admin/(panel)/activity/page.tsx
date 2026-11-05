import Link from "next/link";
import prisma from "@/lib/db";
import { requireStaff } from "@/lib/staff";
import { PageHeader, Table, btn, fmtDateTime, input } from "@/app/admin/_components/ui";

export const metadata = { title: "Activity" };

// "approveUser" -> "Approve user"
const human = (a: string) => a.replace(/([A-Z])/g, " $1").toLowerCase().replace(/^./, (c) => c.toUpperCase());

export default async function Activity({ searchParams }: { searchParams: Promise<{ staff?: string; action?: string }> }) {
  await requireStaff("view_logs");
  const { staff = "", action = "" } = await searchParams;
  const [logs, staffList, actions] = await Promise.all([
    prisma.activityLog.findMany({
      where: { ...(staff && { staffId: staff }), ...(action && { action }) },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.staff.findMany({ orderBy: { username: "asc" } }),
    prisma.activityLog.findMany({ distinct: ["action"], select: { action: true }, orderBy: { action: "asc" } }),
  ]);
  const staffName = new Map(staffList.map((s) => [s.id, s.username]));
  const targetIds = [...new Set(logs.flatMap((l) => (l.targetUserId ? [l.targetUserId] : [])))];
  const users = await prisma.user.findMany({ where: { id: { in: targetIds } }, select: { id: true, displayName: true } });
  const userName = new Map(users.map((u) => [u.id, u.displayName]));
  return (
    <div>
      <PageHeader title="Activity" sub="Latest 200 staff actions." />
      <form className="mb-4 flex flex-wrap gap-2">
        <select name="staff" defaultValue={staff} className={`${input} w-auto`}>
          <option value="">All staff</option>
          {staffList.map((s) => <option key={s.id} value={s.id}>{s.username}</option>)}
        </select>
        <select name="action" defaultValue={action} className={`${input} w-auto`}>
          <option value="">All actions</option>
          {actions.map((a) => <option key={a.action} value={a.action}>{human(a.action)}</option>)}
        </select>
        <button className={btn.secondary}>Filter</button>
        {(staff || action) && <Link href="/admin/activity" className={btn.ghost}>Clear</Link>}
      </form>
      <Table head={["When", "Staff", "Action", "Member", "Details"]} empty={logs.length === 0 && "No activity"}>
        {logs.map((l) => (
          <tr key={l.id} className="align-top">
            <td className="whitespace-nowrap text-zinc-600">{fmtDateTime(l.createdAt)}</td>
            <td className="font-medium">{staffName.get(l.staffId) ?? l.staffId}</td>
            <td className="whitespace-nowrap">{human(l.action)}</td>
            <td>
              {l.targetUserId ? (
                <Link href={`/admin/users/${l.targetUserId}`} className="hover:underline">{userName.get(l.targetUserId) ?? l.targetUserId}</Link>
              ) : "—"}
            </td>
            <td className="max-w-sm break-all font-mono text-xs text-zinc-500">{l.details ? JSON.stringify(l.details) : "—"}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
