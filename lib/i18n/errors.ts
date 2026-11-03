import type { DictKey } from "@/lib/i18n/dict";

const KNOWN = ["exists", "inactive", "gateway", "bad_signature", "unknown_order", "misconfigured"];

// Map API error codes to dictionary keys; never surface raw API text.
export const errorKey = (code?: unknown): DictKey =>
  typeof code === "string" && KNOWN.includes(code) ? (`err.${code}` as DictKey) : "err.generic";
