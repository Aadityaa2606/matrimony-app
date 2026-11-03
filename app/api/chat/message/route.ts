import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireActiveMember } from "@/lib/member";
import { checkSend, type ThreadState } from "@/lib/chat-rules";
import { chatAccess } from "@/lib/chat-access";
import { streamServer } from "@/lib/stream";
import { logError } from "@/lib/errors";

const bad = () => NextResponse.json({ error: "bad_request" }, { status: 400 });

export async function POST(req: NextRequest) {
  const m = await requireActiveMember();
  if (m instanceof NextResponse) return m;

  const body = await req.json().catch(() => null);
  const channelId = body?.channelId;
  if (typeof channelId !== "string" || !channelId) return bad();
  const access = await chatAccess(m.id, channelId);
  if (!access) return bad();
  if (access.block) return NextResponse.json({ error: access.block }, { status: 403 });

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (text.length < 1 || text.length > 2000) return bad();

  const old: ThreadState = (await prisma.chatThread.findUnique({ where: { channelId } })) ?? {
    starterId: null,
    starterCount: 0,
    unlocked: false,
  };
  const r = checkSend(old, m.id);
  if (!r.ok) return NextResponse.json({ error: r.reason }, { status: 403 });

  // Optimistic lock: the where clause matches the state we read.
  await prisma.chatThread.upsert({ where: { channelId }, create: { channelId }, update: {} });
  const { count } = await prisma.chatThread.updateMany({
    where: { channelId, starterCount: old.starterCount, unlocked: old.unlocked, starterId: old.starterId },
    data: r.next,
  });
  if (count === 0) return NextResponse.json({ error: "retry" }, { status: 409 });

  try {
    await streamServer().channel("messaging", channelId).sendMessage({ text, user_id: m.id });
  } catch (err) {
    await prisma.chatThread.updateMany({
      where: { channelId, ...r.next },
      data: old,
    });
    await logError("chat.send", err, { channelId, userId: m.id });
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
