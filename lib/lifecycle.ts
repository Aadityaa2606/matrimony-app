import type { UserStatus } from "@prisma/client";

export const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
export type EffectiveStatus = UserStatus | "EXPIRED";
export type LifecycleUser = { status: UserStatus; expiresAt: Date | null; hasProfile: boolean; hasPaid: boolean };
export type Change = { status: UserStatus; expiresAt?: Date | null; approvedAt?: Date };
export class TransitionError extends Error {}

export function effectiveStatus(u: { status: UserStatus; expiresAt: Date | null }, now: Date): EffectiveStatus {
  return u.status === "ACTIVE" && u.expiresAt && u.expiresAt <= now ? "EXPIRED" : u.status;
}

const PATHS: Record<EffectiveStatus, string> = {
  PENDING_PAYMENT: "/payment",
  PENDING_PROFILE: "/register",
  PENDING_REVIEW: "/review",
  ACTIVE: "/home",
  EXPIRED: "/payment",
  REJECTED: "/account-status",
  SUSPENDED: "/account-status",
};
export const landingPath = (s: EffectiveStatus): string => PATHS[s];

export function afterPayment(u: LifecycleUser, now: Date): Change {
  if (u.status === "PENDING_PAYMENT") return { status: u.hasProfile ? "PENDING_REVIEW" : "PENDING_PROFILE" };
  if (u.status === "ACTIVE") {
    const base = Math.max(+now, u.expiresAt ? +u.expiresAt : +now);
    return { status: "ACTIVE", expiresAt: new Date(base + YEAR_MS) };
  }
  return { status: u.status };
}

export function afterProfileSaved(u: LifecycleUser): Change {
  return { status: u.status === "PENDING_PROFILE" ? "PENDING_REVIEW" : u.status };
}

function need(ok: boolean, msg: string): void {
  if (!ok) throw new TransitionError(msg);
}

export function approve(u: LifecycleUser, now: Date): Change {
  need(u.status === "PENDING_REVIEW" || u.status === "REJECTED", `Cannot approve from ${u.status}`);
  need(u.hasPaid && u.hasProfile, "Cannot approve without payment and profile");
  return { status: "ACTIVE", approvedAt: now, expiresAt: new Date(+now + YEAR_MS) };
}

export function reject(u: LifecycleUser): Change {
  need(u.status === "PENDING_PROFILE" || u.status === "PENDING_REVIEW", `Cannot reject from ${u.status}`);
  return { status: "REJECTED" };
}

export function suspend(u: LifecycleUser): Change {
  need(u.status === "ACTIVE", `Cannot suspend from ${u.status}`);
  return { status: "SUSPENDED" };
}

export function unsuspend(u: LifecycleUser): Change {
  need(u.status === "SUSPENDED", `Cannot unsuspend from ${u.status}`);
  return { status: "ACTIVE" };
}
