import { describe, expect, it } from "vitest";
import {
  YEAR_MS, TransitionError, afterPayment, afterProfileSaved, approve, effectiveStatus,
  landingPath, reject, suspend, unsuspend, type LifecycleUser,
} from "./lifecycle";

const now = new Date("2026-11-03T00:00:00Z");
const DAY = 86400000;
const u = (o: Partial<LifecycleUser> = {}): LifecycleUser => ({
  status: "PENDING_PAYMENT", expiresAt: null, hasProfile: false, hasPaid: false, ...o,
});

describe("effectiveStatus", () => {
  it("expires at the boundary", () => {
    expect(effectiveStatus({ status: "ACTIVE", expiresAt: now }, now)).toBe("EXPIRED");
    expect(effectiveStatus({ status: "ACTIVE", expiresAt: new Date(+now + 1) }, now)).toBe("ACTIVE");
    expect(effectiveStatus({ status: "SUSPENDED", expiresAt: new Date(+now - DAY) }, now)).toBe("SUSPENDED");
  });
});

describe("afterPayment", () => {
  it("moves PENDING_PAYMENT by profile presence", () => {
    expect(afterPayment(u({ hasProfile: false }), now).status).toBe("PENDING_PROFILE");
    expect(afterPayment(u({ hasProfile: true }), now).status).toBe("PENDING_REVIEW");
  });
  it("renews early", () => {
    const c = afterPayment(u({ status: "ACTIVE", expiresAt: new Date(+now + 5 * DAY) }), now);
    expect(c).toEqual({ status: "ACTIVE", expiresAt: new Date(+now + 5 * DAY + YEAR_MS) });
  });
  it("renews late", () => {
    const c = afterPayment(u({ status: "ACTIVE", expiresAt: new Date(+now - 30 * DAY) }), now);
    expect(c.expiresAt).toEqual(new Date(+now + YEAR_MS));
  });
  it("leaves other statuses unchanged", () => {
    expect(afterPayment(u({ status: "REJECTED" }), now)).toEqual({ status: "REJECTED" });
  });
});

describe("afterProfileSaved", () => {
  it("advances only PENDING_PROFILE", () => {
    expect(afterProfileSaved(u({ status: "PENDING_PROFILE" })).status).toBe("PENDING_REVIEW");
    expect(afterProfileSaved(u({ status: "ACTIVE" })).status).toBe("ACTIVE");
  });
});

describe("approve", () => {
  it("requires payment and profile", () => {
    expect(() => approve(u({ status: "PENDING_REVIEW", hasProfile: true }), now)).toThrow(TransitionError);
  });
  it("approves from REJECTED", () => {
    expect(approve(u({ status: "REJECTED", hasPaid: true, hasProfile: true }), now)).toEqual({
      status: "ACTIVE", approvedAt: now, expiresAt: new Date(+now + YEAR_MS),
    });
  });
  it("throws from ACTIVE", () => {
    expect(() => approve(u({ status: "ACTIVE", hasPaid: true, hasProfile: true }), now)).toThrow(TransitionError);
  });
});

describe("reject / suspend / unsuspend", () => {
  it("reject throws from ACTIVE, works from PENDING_REVIEW", () => {
    expect(() => reject(u({ status: "ACTIVE" }))).toThrow(TransitionError);
    expect(reject(u({ status: "PENDING_REVIEW" })).status).toBe("REJECTED");
  });
  it("suspend/unsuspend leave expiresAt alone", () => {
    expect(suspend(u({ status: "ACTIVE" }))).toEqual({ status: "SUSPENDED" });
    expect(() => suspend(u({ status: "REJECTED" }))).toThrow(TransitionError);
    expect(unsuspend(u({ status: "SUSPENDED" }))).toEqual({ status: "ACTIVE" });
    expect(() => unsuspend(u({ status: "ACTIVE" }))).toThrow(TransitionError);
  });
});

describe("landingPath", () => {
  it("maps statuses", () => {
    expect(landingPath("EXPIRED")).toBe("/payment");
    expect(landingPath("REJECTED")).toBe("/account-status");
    expect(landingPath("ACTIVE")).toBe("/home");
  });
});
