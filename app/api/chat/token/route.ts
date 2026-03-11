import { auth } from "@/lib/auth";
import { StreamChat } from "stream-chat";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
    const apiSecret = process.env.STREAM_API_SECRET!;

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);

    // Get user details from DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upsert user in Stream so they exist for chat
    await serverClient.upsertUser({
      id: user.id,
      name: user.displayName,
      image: user.profile?.profilePhoto || undefined,
    });

    // Generate token
    const token = serverClient.createToken(user.id);

    return NextResponse.json({
      token,
      userId: user.id,
      userName: user.displayName,
      userImage: user.profile?.profilePhoto || null,
    });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return NextResponse.json(
      { error: "Failed to generate chat token" },
      { status: 500 },
    );
  }
}
