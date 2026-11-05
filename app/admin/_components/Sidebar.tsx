"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge, Icon, type IconName } from "./ui";

export type NavLink = { label: string; href: string; icon: IconName; count?: number };

function Logo() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-[#8e1b2c] text-xs font-bold text-white">KV</span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">Kalyana Varan</span>
        <span className="block text-xs text-zinc-500">Admin</span>
      </span>
    </Link>
  );
}

export default function Sidebar({
  links,
  staff,
  signOut,
}: {
  links: NavLink[];
  staff: { username: string; role: string };
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // longest matching href wins, so /admin/users/new highlights "Create user" and not "Users"
  const active = links
    .filter((l) => pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href + "/")))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo />
        <button className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <Icon name="x" className="size-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {links.map((l) => {
          const on = l.href === active;
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={on ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                on ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Icon name={l.icon} className={`size-[18px] ${on ? "text-white" : "text-zinc-400 group-hover:text-zinc-600"}`} />
              <span className="flex-1">{l.label}</span>
              {!!l.count && (
                <span className={`rounded-full px-1.5 text-xs font-semibold tabular-nums ${on ? "bg-white/20" : "bg-amber-100 text-amber-800"}`}>{l.count}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-200 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-semibold uppercase text-zinc-600">
            {staff.username.slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{staff.username}</div>
            <Badge status={staff.role} />
          </div>
          <form action={signOut}>
            <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" title="Sign out" aria-label="Sign out">
              <Icon name="logout" className="size-[18px]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Logo />
        <button className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100" onClick={() => setOpen(true)} aria-label="Open menu">
          <Icon name="menu" className="size-5" />
        </button>
      </header>
      {/* mobile drawer */}
      {open && <div className="fixed inset-0 z-40 bg-zinc-900/30 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white transition-transform duration-200 lg:z-20 lg:w-60 lg:translate-x-0 ${
          open ? "translate-x-0 shadow-xl" : "-translate-x-full"
        }`}
      >
        {nav}
      </aside>
    </>
  );
}
