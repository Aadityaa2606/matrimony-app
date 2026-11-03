export type Lang = "ta" | "en";

export const en = {
  "brand.name": "Kalyana Varan",
  "brand.sub": "Matrimony",
  "common.back": "Back",
  "common.next": "Next",
  "common.callUs": "Call us",
  "common.signOut": "Sign out",
  "lang.toggle": "த",
  "lang.switch": "Switch language",
} as const;

export type DictKey = keyof typeof en;

export const ta: Record<DictKey, string> = {
  "brand.name": "கல்யாண வரன்",
  "brand.sub": "மேட்ரிமோனி",
  "common.back": "பின்",
  "common.next": "அடுத்து",
  "common.callUs": "எங்களை அழைக்கவும்",
  "common.signOut": "வெளியேறு",
  "lang.toggle": "EN",
  "lang.switch": "மொழியை மாற்று",
};
