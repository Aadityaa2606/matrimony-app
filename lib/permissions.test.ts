import { describe, expect, it } from "vitest";
import { can, sessionKind } from "./permissions";

describe("can", () => {
  it("grants by role", () => {
    expect(can("VIEWER", "moderate")).toBe(false);
    expect(can("VIEWER", "view")).toBe(true);
    expect(can("ADMIN", "moderate")).toBe(true);
    expect(can("ADMIN", "manage_staff")).toBe(false);
    expect(can("SUPER_ADMIN", "view_logs")).toBe(true);
  });
});

describe("sessionKind", () => {
  it("maps kinds", () => {
    expect(sessionKind(null)).toBeNull();
    expect(sessionKind({ user: { kind: "staff" } })).toBe("staff");
    expect(sessionKind({ user: { kind: "member" } })).toBe("member");
    expect(sessionKind({ user: { kind: "x" } })).toBeNull();
    expect(sessionKind({})).toBeNull();
  });
});
