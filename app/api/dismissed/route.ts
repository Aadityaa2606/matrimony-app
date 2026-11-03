import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireActiveMember } from "@/lib/member";

// POST /api/dismissed - Mark profile as dismissed/skipped
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

    // Add to dismissed (upsert to handle duplicates)
    await prisma.dismissed.upsert({
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
    console.error("Error dismissing profile:", error);
    return NextResponse.json(
      { error: "Failed to dismiss profile" },
      { status: 500 },
    );
  }
}
