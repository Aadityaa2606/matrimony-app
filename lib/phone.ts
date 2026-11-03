export function normalizePhone(input: string): string | null {
  let s = input.replace(/[\s\-()]/g, "");
  if (s.startsWith("+91")) s = s.slice(3);
  else if (s.startsWith("91") && s.length === 12) s = s.slice(2);
  else if (s.startsWith("0") && s.length === 11) s = s.slice(1);
  return /^[6-9]\d{9}$/.test(s) ? `+91${s}` : null;
}
