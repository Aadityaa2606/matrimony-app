import { NextResponse } from "next/server";
import type { Gender, Prisma, Profile } from "@prisma/client";
import { auth } from "@/lib/auth";
import { sessionKind } from "@/lib/permissions";
import prisma from "@/lib/db";
import { effectiveStatus, type EffectiveStatus } from "@/lib/lifecycle";

export type Member = {
  id: string;
  status: EffectiveStatus;
  expiresAt: Date | null;
  gender: Gender | null;
  profile: Profile | null;
  displayName: string;
};

export async function getMember(): Promise<Member | null> {
  const session = await auth();
  if (sessionKind(session) !== "member" || !session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    status: effectiveStatus(user, new Date()),
    expiresAt: user.expiresAt,
    gender: user.profile?.gender ?? null,
    profile: user.profile,
    displayName: user.displayName,
  };
}

export async function requireActiveMember(): Promise<Member | NextResponse> {
  const m = await getMember();
  if (!m) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (m.status !== "ACTIVE") {
    return NextResponse.json({ error: "inactive", status: m.status }, { status: 403 });
  }
  return m;
}

export const activeMemberWhere = (now: Date): Prisma.UserWhereInput => ({
  status: "ACTIVE",
  expiresAt: { gt: now },
});
