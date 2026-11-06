"use client";

export function PhoneInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-stretch gap-2">
      <span className="flex min-h-[52px] items-center rounded-xl border-[1.5px] border-border bg-muted px-3 font-semibold">+91</span>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        className="input min-w-0 flex-1"
        value={value}
        placeholder="98765 43210"
        onChange={(e) => onChange(e.target.value.replace(/[^\d\s]/g, "").slice(0, 11))}
      />
    </div>
  );
}
