import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { activeMemberWhere, requireActiveMember } from "@/lib/member";
import { blockedUserIds } from "@/lib/blocks";
import { ageOn, rankMatches } from "@/lib/matching";

// GET /api/profiles - Opposite-gender active profiles, ranked, minus favorites/dismissed/blocked
export async function GET() {
  try {
    const m = await requireActiveMember();
    if (m instanceof NextResponse) return m;
    if (!m.profile) return NextResponse.json({ profiles: [] });

    const now = new Date();
    const userId = m.id;
    const [favorites, dismissed, blocked] = await Promise.all([
      prisma.favorite.findMany({ where: { userId }, select: { profileId: true } }),
      prisma.dismissed.findMany({ where: { userId }, select: { profileId: true } }),
      blockedUserIds(userId),
    ]);
    const excludeProfileIds = [
      ...favorites.map((f) => f.profileId),
      ...dismissed.map((d) => d.profileId),
    ];

    const profiles = await prisma.profile.findMany({
      where: {
        user: activeMemberWhere(now),
        gender: m.profile.gender === "BRIDE" ? "GROOM" : "BRIDE",
        userId: { notIn: [userId, ...blocked] },
        id: { notIn: excludeProfileIds },
      },
      include: { user: { select: { displayName: true } } },
    });

    // ponytail: ranks in memory; fine to ~10k actives, move score into SQL beyond that
    const ranked = rankMatches(m.profile, profiles, now).map((p) => ({
      id: p.id,
      userId: p.userId,
      fullName: p.fullName,
      displayName: p.user.displayName,
      age: ageOn(p.dateOfBirth, now),
      gender: p.gender,
      height: p.height,
      location: p.location,
      profession: p.profession,
      education: p.education,
      community: p.community,
      profilePhoto: p.profilePhoto,
    }));

    return NextResponse.json({ profiles: ranked });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}
