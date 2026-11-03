import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { activeMemberWhere, requireActiveMember } from "@/lib/member";
import { blockedUserIds } from "@/lib/blocks";
import { ageOn } from "@/lib/matching";

// GET /api/profiles/[id] - Get single profile details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const m = await requireActiveMember();
    if (m instanceof NextResponse) return m;

    const { id } = await params;

    const now = new Date();
    const profile = await prisma.profile.findFirst({
      where: { id, user: activeMemberWhere(now) },
      include: { user: { select: { displayName: true } } },
    });

    if (
      !profile ||
      profile.gender === m.gender ||
      (await blockedUserIds(m.id)).includes(profile.userId)
    ) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const age = ageOn(profile.dateOfBirth, now);

    // Check if this profile is favorited by the current user
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_profileId: {
          userId: m.id,
          profileId: id,
        },
      },
    });

    return NextResponse.json({
      profile: {
        id: profile.id,
        userId: profile.userId,
        fullName: profile.fullName,
        displayName: profile.user.displayName,
        age,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        height: profile.height,
        location: profile.location,
        profession: profile.profession,
        education: profile.education,
        salary: profile.salary,
        community: profile.community,
        subCaste: profile.subCaste,
        hasHoroscope: profile.hasHoroscope,
        parentContact: profile.parentContact,
        profilePhoto: profile.profilePhoto,
        additionalPhotos: profile.additionalPhotos,
      },
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}
