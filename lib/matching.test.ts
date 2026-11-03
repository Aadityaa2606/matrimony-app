import { describe, expect, it } from "vitest";
import { ageOn, matchScore, rankMatches, type MatchFields } from "./matching";

const now = new Date("2026-11-03T00:00:00Z");
const f = (o: Partial<MatchFields> = {}): MatchFields => ({
  community: "A",
  location: "X",
  dateOfBirth: new Date("1998-01-01T00:00:00Z"),
  createdAt: new Date("2026-01-01T00:00:00Z"),
  ...o,
});

describe("ageOn", () => {
  it("handles birthday boundary", () => {
    expect(ageOn(new Date("1998-11-04T00:00:00Z"), now)).toBe(27);
    expect(ageOn(new Date("1998-11-03T00:00:00Z"), now)).toBe(28);
  });
});

describe("matchScore", () => {
  it("scores community, location, age", () => {
    const v = f({ community: "Mudaliar ", location: "Chennai" });
    const c = f({ community: "mudaliar", location: " chennai", dateOfBirth: new Date("2001-01-01T00:00:00Z") });
    expect(matchScore(v, c, now)).toBe(6);
  });
  it("zero when nothing matches", () => {
    const c = f({ community: "B", location: "Y", dateOfBirth: new Date("2006-01-01T00:00:00Z") });
    expect(matchScore(f(), c, now)).toBe(0);
  });
});

describe("rankMatches", () => {
  it("orders by score then newest", () => {
    const v = f();
    const hi = { ...f({ dateOfBirth: new Date("1980-01-01T00:00:00Z"), location: "Y" }), n: "hi" }; // 3
    const lo1 = { ...f({ community: "B", location: "Y", dateOfBirth: new Date("1980-01-01T00:00:00Z"), createdAt: new Date("2026-05-01") }), n: "lo1" };
    const lo2 = { ...lo1, createdAt: new Date("2026-06-01"), n: "lo2" };
    expect(rankMatches(v, [lo1, lo2, hi], now).map((x) => x.n)).toEqual(["hi", "lo2", "lo1"]);
  });
});
