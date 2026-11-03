export function ageOn(dob: Date, now: Date): number {
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const m = now.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) age--;
  return age;
}

export type MatchFields = { community: string; location: string; dateOfBirth: Date; createdAt: Date };

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function matchScore(viewer: MatchFields, c: MatchFields, now: Date): number {
  return (
    (same(viewer.community, c.community) ? 3 : 0) +
    (same(viewer.location, c.location) ? 2 : 0) +
    (Math.abs(ageOn(viewer.dateOfBirth, now) - ageOn(c.dateOfBirth, now)) <= 5 ? 1 : 0)
  );
}

export function rankMatches<T extends MatchFields>(viewer: MatchFields, cs: T[], now: Date): T[] {
  return cs
    .map((c) => ({ c, s: matchScore(viewer, c, now) }))
    .sort((a, b) => b.s - a.s || b.c.createdAt.getTime() - a.c.createdAt.getTime())
    .map((x) => x.c);
}
