import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    return NextResponse.json({
      exists: !!user,
    });
  } catch (error) {
    console.error("Error checking phone:", error);
    return NextResponse.json(
      { error: "Failed to check phone number" },
      { status: 500 },
    );
  }
}
