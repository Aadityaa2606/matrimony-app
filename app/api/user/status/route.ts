import { NextResponse } from "next/server";
import { getMember } from "@/lib/member";

// GET - Fetch current member's effective status
export async function GET() {
  const m = await getMember();
  if (!m) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ status: m.status, expiresAt: m.expiresAt });
}
