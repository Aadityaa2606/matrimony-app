import { auth } from "@/lib/auth";
import { StreamChat } from "stream-chat";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otherUserId } = await req.json();

    if (!otherUserId) {
      return NextResponse.json(
        { error: "otherUserId is required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
    const apiSecret = process.env.STREAM_API_SECRET!;
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);

    // Fetch both users from DB
    const [currentUser, otherUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true },
      }),
      prisma.user.findUnique({
        where: { id: otherUserId },
        include: { profile: true },
      }),
    ]);

    if (!currentUser || !otherUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upsert BOTH users in Stream before creating the channel
    await serverClient.upsertUsers([
      {
        id: currentUser.id,
        name: currentUser.displayName,
        image: currentUser.profile?.profilePhoto || undefined,
      },
      {
        id: otherUser.id,
        name: otherUser.displayName,
        image: otherUser.profile?.profilePhoto || undefined,
      },
    ]);

    // Create a deterministic channel ID
    const ids = [currentUser.id, otherUser.id].sort();
    const channelId = `${ids[0]}_${ids[1]}`;

    // Create the channel server-side
    const channel = serverClient.channel("messaging", channelId, {
      members: [currentUser.id, otherUser.id],
      created_by_id: currentUser.id,
    });
    await channel.create();

    return NextResponse.json({ channelId });
  } catch (error) {
    console.error("Error creating chat channel:", error);
    return NextResponse.json(
      { error: "Failed to create chat channel" },
      { status: 500 },
    );
  }
}
