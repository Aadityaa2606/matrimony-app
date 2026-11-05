import Link from "next/link";
import prisma from "@/lib/db";
import { requireStaff } from "@/lib/staff";
import { PageHeader, Table, fmtDate } from "@/app/admin/_components/ui";

export const metadata = { title: "Blocks" };

export default async function Blocks() {
  await requireStaff("view");
  const [blocks, counts] = await Promise.all([
    prisma.block.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.block.groupBy({ by: ["blockedId"], _count: { _all: true }, orderBy: { _count: { blockedId: "desc" } } }),
  ]);
  const ids = [...new Set([...blocks.flatMap((b) => [b.blockerId, b.blockedId]), ...counts.map((c) => c.blockedId)])];
  const users = await prisma.user.findMany({ where: { id: { in: ids } } });
  const byId = new Map(users.map((u) => [u.id, u.displayName]));
  const who = (id: string) => (
    <Link href={`/admin/users/${id}`} className="font-medium hover:underline">{byId.get(id) ?? id}</Link>
  );
  const count = new Map(counts.map((c) => [c.blockedId, c._count._all]));
  const sorted = [...blocks].sort((a, b) => (count.get(b.blockedId) ?? 0) - (count.get(a.blockedId) ?? 0));
  return (
    <div>
      <PageHeader title="Blocks" sub="Members blocked most often are listed first." />
      <Table head={["Blocked member", "Times blocked", "Blocked by", "Date"]} empty={blocks.length === 0 && "No blocks"}>
        {sorted.map((b) => {
          const n = count.get(b.blockedId) ?? 0;
          return (
            <tr key={b.id}>
              <td>{who(b.blockedId)}</td>
              <td>
                <span className={`inline-flex min-w-7 justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${n >= 3 ? "bg-rose-50 text-rose-700" : "bg-zinc-100 text-zinc-700"}`}>{n}</span>
              </td>
              <td>{who(b.blockerId)}</td>
              <td className="whitespace-nowrap text-zinc-600">{fmtDate(b.createdAt)}</td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}
