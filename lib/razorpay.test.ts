import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { verifyCheckoutSignature, verifyWebhookSignature } from "./razorpay";
import { captureDecision } from "./payments";

const sign = (d: string, s: string) => createHmac("sha256", s).update(d).digest("hex");

describe("signatures", () => {
  it("checkout", () => {
    expect(verifyCheckoutSignature("o1", "p1", sign("o1|p1", "sec"), "sec")).toBe(true);
    expect(verifyCheckoutSignature("o1", "p1", sign("o1|p1", "sec"), "other")).toBe(false);
    expect(verifyCheckoutSignature("o1", "p1", "abc", "sec")).toBe(false);
  });
  it("webhook", () => {
    expect(verifyWebhookSignature("{}", sign("{}", "sec"), "sec")).toBe(true);
    expect(verifyWebhookSignature("{}", sign("{}", "sec"), "other")).toBe(false);
    expect(verifyWebhookSignature("{}", "abc", "sec")).toBe(false);
  });
});

describe("empty secret", () => {
  it("fails closed", () => {
    expect(verifyCheckoutSignature("o1", "p1", sign("o1|p1", ""), "")).toBe(false);
    expect(verifyWebhookSignature("{}", sign("{}", ""), "")).toBe(false);
  });
});

describe("captureDecision", () => {
  it("maps states", () => {
    expect(captureDecision(null)).toBe("unknown_order");
    expect(captureDecision({ status: "PAID" })).toBe("already");
    expect(captureDecision({ status: "CREATED" })).toBe("captured");
    expect(captureDecision({ status: "FAILED" })).toBe("captured");
  });
});
