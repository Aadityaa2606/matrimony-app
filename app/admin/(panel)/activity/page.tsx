import prisma from "@/lib/db";
import { requireStaff } from "@/lib/staff";

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
      <h1 className="mb-4 text-xl font-semibold">Activity (latest 200)</h1>
      <form className="mb-4 flex gap-2">
        <select name="staff" defaultValue={staff} className="rounded border p-1">
          <option value="">All staff</option>
          {staffList.map((s) => <option key={s.id} value={s.id}>{s.username}</option>)}
        </select>
        <select name="action" defaultValue={action} className="rounded border p-1">
          <option value="">All actions</option>
          {actions.map((a) => <option key={a.action}>{a.action}</option>)}
        </select>
        <button className="rounded border px-3">Filter</button>
      </form>
      <table className="w-full border text-left">
        <thead><tr className="border-b"><th className="p-2">When</th><th className="p-2">Staff</th><th className="p-2">Action</th><th className="p-2">Member</th><th className="p-2">Details</th></tr></thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-b align-top">
              <td className="p-2">{l.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
              <td className="p-2">{staffName.get(l.staffId) ?? l.staffId}</td>
              <td className="p-2">{l.action}</td>
              <td className="p-2">{l.targetUserId ? userName.get(l.targetUserId) ?? l.targetUserId : "-"}</td>
              <td className="p-2 font-mono text-sm">{l.details ? JSON.stringify(l.details) : "-"}</td>
            </tr>
          ))}
          {logs.length === 0 && <tr><td className="p-2" colSpan={5}>No activity</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
