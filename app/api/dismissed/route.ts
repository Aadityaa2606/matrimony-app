import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// POST /api/dismissed - Mark profile as dismissed/skipped
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

    // Add to dismissed (upsert to handle duplicates)
    await prisma.dismissed.upsert({
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
    console.error("Error dismissing profile:", error);
    return NextResponse.json(
      { error: "Failed to dismiss profile" },
      { status: 500 },
    );
  }
}
