import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { verificationToken, password, displayName } = await request.json();

    if (!verificationToken || !password || !displayName) {
      return NextResponse.json(
        { error: "Verification token, password, and display name are required" },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Verify token
    const verification = await prisma.phoneVerification.findUnique({
      where: { token: verificationToken },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 404 }
      );
    }

    if (verification.used) {
      return NextResponse.json(
        { error: "This verification has already been used" },
        { status: 409 }
      );
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 410 }
      );
    }

    const phoneNumber = verification.phoneNumber;

    // Check if user with this phone already exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this phone number already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        phoneNumber,
        passwordHash,
        displayName,
      },
    });

    // Mark token as used
    await prisma.phoneVerification.update({
      where: { token: verificationToken },
      data: { used: true },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
