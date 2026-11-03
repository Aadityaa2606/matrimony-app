import Link from "next/link";
import { requireStaff } from "@/lib/staff";
import { can } from "@/lib/permissions";
import { streamServer } from "@/lib/stream";
import { deleteChatMessage } from "@/app/admin/actions";
import ActionForm from "@/app/admin/_components/ActionForm";

export default async function Chat({ params }: { params: Promise<{ channelId: string }> }) {
  const staff = await requireStaff("view");
  const { channelId } = await params;
  const canDelete = can(staff.role, "moderate");
  const res = await streamServer().channel("messaging", channelId).query({ messages: { limit: 300 } }).catch(() => null);
  if (!res) return <p>Chat not found. <Link href="/admin/chats" className="underline">Back</Link></p>;
  const names = res.members.map((m) => m.user?.name ?? m.user_id).join(" and ");
  return (
    <div>
      <Link href="/admin/chats" className="underline">Back to chats</Link>
      <h1 className="my-4 text-xl font-semibold">{names}</h1>
      <ul className="space-y-2">
        {res.messages.map((m) => (
          <li key={m.id} className="rounded border p-2">
            <div className="text-gray-600">{m.user?.name ?? m.user?.id} · {m.created_at ? new Date(m.created_at).toLocaleString("en-IN") : ""}</div>
            {m.type === "deleted" ? <p className="italic">removed by admin</p> : <p className="whitespace-pre-wrap">{m.text}</p>}
            {canDelete && m.type !== "deleted" && (
              <ActionForm action={deleteChatMessage.bind(null, m.id, channelId)} confirm="Delete this message?">
                <button className="mt-1 rounded border px-2 text-red-600">Delete</button>
              </ActionForm>
            )}
          </li>
        ))}
        {res.messages.length === 0 && <li>No messages</li>}
      </ul>
    </div>
  );
}
