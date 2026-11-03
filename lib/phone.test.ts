import { describe, it, expect } from "vitest";
import { normalizePhone } from "./phone";

describe("normalizePhone", () => {
  it.each(["9876543210", "98765 43210", "+91 98765-43210", "919876543210", "09876543210"])(
    "accepts %s",
    (i) => expect(normalizePhone(i)).toBe("+919876543210"),
  );
  it.each(["12345", "5876543210", "", "+1 9876543210"])("rejects %s", (i) =>
    expect(normalizePhone(i)).toBeNull(),
  );
});
