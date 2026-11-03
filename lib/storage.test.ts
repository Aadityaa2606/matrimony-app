import { describe, expect, it } from "vitest";
import { checkImage } from "./storage";

describe("checkImage", () => {
  it("rejects bad type", () => expect(checkImage("image/gif", 10)).not.toBeNull());
  it("rejects oversize", () => expect(checkImage("image/png", 5 * 1024 * 1024 + 1)).not.toBeNull());
  it("accepts webp", () => expect(checkImage("image/webp", 1000)).toBeNull());
});
