import Link from "next/link";
import prisma from "@/lib/db";
import { requireStaff } from "@/lib/staff";
import { streamServer } from "@/lib/stream";
import { Avatar, Empty, Icon, PageHeader, SearchBox, Table, card, fmtDateTime } from "@/app/admin/_components/ui";

export const metadata = { title: "Chats" };

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
      <PageHeader title="Chats" sub="Find a member to read their conversations." />
      <SearchBox q={q} placeholder="Search name or phone" />
      {term && (
        <div className={`${card} mb-6 overflow-hidden`}>
          {found.length === 0 ? (
            <Empty text={`No members match “${term}”`} />
          ) : (
            <ul className="divide-y divide-zinc-100">
              {found.map((u) => (
                <li key={u.id}>
                  <Link
                    href={`/admin/chats?${new URLSearchParams({ userId: u.id, q })}`}
                    className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-zinc-50 ${u.id === userId ? "bg-zinc-50" : ""}`}
                  >
                    <Avatar name={u.displayName} />
                    <span className="flex-1">
                      <span className="block font-medium">{u.displayName}</span>
                      <span className="block text-xs text-zinc-500">{u.phoneNumber}</span>
                    </span>
                    {u.id === userId ? <Icon name="check" className="size-4 text-emerald-600" /> : <Icon name="right" className="size-4 text-zinc-400" />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {userId && (
        <>
          <h2 className="mb-3 text-sm font-semibold">Conversations of {owner?.displayName ?? userId}</h2>
          <Table head={["With", "Last message", "Time"]} empty={rows.length === 0 && "No conversations yet"}>
            {rows.map((r) => {
              const o = byId.get(r.otherId);
              return (
                <tr key={r.id}>
                  <td>
                    <Link href={`/admin/chats/${r.id}`} className="flex items-center gap-3">
                      <Avatar name={o?.displayName ?? "?"} />
                      <span>
                        <span className="block font-medium hover:underline">{o?.displayName ?? r.otherId}</span>
                        <span className="block text-xs text-zinc-500">{o?.phoneNumber}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="max-w-xs truncate text-zinc-600">{r.last?.type === "deleted" ? <i>removed by admin</i> : r.last?.text ?? "—"}</td>
                  <td className="whitespace-nowrap text-zinc-600">{r.at ? fmtDateTime(new Date(r.at)) : "—"}</td>
                </tr>
              );
            })}
          </Table>
        </>
      )}
    </div>
  );
}
