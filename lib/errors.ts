import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db";

export async function logError(context: string, err: unknown, details?: Record<string, unknown>): Promise<void> {
  try {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.errorLog.create({ data: { context, message, details: details as Prisma.InputJsonValue | undefined } });
  } catch {
    // never throws
  }
}
