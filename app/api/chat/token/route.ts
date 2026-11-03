import { NextResponse } from "next/server";
import { requireActiveMember } from "@/lib/member";
import { streamServer } from "@/lib/stream";

export async function GET() {
  const m = await requireActiveMember();
  if (m instanceof NextResponse) return m;
  try {
    const client = streamServer();
    const image = m.profile?.profilePhoto || undefined;
    await client.upsertUser({ id: m.id, name: m.displayName, image });
    return NextResponse.json({
      token: client.createToken(m.id),
      userId: m.id,
      userName: m.displayName,
      userImage: image ?? null,
    });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return NextResponse.json({ error: "Failed to generate chat token" }, { status: 500 });
  }
}
