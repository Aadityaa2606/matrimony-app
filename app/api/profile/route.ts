import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch current user's profile
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: user.status,
      profile: user.profile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create or update profile
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      gender,
      dateOfBirth,
      height,
      education,
      profession,
      salary,
      location,
      community,
      subCaste,
      hasHoroscope,
      parentContact,
      profilePhoto,
      additionalPhotos,
    } = body;

    // Validate required fields
    if (
      !fullName ||
      !gender ||
      !dateOfBirth ||
      !height ||
      !education ||
      !profession ||
      !location ||
      !community ||
      hasHoroscope === undefined ||
      !parentContact ||
      !profilePhoto
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate gender
    if (!["BRIDE", "GROOM"].includes(gender)) {
      return NextResponse.json(
        { error: "Gender must be BRIDE or GROOM" },
        { status: 400 }
      );
    }

    // Create or update profile
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        fullName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        height,
        education,
        profession,
        salary: salary || null,
        location,
        community,
        subCaste: subCaste || null,
        hasHoroscope,
        parentContact,
        profilePhoto,
        additionalPhotos: additionalPhotos || [],
      },
      create: {
        userId: session.user.id,
        fullName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        height,
        education,
        profession,
        salary: salary || null,
        location,
        community,
        subCaste: subCaste || null,
        hasHoroscope,
        parentContact,
        profilePhoto,
        additionalPhotos: additionalPhotos || [],
      },
    });

    // Update user status to PENDING_PAYMENT
    await prisma.user.update({
      where: { id: session.user.id },
      data: { status: "PENDING_PAYMENT" },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
