export const STARTER_LIMIT = 2;
export type ThreadState = { starterId: string | null; starterCount: number; unlocked: boolean };
export type SendBlock = "blocked_by_you" | "blocked_you" | "other_inactive" | "await_reply";

export function checkSend(
  t: ThreadState,
  senderId: string,
): { ok: true; next: ThreadState } | { ok: false; reason: "await_reply" } {
  if (t.unlocked) return { ok: true, next: t };
  if (t.starterId === null) return { ok: true, next: { starterId: senderId, starterCount: 1, unlocked: false } };
  if (t.starterId !== senderId) return { ok: true, next: { ...t, unlocked: true } };
  if (t.starterCount >= STARTER_LIMIT) return { ok: false, reason: "await_reply" };
  return { ok: true, next: { ...t, starterCount: t.starterCount + 1 } };
}

export function channelMembers(channelId: string): [string, string] | null {
  const p = channelId.split("_");
  return p.length === 2 && p[0] && p[1] ? [p[0], p[1]] : null;
}

export const channelIdFor = (a: string, b: string): string => [a, b].sort().join("_");
