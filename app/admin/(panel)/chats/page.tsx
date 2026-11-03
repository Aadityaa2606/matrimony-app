import Link from "next/link";
import prisma from "@/lib/db";
import { requireStaff } from "@/lib/staff";
import { streamServer } from "@/lib/stream";

export default async function Chats({ searchParams }: { searchParams: Promise<{ userId?: string; q?: string }> }) {
  await requireStaff("view");
  const { userId = "", q = "" } = await searchParams;
  const term = q.trim();
  const digits = term.replace(/\D/g, "");
  const found = term
    ? await prisma.user.findMany({
        where: { OR: [{ displayName: { contains: term, mode: "insensitive" } }, ...(digits ? [{ phoneNumber: { contains: digits } }] : [])] },
        take: 20,
      })
    : [];
  const channels = userId
    ? await streamServer().queryChannels({ type: "messaging", members: { $in: [userId] } }, { last_message_at: -1 }, { limit: 50 })
    : [];
  const rows = channels.map((c) => ({ id: c.id!, otherId: Object.keys(c.state.members).find((m) => m !== userId) ?? "", last: c.state.messages.at(-1), at: c.data?.last_message_at }));
  const others = await prisma.user.findMany({ where: { id: { in: rows.map((r) => r.otherId) } } });
  const byId = new Map(others.map((u) => [u.id, u]));
  const owner = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Chats</h1>
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Name or phone" className="rounded border p-1" />
        <button className="rounded border px-3">Search</button>
      </form>
      {found.length > 0 && (
        <ul className="mb-4">
          {found.map((u) => (
            <li key={u.id}><Link href={`/admin/chats?userId=${u.id}`} className="underline">{u.displayName}</Link> {u.phoneNumber}</li>
          ))}
        </ul>
      )}
      {userId && (
        <>
          <h2 className="mb-2 font-semibold">Chats of {owner?.displayName ?? userId}</h2>
          <table className="w-full border text-left">
            <thead><tr className="border-b"><th className="p-2">With</th><th className="p-2">Phone</th><th className="p-2">Last message</th><th className="p-2">Time</th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const o = byId.get(r.otherId);
                return (
                  <tr key={r.id} className="border-b">
                    <td className="p-2"><Link href={`/admin/chats/${r.id}`} className="underline">{o?.displayName ?? r.otherId}</Link></td>
                    <td className="p-2">{o?.phoneNumber ?? "-"}</td>
                    <td className="p-2">{r.last?.type === "deleted" ? <i>removed by admin</i> : r.last?.text ?? "-"}</td>
                    <td className="p-2">{r.at ? new Date(r.at).toLocaleString("en-IN") : "-"}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td className="p-2" colSpan={4}>No chats</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
