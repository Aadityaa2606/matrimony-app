import { describe, expect, it } from "vitest";
import { parseProfileInput } from "./profile";

const now = new Date("2026-11-03");
const ok = {
  fullName: "A B", gender: "BRIDE", dateOfBirth: "1999-01-01", height: "5'4\"", education: "BE",
  profession: "Eng", salary: "  ", location: "Chennai", community: "X", subCaste: "",
  hasHoroscope: true, parentContact: "9999999999", profilePhoto: "https://x/y.webp", additionalPhotos: [],
};

describe("parseProfileInput", () => {
  it("accepts valid and nulls blank salary", () => {
    const r = parseProfileInput(ok, now);
    expect(r.ok && r.data.salary).toBeNull();
    expect(r.ok).toBe(true);
  });
  it("rejects missing photo", () => expect(parseProfileInput({ ...ok, profilePhoto: "" }, now).ok).toBe(false));
  it("rejects MALE", () => expect(parseProfileInput({ ...ok, gender: "MALE" }, now).ok).toBe(false));
  it("rejects age 17", () => expect(parseProfileInput({ ...ok, dateOfBirth: "2009-06-01" }, now).ok).toBe(false));
  it("rejects 6 extra photos", () =>
    expect(parseProfileInput({ ...ok, additionalPhotos: Array(6).fill("u") }, now).ok).toBe(false));
});
