import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getMember } from "@/lib/member";
import { parseProfileInput, saveProfile } from "@/lib/profile";

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
      { status: 500 },
    );
  }
}

// POST - Create or update profile
export async function POST(req: NextRequest) {
  try {
    const m = await getMember();
    if (!m) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!["PENDING_PROFILE", "PENDING_REVIEW", "ACTIVE"].includes(m.status)) {
      return NextResponse.json({ error: "inactive" }, { status: 403 });
    }

    const parsed = parseProfileInput(await req.json().catch(() => null), new Date());
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    await saveProfile(m.id, parsed.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
