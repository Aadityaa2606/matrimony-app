import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { verificationToken, newPassword } = await request.json();

    if (!verificationToken || !newPassword) {
      return NextResponse.json(
        { error: "Verification token and new password are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Verify token
    const verification = await prisma.phoneVerification.findUnique({
      where: { token: verificationToken },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 404 },
      );
    }

    if (verification.used) {
      return NextResponse.json(
        { error: "This verification has already been used" },
        { status: 409 },
      );
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 410 },
      );
    }

    const phoneNumber = verification.phoneNumber;

    // Find user with this phone number
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this phone number" },
        { status: 404 },
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { phoneNumber },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.phoneVerification.update({
      where: { token: verificationToken },
      data: { used: true },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 },
    );
  }
}
