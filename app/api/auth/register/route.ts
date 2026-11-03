import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { normalizePhone } from "@/lib/phone";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = normalizePhone(String(body?.phone ?? ""));
  const password = typeof body?.password === "string" ? body.password : "";

  if (name.length < 1 || name.length > 60) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  if (await prisma.user.findUnique({ where: { phoneNumber: phone } })) {
    return NextResponse.json({ error: "exists" }, { status: 409 });
  }

  await prisma.user.create({
    data: {
      phoneNumber: phone,
      displayName: name,
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
