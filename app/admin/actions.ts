"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { requireStaff, logActivity } from "@/lib/staff";
import { TransitionError, approve, reject, suspend, unsuspend, type Change, type LifecycleUser } from "@/lib/lifecycle";
import { parseProfileInput, saveProfile } from "@/lib/profile";
import { storeImage, ImageError } from "@/lib/storage";
import { recordManualPayment } from "@/lib/payments";
import { normalizePhone } from "@/lib/phone";

type Result = { error?: string };
const msg = (e: unknown) => (e instanceof TransitionError || e instanceof ImageError ? e.message : e instanceof Error ? e.message : "Something went wrong");

function refresh(userId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/waitlist");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

async function transition(name: string, userId: string, fn: (u: LifecycleUser, now: Date) => Change): Promise<Result> {
  const staff = await requireStaff("moderate");
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: { select: { id: true } } } });
    if (!user) return { error: "User not found" };
    const hasPaid = (await prisma.payment.count({ where: { userId, status: "PAID" } })) > 0;
    const c = fn({ status: user.status, expiresAt: user.expiresAt, hasProfile: !!user.profile, hasPaid }, new Date());
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: c.status,
        ...(c.expiresAt !== undefined && { expiresAt: c.expiresAt }),
        ...(c.approvedAt !== undefined && { approvedAt: c.approvedAt }),
      },
    });
    await logActivity(staff.id, name, userId, { from: user.status, to: c.status });
    refresh(userId);
    return {};
  } catch (e) {
    return { error: msg(e) };
  }
}

export async function approveUser(userId: string): Promise<Result> {
  return transition("approveUser", userId, approve);
}
export async function rejectUser(userId: string): Promise<Result> {
  return transition("rejectUser", userId, reject);
}
export async function suspendUser(userId: string): Promise<Result> {
  return transition("suspendUser", userId, suspend);
}
export async function unsuspendUser(userId: string): Promise<Result> {
  return transition("unsuspendUser", userId, unsuspend);
}

export async function markPaid(userId: string): Promise<Result> {
  const staff = await requireStaff("moderate");
  try {
    if (!(await prisma.user.findUnique({ where: { id: userId } }))) return { error: "User not found" };
    await recordManualPayment(userId, staff.id, new Date());
    await logActivity(staff.id, "markPaid", userId);
    refresh(userId);
    return {};
  } catch (e) {
    return { error: msg(e) };
  }
}

export async function setExpiry(userId: string, isoDate: string): Promise<Result> {
  const staff = await requireStaff("moderate");
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return { error: "Enter a valid date" };
    const expiresAt = new Date(isoDate + "T23:59:59+05:30");
    if (isNaN(+expiresAt)) return { error: "Enter a valid date" };
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "User not found" };
    if (user.status !== "ACTIVE") return { error: "Expiry can only be set for active members" };
    await prisma.user.update({ where: { id: userId }, data: { expiresAt } });
    await logActivity(staff.id, "setExpiry", userId, { expiresAt: expiresAt.toISOString() });
    refresh(userId);
    return {};
  } catch (e) {
    return { error: msg(e) };
  }
}

export async function resetMemberPassword(userId: string, newPassword: string): Promise<Result> {
  const staff = await requireStaff("moderate");
  try {
    if (typeof newPassword !== "string" || newPassword.length < 8) return { error: "Password must be at least 8 characters" };
    if (!(await prisma.user.findUnique({ where: { id: userId } }))) return { error: "User not found" };
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
    await logActivity(staff.id, "resetMemberPassword", userId);
    return {};
  } catch (e) {
    return { error: msg(e) };
  }
}

const isFile = (v: FormDataEntryValue | null): v is File => v instanceof File && v.size > 0;

// Builds profile input from the form; uploads any new photos, keeping existing ones otherwise.
async function profileFromForm(userId: string, fd: FormData, existing?: { profilePhoto: string; additionalPhotos: string[] } | null) {
  const main = fd.get("profilePhoto");
  const profilePhoto = isFile(main) ? await storeImage(main, `members/${userId}`) : (existing?.profilePhoto ?? "");
  const added: string[] = [];
  for (const f of fd.getAll("additionalPhotos")) if (isFile(f)) added.push(await storeImage(f, `members/${userId}`));
  const g = (k: string) => String(fd.get(k) ?? "");
  return parseProfileInput(
    {
      fullName: g("fullName"), gender: g("gender"), dateOfBirth: g("dateOfBirth"), height: g("height"),
      education: g("education"), profession: g("profession"), salary: g("salary"), location: g("location"),
      community: g("community"), subCaste: g("subCaste"), hasHoroscope: g("hasHoroscope") === "yes",
      parentContact: g("parentContact"), profilePhoto,
      additionalPhotos: [...(existing?.additionalPhotos ?? []), ...added],
    },
    new Date(),
  );
}

export async function saveMemberProfile(userId: string, formData: FormData): Promise<Result> {
  const staff = await requireStaff("moderate");
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!user) return { error: "User not found" };
    const parsed = await profileFromForm(userId, formData, user.profile);
    if (!parsed.ok) return { error: parsed.error };
    await saveProfile(userId, parsed.data);
    await logActivity(staff.id, "saveMemberProfile", userId);
    refresh(userId);
    return {};
  } catch (e) {
    return { error: msg(e) };
  }
}

export async function createMember(formData: FormData): Promise<Result & { id?: string }> {
  const staff = await requireStaff("moderate");
  try {
    const name = String(formData.get("name") ?? "").trim();
    const phone = normalizePhone(String(formData.get("phone") ?? ""));
    const password = String(formData.get("password") ?? "");
    const markedPaid = formData.get("markPaid") === "on";
    if (name.length < 1 || name.length > 60) return { error: "Invalid name" };
    if (!phone) return { error: "Invalid phone number" };
    if (password.length < 8) return { error: "Password must be at least 8 characters" };
    if (await prisma.user.findUnique({ where: { phoneNumber: phone } })) return { error: "A member with this phone already exists" };
    const user = await prisma.user.create({
      data: { phoneNumber: phone, displayName: name, passwordHash: await bcrypt.hash(password, 12) },
    });
    try {
      const parsed = await profileFromForm(user.id, formData);
      if (!parsed.ok) throw new TransitionError(parsed.error);
      await saveProfile(user.id, parsed.data);
      if (markedPaid) await recordManualPayment(user.id, staff.id, new Date());
    } catch (e) {
      // leave nothing behind so a retry doesn't hit "phone already exists"
      await prisma.payment.deleteMany({ where: { userId: user.id } });
      await prisma.profile.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
      throw e;
    }
    await logActivity(staff.id, "createMember", user.id, { markedPaid });
    refresh(user.id);
    return { id: user.id };
  } catch (e) {
    return { error: msg(e) };
  }
}
