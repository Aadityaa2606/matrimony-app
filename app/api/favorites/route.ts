import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET /api/favorites - List user's favorite profiles
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Get the profile details for each favorite
    const profileIds = favorites.map((f) => f.profileId);
    const profiles = await prisma.profile.findMany({
      where: {
        id: { in: profileIds },
      },
      include: {
        user: {
          select: {
            displayName: true,
            status: true,
          },
        },
      },
    });

    // Filter only active users and calculate age
    const favoriteProfiles = profiles
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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
          userId: session.user.id,
          profileId,
        },
      },
      create: {
        userId: session.user.id,
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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
          userId: session.user.id,
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
