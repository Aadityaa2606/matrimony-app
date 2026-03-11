import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET /api/profiles/[id] - Get single profile details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            displayName: true,
            status: true,
          },
        },
      },
    });

    if (!profile || profile.user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Calculate age
    const birthDate = new Date(profile.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Check if this profile is favorited by the current user
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_profileId: {
          userId: session.user.id,
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
