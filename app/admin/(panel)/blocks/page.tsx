import prisma from "@/lib/db";
import { requireStaff } from "@/lib/staff";

export default async function Blocks() {
  await requireStaff("view");
  const [blocks, counts] = await Promise.all([
    prisma.block.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.block.groupBy({ by: ["blockedId"], _count: { _all: true }, orderBy: { _count: { blockedId: "desc" } } }),
  ]);
  const ids = [...new Set([...blocks.flatMap((b) => [b.blockerId, b.blockedId]), ...counts.map((c) => c.blockedId)])];
  const users = await prisma.user.findMany({ where: { id: { in: ids } } });
  const name = (id: string) => users.find((u) => u.id === id)?.displayName ?? id;
  const count = new Map(counts.map((c) => [c.blockedId, c._count._all]));
  const sorted = [...blocks].sort((a, b) => (count.get(b.blockedId) ?? 0) - (count.get(a.blockedId) ?? 0));
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Blocks ({blocks.length})</h1>
      <table className="w-full border text-left">
        <thead><tr className="border-b"><th className="p-2">Blocker</th><th className="p-2">Blocked</th><th className="p-2">Times blocked</th><th className="p-2">Date</th></tr></thead>
        <tbody>
          {sorted.map((b) => (
            <tr key={b.id} className="border-b">
              <td className="p-2">{name(b.blockerId)}</td>
              <td className="p-2">{name(b.blockedId)}</td>
              <td className="p-2">{count.get(b.blockedId)}</td>
              <td className="p-2">{b.createdAt.toLocaleDateString("en-IN")}</td>
            </tr>
          ))}
          {blocks.length === 0 && <tr><td className="p-2" colSpan={4}>No blocks</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
