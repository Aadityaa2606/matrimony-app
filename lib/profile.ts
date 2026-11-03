import type { Gender } from "@prisma/client";
import prisma from "@/lib/db";
import { afterProfileSaved } from "@/lib/lifecycle";

export type ProfileData = {
  fullName: string; gender: Gender; dateOfBirth: Date; height: string; education: string;
  profession: string; salary: string | null; location: string; community: string;
  subCaste: string | null; hasHoroscope: boolean; parentContact: string;
  profilePhoto: string; additionalPhotos: string[];
};

const MIN_AGE = 18;

export function parseProfileInput(
  body: unknown,
  now: Date,
): { ok: true; data: ProfileData } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const req = ["fullName", "height", "education", "profession", "location", "community", "parentContact", "profilePhoto"] as const;
  for (const k of req) if (!str(b[k])) return { ok: false, error: `${k} is required` };
  if (b.gender !== "BRIDE" && b.gender !== "GROOM") return { ok: false, error: "Gender must be BRIDE or GROOM" };
  if (typeof b.hasHoroscope !== "boolean") return { ok: false, error: "hasHoroscope is required" };
  const dob = new Date(str(b.dateOfBirth));
  if (isNaN(+dob)) return { ok: false, error: "Invalid date of birth" };
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE);
  if (dob > cutoff) return { ok: false, error: `Must be at least ${MIN_AGE} years old` };
  const photos = b.additionalPhotos ?? [];
  if (!Array.isArray(photos) || photos.some((p) => typeof p !== "string")) return { ok: false, error: "Invalid additionalPhotos" };
  if (photos.length > 5) return { ok: false, error: "At most 5 additional photos" };
  return {
    ok: true,
    data: {
      fullName: str(b.fullName), gender: b.gender, dateOfBirth: dob, height: str(b.height),
      education: str(b.education), profession: str(b.profession), salary: str(b.salary) || null,
      location: str(b.location), community: str(b.community), subCaste: str(b.subCaste) || null,
      hasHoroscope: b.hasHoroscope, parentContact: str(b.parentContact),
      profilePhoto: str(b.profilePhoto), additionalPhotos: photos as string[],
    },
  };
}

export async function saveProfile(userId: string, data: ProfileData): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.profile.upsert({ where: { userId }, update: data, create: { userId, ...data } });
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const hasPaid = (await tx.payment.count({ where: { userId, status: "PAID" } })) > 0;
    const change = afterProfileSaved({ status: user.status, expiresAt: user.expiresAt, hasProfile: true, hasPaid });
    if (change.status !== user.status) await tx.user.update({ where: { id: userId }, data: change });
  });
}
