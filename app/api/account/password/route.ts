import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.kind !== "member") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const currentPassword = String(body?.currentPassword ?? "");
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });
  return NextResponse.json({ ok: true });
}
