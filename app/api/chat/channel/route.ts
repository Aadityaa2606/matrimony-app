import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { activeMemberWhere, requireActiveMember } from "@/lib/member";
import { blockedUserIds } from "@/lib/blocks";
import { channelIdFor } from "@/lib/chat-rules";
import { streamServer } from "@/lib/stream";

export async function POST(req: NextRequest) {
  const m = await requireActiveMember();
  if (m instanceof NextResponse) return m;
  try {
    const body = await req.json().catch(() => null);
    const otherUserId = body?.otherUserId;
    if (typeof otherUserId !== "string" || !otherUserId) {
      return NextResponse.json({ error: "otherUserId is required" }, { status: 400 });
    }

    const other = await prisma.user.findFirst({
      where: { id: otherUserId, ...activeMemberWhere(new Date()) },
      include: { profile: true },
    });
    const g = other?.profile?.gender;
    if (!other || !g || !m.gender || g === m.gender || otherUserId === m.id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if ((await blockedUserIds(m.id)).includes(otherUserId)) {
      return NextResponse.json({ error: "blocked" }, { status: 403 });
    }

    const client = streamServer();
    await client.upsertUsers([
      { id: m.id, name: m.displayName, image: m.profile?.profilePhoto || undefined },
      { id: other.id, name: other.displayName, image: other.profile?.profilePhoto || undefined },
    ]);
    const channelId = channelIdFor(m.id, other.id);
    await client.channel("messaging", channelId, { members: [m.id, other.id], created_by_id: m.id }).create();
    return NextResponse.json({ channelId });
  } catch (error) {
    console.error("Error creating chat channel:", error);
    return NextResponse.json({ error: "Failed to create chat channel" }, { status: 500 });
  }
}
