import { redirect } from "next/navigation";
import type { StaffRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { can, sessionKind, type Permission } from "@/lib/permissions";

export type StaffUser = { id: string; username: string; role: StaffRole };

export async function requireStaff(p: Permission): Promise<StaffUser> {
  const session = await auth();
  if (sessionKind(session) !== "staff" || !session?.user?.id) redirect("/admin/login");
  // re-read every call so deactivation / role change applies immediately
  const staff = await prisma.staff.findUnique({ where: { id: session.user.id } });
  if (!staff || !staff.active) redirect("/admin/login");
  if (!can(staff.role, p)) redirect("/admin?denied=1");
  return { id: staff.id, username: staff.username, role: staff.role };
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
