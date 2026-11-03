import type { StaffRole } from "@prisma/client";

export type Permission = "view" | "moderate" | "manage_staff" | "view_logs";

const GRANTS: Record<StaffRole, Permission[]> = {
  VIEWER: ["view"],
  ADMIN: ["view", "moderate"],
  SUPER_ADMIN: ["view", "moderate", "manage_staff", "view_logs"],
};

export function can(role: StaffRole, p: Permission): boolean {
  return GRANTS[role].includes(p);
}

export function sessionKind(s: { user?: { kind?: string } } | null): "member" | "staff" | null {
  const k = s?.user?.kind;
  return k === "member" || k === "staff" ? k : null;
}
