import { cookies } from "next/headers";
import type { Lang } from "./dict";

export async function getLang(): Promise<Lang> {
  return (await cookies()).get("lang")?.value === "en" ? "en" : "ta";
}
