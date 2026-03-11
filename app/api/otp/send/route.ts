import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Generate a 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    // Validate phone number format (Indian format: +91XXXXXXXXXX)
    const phoneRegex = /^\+91[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format. Use +91XXXXXXXXXX" },
        { status: 400 },
      );
    }

    // Generate OTP and expiry time (5 minutes)
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Upsert OTP in database
    await prisma.phoneOtp.upsert({
      where: { phoneNumber },
      update: {
        otp,
        expiresAt,
        attempts: 0,
        createdAt: new Date(),
      },
      create: {
        phoneNumber,
        otp,
        expiresAt,
        attempts: 0,
      },
    });

    // Log OTP to console (for development)
    console.log(`📱 OTP for ${phoneNumber}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Include OTP in dev response for testing
      ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 },
    );
  }
}
