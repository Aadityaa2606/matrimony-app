import { NextRequest, NextResponse } from "next/server";
import { getMember } from "@/lib/member";
import { ImageError, storeImage } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const m = await getMember();
    if (!m) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    const url = await storeImage(file, "members/" + m.id);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof ImageError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
