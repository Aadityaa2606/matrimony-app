import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireActiveMember } from "@/lib/member";

export async function GET() {
  const m = await requireActiveMember();
  if (m instanceof NextResponse) return m;
  const rows = await prisma.block.findMany({ where: { blockerId: m.id }, orderBy: { createdAt: "desc" } });
  const users = await prisma.user.findMany({
    where: { id: { in: rows.map((b) => b.blockedId) } },
    select: { id: true, displayName: true, profile: { select: { profilePhoto: true } } },
  });
  const byId = new Map(users.map((u) => [u.id, u]));
  return NextResponse.json(
    rows.map((b) => {
      const u = byId.get(b.blockedId);
      return { userId: b.blockedId, name: u?.displayName ?? "", photo: u?.profile?.profilePhoto ?? null };
    }),
  );
}

async function targetId(req: NextRequest, myId: string): Promise<string | null> {
  const body = await req.json().catch(() => null);
  const id = body?.userId;
  return typeof id === "string" && id && id !== myId ? id : null;
}

export async function POST(req: NextRequest) {
  const m = await requireActiveMember();
  if (m instanceof NextResponse) return m;
  const userId = await targetId(req, m.id);
  if (!userId) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (!(await prisma.user.findUnique({ where: { id: userId }, select: { id: true } }))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: m.id, blockedId: userId } },
    create: { blockerId: m.id, blockedId: userId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const m = await requireActiveMember();
  if (m instanceof NextResponse) return m;
  const userId = await targetId(req, m.id);
  if (!userId) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  await prisma.block.deleteMany({ where: { blockerId: m.id, blockedId: userId } });
  return NextResponse.json({ ok: true });
}
