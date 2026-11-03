import Link from "next/link";
import { signOut } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { requireStaff } from "@/lib/staff";

const NAV = [
  ["Home", "/admin"],
  ["Waitlist", "/admin/waitlist"],
  ["Users", "/admin/users"],
  ["Create user", "/admin/users/new"],
  ["Chats", "/admin/chats"],
  ["Blocks", "/admin/blocks"],
  ["Payments", "/admin/payments"],
];
const SUPER_NAV = [
  ["Staff", "/admin/staff"],
  ["Activity", "/admin/activity"],
  ["Errors", "/admin/errors"],
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff("view");
  const links = can(staff.role, "manage_staff") ? [...NAV, ...SUPER_NAV] : NAV;
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-52 flex-col gap-1 border-r p-4">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="py-1 hover:underline">
            {label}
          </Link>
        ))}
        <div className="mt-auto border-t pt-3 text-sm">
          <div>{staff.username}</div>
          <div className="text-gray-500">{staff.role}</div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button className="mt-2 underline">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
