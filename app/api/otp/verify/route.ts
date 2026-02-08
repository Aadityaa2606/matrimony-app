import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    const otpRecord = await prisma.phoneOtp.findUnique({
      where: { phoneNumber },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No OTP found for this phone number. Please request a new one." },
        { status: 404 }
      );
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await prisma.phoneOtp.delete({ where: { phoneNumber } });
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // Check attempts (max 3)
    if (otpRecord.attempts >= 3) {
      await prisma.phoneOtp.delete({ where: { phoneNumber } });
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 429 }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      await prisma.phoneOtp.update({
        where: { phoneNumber },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 401 }
      );
    }

    // OTP verified - generate a verification token
    const verificationToken = crypto.randomUUID();
    const tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification token
    await prisma.phoneVerification.create({
      data: {
        phoneNumber,
        token: verificationToken,
        expiresAt: tokenExpiresAt,
        used: false,
      },
    });

    // Delete OTP
    await prisma.phoneOtp.delete({ where: { phoneNumber } });

    // Check if user with this phone exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    return NextResponse.json({
      success: true,
      verificationToken,
      userExists: !!existingUser,
      message: "Phone number verified successfully",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}
