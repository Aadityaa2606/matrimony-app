import Link from "next/link";
import prisma from "@/lib/db";
import { can } from "@/lib/permissions";
import { requireStaff } from "@/lib/staff";
import { approveUser, rejectUser } from "@/app/admin/actions";
import ActionForm from "@/app/admin/_components/ActionForm";
import { Avatar, Empty, Icon, PageHeader, ago, btn, card } from "@/app/admin/_components/ui";

export const metadata = { title: "Waitlist" };

const age = (dob: Date, now: Date) => Math.floor((+now - +dob) / (365.25 * 86400000));

export default async function Waitlist() {
  const staff = await requireStaff("view");
  const mod = can(staff.role, "moderate");
  const now = new Date();
  const users = await prisma.user.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { updatedAt: "asc" },
    include: { profile: true, payments: { where: { status: "PAID" }, select: { id: true }, take: 1 } },
  });
  return (
    <div>
      <PageHeader title="Waitlist" sub={users.length ? `${users.length} member${users.length > 1 ? "s" : ""} waiting for review, oldest first` : undefined} />
      {users.length === 0 ? (
        <div className={card}><Empty text="Nobody is waiting. You're all caught up." /></div>
      ) : (
        <div className="grid gap-3">
          {users.map((u) => {
            const p = u.profile;
            return (
              <div key={u.id} className={`${card} flex flex-col gap-4 p-4 sm:flex-row sm:items-center`}>
                <Link href={`/admin/users/${u.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <Avatar name={u.displayName} src={p?.profilePhoto} size="size-14" />
                  <div className="min-w-0">
                    <div className="truncate font-medium hover:underline">{p?.fullName ?? u.displayName}</div>
                    <div className="mt-0.5 text-sm text-zinc-500">
                      {[p && (p.gender === "BRIDE" ? "Bride" : "Groom"), p && `${age(p.dateOfBirth, now)} yrs`, p?.location?.split(",")[0], u.phoneNumber]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1"><Icon name="clock" className="size-3.5" /> Waiting {ago(u.updatedAt, now).replace(" ago", "")}</span>
                      {u.payments.length === 0 && <span className="font-medium text-rose-600">No payment recorded</span>}
                    </div>
                  </div>
                </Link>
                <div className="flex gap-2 sm:shrink-0">
                  <Link href={`/admin/users/${u.id}`} className={`${btn.secondary} flex-1 sm:flex-none`}>View</Link>
                  {mod && (
                    <>
                      <ActionForm action={rejectUser.bind(null, u.id)} confirm={`Disapprove ${u.displayName}?`} danger success="Disapproved" className="flex flex-1 sm:flex-none">
                        <button className={`${btn.danger} w-full`}>Disapprove</button>
                      </ActionForm>
                      <ActionForm action={approveUser.bind(null, u.id)} success={`${u.displayName} approved`} className="flex flex-1 sm:flex-none">
                        <button className={`${btn.success} w-full`}><Icon name="check" />Approve</button>
                      </ActionForm>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
