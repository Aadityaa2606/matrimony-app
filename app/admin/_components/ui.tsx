import Link from "next/link";

// Shared admin styles. Plain class strings so server and client components can both use them.
const btnBase =
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 disabled:pointer-events-none disabled:opacity-50";
export const btn = {
  primary: `${btnBase} bg-zinc-900 text-white hover:bg-zinc-700`,
  secondary: `${btnBase} border border-zinc-200 bg-white text-zinc-800 shadow-xs hover:bg-zinc-50`,
  success: `${btnBase} bg-emerald-600 text-white hover:bg-emerald-700`,
  danger: `${btnBase} border border-rose-200 bg-white text-rose-600 hover:bg-rose-50`,
  dangerSolid: `${btnBase} bg-rose-600 text-white hover:bg-rose-700`,
  ghost: `${btnBase} text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900`,
};
export const input =
  "h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 file:mr-3 file:h-full file:border-0 file:border-r file:border-zinc-200 file:bg-zinc-50 file:px-3 file:text-sm file:font-medium file:text-zinc-700";
export const card = "rounded-xl border border-zinc-200 bg-white shadow-xs";
export const label = "grid gap-1.5 text-sm font-medium text-zinc-700";

const ICONS = {
  home: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  clock: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  users: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
  userPlus: "M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z",
  chat: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  ban: "M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636",
  card: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z",
  shield: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
  list: "M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
  alert: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z",
  logout: "M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9",
  menu: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
  x: "M6 18 18 6M6 6l12 12",
  check: "m4.5 12.75 6 6 9-13.5",
  search: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
  left: "M15.75 19.5 8.25 12l7.5-7.5",
  right: "m8.25 4.5 7.5 7.5-7.5 7.5",
  rupee: "M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
};
export type IconName = keyof typeof ICONS;

export function Icon({ name, className = "size-4" }: { name: IconName; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[name]} />
    </svg>
  );
}

export function PageHeader({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-zinc-500">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

const TONES = {
  gray: "bg-zinc-100 text-zinc-700 ring-zinc-500/10",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  red: "bg-rose-50 text-rose-700 ring-rose-600/20",
  orange: "bg-orange-50 text-orange-700 ring-orange-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
};
const STATUS: Record<string, [string, keyof typeof TONES]> = {
  PENDING_PAYMENT: ["Awaiting payment", "gray"],
  PENDING_PROFILE: ["Awaiting profile", "gray"],
  PENDING_REVIEW: ["Waiting review", "amber"],
  ACTIVE: ["Active", "green"],
  EXPIRED: ["Expired", "orange"],
  REJECTED: ["Disapproved", "red"],
  SUSPENDED: ["Suspended", "red"],
  CREATED: ["Started", "gray"],
  PAID: ["Paid", "green"],
  FAILED: ["Failed", "red"],
  VIEWER: ["Viewer", "gray"],
  ADMIN: ["Admin", "blue"],
  SUPER_ADMIN: ["Super admin", "violet"],
};
export const statusLabel = (s: string) => STATUS[s]?.[0] ?? s;

export function Badge({ status, children }: { status: string; children?: React.ReactNode }) {
  const [text, tone] = STATUS[status] ?? [status, "gray"];
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}>
      {children ?? text}
    </span>
  );
}

export function Avatar({ name, src, size = "size-9" }: { name: string; src?: string | null; size?: string }) {
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`${size} shrink-0 rounded-full object-cover ring-1 ring-zinc-200`} />
  ) : (
    <span className={`${size} grid shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600`}>{initials}</span>
  );
}

// Card-wrapped table that scrolls sideways on small screens. Pass `empty` when there are no rows.
export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string | false }) {
  return (
    <div className={`${card} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50/70">
            <tr>
              {head.map((h, i) => (
                <th key={i} className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 [&_td]:px-4 [&_td]:py-3 [&_tr]:transition-colors [&_tr:hover]:bg-zinc-50/70">
            {children}
          </tbody>
        </table>
      </div>
      {empty && <Empty text={empty} />}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-sm text-zinc-500">
      <span className="grid size-10 place-items-center rounded-full bg-zinc-100 text-zinc-400"><Icon name="search" className="size-5" /></span>
      {text}
    </div>
  );
}

export function Pagination({ page, total, size, href }: { page: number; total: number; size: number; href: (n: number) => string }) {
  const last = Math.max(1, Math.ceil(total / size));
  if (last === 1) return null;
  const cls = (on: boolean) => `${btn.secondary} ${on ? "" : "pointer-events-none opacity-40"}`;
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-zinc-500">
      <span>Page {page} of {last}</span>
      <div className="flex gap-2">
        <Link href={href(page - 1)} className={cls(page > 1)} aria-disabled={page <= 1}><Icon name="left" />Previous</Link>
        <Link href={href(page + 1)} className={cls(page < last)} aria-disabled={page >= last}>Next<Icon name="right" /></Link>
      </div>
    </div>
  );
}

// Filter chips that keep the other query params.
export function Chips({ options, value, href }: { options: [string, string][]; value: string; href: (v: string) => string }) {
  return (
    <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map(([v, text]) => (
        <Link
          key={v}
          href={href(v)}
          className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            v === value ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
          }`}
        >
          {text}
        </Link>
      ))}
    </div>
  );
}

export function SearchBox({ q, placeholder, hidden = {} }: { q: string; placeholder: string; hidden?: Record<string, string> }) {
  return (
    <form className="mb-4 flex gap-2">
      {Object.entries(hidden).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
      <div className="relative flex-1 sm:max-w-sm">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <input name="q" defaultValue={q} placeholder={placeholder} className={`${input} pl-9`} />
      </div>
      <button className={btn.secondary}>Search</button>
    </form>
  );
}

const IST = { timeZone: "Asia/Kolkata" } as const;
export const fmtDate = (d: Date | null | undefined) =>
  d ? d.toLocaleDateString("en-IN", { ...IST, day: "numeric", month: "short", year: "numeric" }) : "—";
export const fmtDateTime = (d: Date | null | undefined) =>
  d ? d.toLocaleString("en-IN", { ...IST, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
export const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
export function ago(d: Date, now = new Date()) {
  const s = (+d - +now) / 1000;
  for (const [unit, sec] of [["day", 86400], ["hour", 3600], ["minute", 60]] as const) {
    if (Math.abs(s) >= sec) return rtf.format(Math.round(s / sec), unit);
  }
  return "just now";
}
