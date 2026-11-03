import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireActiveMember } from "@/lib/member";
import { checkSend } from "@/lib/chat-rules";
import { chatAccess } from "@/lib/chat-access";

export async function GET(req: NextRequest) {
  const m = await requireActiveMember();
  if (m instanceof NextResponse) return m;

  const channelId = req.nextUrl.searchParams.get("channelId");
  const access = channelId ? await chatAccess(m.id, channelId) : null;
  if (!channelId || !access) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  let reason: string | null = access.block;
  if (!reason) {
    const t = (await prisma.chatThread.findUnique({ where: { channelId } })) ?? {
      starterId: null,
      starterCount: 0,
      unlocked: false,
    };
    const r = checkSend(t, m.id);
    if (!r.ok) reason = r.reason;
  }
  return NextResponse.json({
    canSend: reason === null,
    reason,
    otherUserId: access.otherId,
    iBlocked: access.iBlocked,
  });
}
