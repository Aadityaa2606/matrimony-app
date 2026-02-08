import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// POST - Mark payment as complete (placeholder)
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is in PENDING_PAYMENT status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { error: "Invalid payment state" },
        { status: 400 }
      );
    }

    // Update user status to PENDING_REVIEW
    await prisma.user.update({
      where: { id: session.user.id },
      data: { status: "PENDING_REVIEW" },
    });

    return NextResponse.json({
      success: true,
      message: "Payment completed. Profile is now under review.",
    });
  } catch (error) {
    console.error("Error completing payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
