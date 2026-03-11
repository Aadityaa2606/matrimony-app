import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET /api/profiles - List all profiles except current user, favorites, and dismissed
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get IDs of favorited and dismissed profiles
    const [favorites, dismissed] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        select: { profileId: true },
      }),
      prisma.dismissed.findMany({
        where: { userId },
        select: { profileId: true },
      }),
    ]);

    const excludeProfileIds = [
      ...favorites.map((f) => f.profileId),
      ...dismissed.map((d) => d.profileId),
    ];

    // Get all profiles except current user and excluded ones
    const profiles = await prisma.profile.findMany({
      where: {
        userId: { not: userId },
        id: { notIn: excludeProfileIds },
      },
      include: {
        user: {
          select: {
            displayName: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter only active users and calculate age
    const activeProfiles = profiles
      .filter((p) => p.user.status === "ACTIVE")
      .map((p) => {
        const birthDate = new Date(p.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

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

    return NextResponse.json({ profiles: activeProfiles });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 },
    );
  }
}
