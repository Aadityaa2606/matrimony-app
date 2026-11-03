import { describe, it, expect } from "vitest";
import { checkSend, channelMembers, channelIdFor, type ThreadState } from "./chat-rules";

const empty: ThreadState = { starterId: null, starterCount: 0, unlocked: false };

describe("checkSend", () => {
  it("allows two starter messages then blocks the third", () => {
    const r1 = checkSend(empty, "A");
    expect(r1).toEqual({ ok: true, next: { starterId: "A", starterCount: 1, unlocked: false } });
    const r2 = checkSend((r1 as { next: ThreadState }).next, "A");
    expect(r2).toEqual({ ok: true, next: { starterId: "A", starterCount: 2, unlocked: false } });
    expect(checkSend((r2 as { next: ThreadState }).next, "A")).toEqual({ ok: false, reason: "await_reply" });
  });
  it("unlocks on the other party's reply and stays open", () => {
    let t: ThreadState = { starterId: "A", starterCount: 2, unlocked: false };
    const r = checkSend(t, "B");
    expect(r.ok && r.next.unlocked).toBe(true);
    t = (r as { next: ThreadState }).next;
    for (let i = 0; i < 10; i++) {
      const s = checkSend(t, i % 2 ? "B" : "A");
      expect(s.ok).toBe(true);
      t = (s as { next: ThreadState }).next;
    }
    expect(t.unlocked).toBe(true);
  });
  it("unlocks when B replies after a single A message", () => {
    const r = checkSend({ starterId: "A", starterCount: 1, unlocked: false }, "B");
    expect(r.ok && r.next.unlocked).toBe(true);
  });
});

describe("channel ids", () => {
  it("parses and builds", () => {
    expect(channelMembers("x")).toBeNull();
    expect(channelMembers("a_b")).toEqual(["a", "b"]);
    expect(channelIdFor("b", "a")).toBe("a_b");
  });
});
