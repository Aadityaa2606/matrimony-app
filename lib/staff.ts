import { cache } from "react";
import { redirect } from "next/navigation";
import type { StaffRole } from "@prisma/client";
import { staffAuth } from "@/lib/auth";
import prisma from "@/lib/db";
import { can, sessionKind, type Permission } from "@/lib/permissions";

export type StaffUser = { id: string; username: string; role: StaffRole };

// Signed-in, active staff member or null. Re-read every call so deactivation / role change applies immediately.
// cache(): the layout and the page both call this; one DB read per request.
export const getStaff = cache(async (): Promise<StaffUser | null> => {
  const session = await staffAuth();
  if (sessionKind(session) !== "staff" || !session?.user?.id) return null;
  const staff = await prisma.staff.findUnique({ where: { id: session.user.id } });
  if (!staff || !staff.active) return null;
  return { id: staff.id, username: staff.username, role: staff.role };
});

export async function requireStaff(p: Permission): Promise<StaffUser> {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  if (!can(staff.role, p)) redirect("/admin?denied=1");
  return staff;
}

export async function logActivity(
  staffId: string,
  action: string,
  targetUserId?: string,
  details?: Record<string, unknown>,
): Promise<void> {
  await prisma.activityLog.create({
    data: { staffId, action, targetUserId, details: details as object | undefined },
  });
}
