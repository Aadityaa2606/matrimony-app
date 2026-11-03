import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { activeMemberWhere, requireActiveMember } from "@/lib/member";
import { blockedUserIds } from "@/lib/blocks";
import { ageOn } from "@/lib/matching";

// GET /api/favorites - List user's favorite profiles
export async function GET() {
  try {
    const m = await requireActiveMember();
    if (m instanceof NextResponse) return m;

    const favorites = await prisma.favorite.findMany({
      where: { userId: m.id },
      orderBy: { createdAt: "desc" },
    });

    // Get the profile details for each favorite
    const profileIds = favorites.map((f) => f.profileId);
    const now = new Date();
    const blocked = await blockedUserIds(m.id);
    const profiles = await prisma.profile.findMany({
      where: {
        id: { in: profileIds },
        user: activeMemberWhere(now),
        userId: { notIn: blocked },
      },
      include: { user: { select: { displayName: true } } },
    });

    const favoriteProfiles = profiles
      .map((p) => {
        const age = ageOn(p.dateOfBirth, now);

        return {
          id: p.id,
          userId: p.userId,
          fullName: p.fullName,
          displayName: p.user.displayName,
          age,
          gender: p.gender,
          height: p.height,
          location: p.location,
          profession: p.profession,
          education: p.education,
          community: p.community,
          profilePhoto: p.profilePhoto,
        };
      });

    return NextResponse.json({ profiles: favoriteProfiles });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 },
    );
  }
}

// POST /api/favorites - Add profile to favorites
export async function POST(request: NextRequest) {
  try {
    const m = await requireActiveMember();
    if (m instanceof NextResponse) return m;

    const { profileId } = await request.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 },
      );
    }

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Add to favorites (upsert to handle duplicates)
    await prisma.favorite.upsert({
      where: {
        userId_profileId: {
          userId: m.id,
          profileId,
        },
      },
      create: {
        userId: m.id,
        profileId,
      },
      update: {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 },
    );
  }
}

// DELETE /api/favorites - Remove profile from favorites
export async function DELETE(request: NextRequest) {
  try {
    const m = await requireActiveMember();
    if (m instanceof NextResponse) return m;

    const { profileId } = await request.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 },
      );
    }

    await prisma.favorite.delete({
      where: {
        userId_profileId: {
          userId: m.id,
          profileId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 },
    );
  }
}
