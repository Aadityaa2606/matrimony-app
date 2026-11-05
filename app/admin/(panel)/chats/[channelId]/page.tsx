import Link from "next/link";
import { requireStaff } from "@/lib/staff";
import { can } from "@/lib/permissions";
import { streamServer } from "@/lib/stream";
import { deleteChatMessage } from "@/app/admin/actions";
import ActionForm from "@/app/admin/_components/ActionForm";
import { Empty, Icon, card, fmtDateTime } from "@/app/admin/_components/ui";

export const metadata = { title: "Chat" };

export default async function Chat({ params }: { params: Promise<{ channelId: string }> }) {
  const staff = await requireStaff("view");
  const { channelId } = await params;
  const canDelete = can(staff.role, "moderate");
  const res = await streamServer().channel("messaging", channelId).query({ messages: { limit: 300 } }).catch(() => null);
  const back = (
    <Link href="/admin/chats" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
      <Icon name="left" /> Chats
    </Link>
  );
  if (!res) return <div>{back}<div className={card}><Empty text="Chat not found" /></div></div>;
  const first = res.members[0]?.user_id;
  const names = res.members.map((m) => m.user?.name ?? m.user_id).join(" & ");
  return (
    <div className="max-w-3xl">
      {back}
      <div className={`${card} overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-5 py-4">
          <h1 className="font-semibold">{names}</h1>
          <span className="text-xs text-zinc-500">{res.messages.length} messages</span>
        </div>
        {res.messages.length === 0 ? (
          <Empty text="No messages" />
        ) : (
          <ul className="flex flex-col gap-3 bg-zinc-50/60 p-4 sm:p-5">
            {res.messages.map((m) => {
              const left = m.user?.id === first;
              return (
                <li key={m.id} className={`group flex max-w-[85%] flex-col gap-1 ${left ? "self-start" : "items-end self-end"}`}>
                  <span className="px-1 text-xs text-zinc-500">
                    {m.user?.name ?? m.user?.id} · {m.created_at ? fmtDateTime(new Date(m.created_at)) : ""}
                  </span>
                  <div className={`rounded-2xl px-3.5 py-2 text-sm ${left ? "rounded-tl-sm bg-white ring-1 ring-zinc-200" : "rounded-tr-sm bg-zinc-900 text-white"}`}>
                    {m.type === "deleted" ? <p className="italic opacity-60">removed by admin</p> : <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                  </div>
                  {canDelete && m.type !== "deleted" && (
                    <ActionForm action={deleteChatMessage.bind(null, m.id, channelId)} confirm="Delete this message for both members?" danger success="Message deleted">
                      <button className="px-1 text-xs font-medium text-rose-600 hover:underline">Delete</button>
                    </ActionForm>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
