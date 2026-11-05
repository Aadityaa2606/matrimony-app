import { staffSignOut } from "@/lib/auth";
import prisma from "@/lib/db";
import { can } from "@/lib/permissions";
import { requireStaff } from "@/lib/staff";
import Sidebar, { type NavLink } from "@/app/admin/_components/Sidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff("view");
  const waiting = await prisma.user.count({ where: { status: "PENDING_REVIEW" } });
  const links: NavLink[] = [
    { label: "Dashboard", href: "/admin", icon: "home" },
    { label: "Waitlist", href: "/admin/waitlist", icon: "clock", count: waiting },
    { label: "Users", href: "/admin/users", icon: "users" },
    ...(can(staff.role, "moderate") ? [{ label: "Create user", href: "/admin/users/new", icon: "userPlus" } as NavLink] : []),
    { label: "Chats", href: "/admin/chats", icon: "chat" },
    { label: "Blocks", href: "/admin/blocks", icon: "ban" },
    { label: "Payments", href: "/admin/payments", icon: "card" },
    ...(can(staff.role, "manage_staff")
      ? ([
          { label: "Staff", href: "/admin/staff", icon: "shield" },
          { label: "Activity", href: "/admin/activity", icon: "list" },
          { label: "Errors", href: "/admin/errors", icon: "alert" },
        ] as NavLink[])
      : []),
  ];
  return (
    <div className="min-h-screen lg:pl-60">
      <Sidebar
        links={links}
        staff={staff}
        signOut={async () => {
          "use server";
          await staffSignOut({ redirectTo: "/admin/login" });
        }}
      />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
