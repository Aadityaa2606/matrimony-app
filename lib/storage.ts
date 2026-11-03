import { AwsClient } from "aws4fetch";
import sharp from "sharp";

export class ImageError extends Error {}

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX = 5 * 1024 * 1024;

export function checkImage(type: string, size: number): string | null {
  if (!TYPES.includes(type)) return "Invalid file type. Only JPEG, PNG, and WebP are allowed";
  if (size > MAX) return "File too large. Maximum size is 5MB";
  return null;
}

export async function storeImage(file: File, prefix: string): Promise<string> {
  const bad = checkImage(file.type, file.size);
  if (bad) throw new ImageError(bad);
  const body = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: 1080, height: 1080, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();
  const key = `${prefix}/${crypto.randomUUID()}.webp`;
  const r2 = new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    service: "s3",
    region: "auto",
  });
  const res = await r2.fetch(`${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${key}`, {
    method: "PUT",
    body: new Uint8Array(body),
    headers: { "content-type": "image/webp" },
  });
  if (!res.ok) throw new Error(`R2 upload failed: ${res.status}`);
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
