import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { can } from "@/lib/permissions";
import { requireStaff } from "@/lib/staff";
import { effectiveStatus } from "@/lib/lifecycle";
import {
  approveUser, rejectUser, suspendUser, unsuspendUser, markPaid, setExpiry, resetMemberPassword, saveMemberProfile,
} from "@/app/admin/actions";
import ActionForm from "@/app/admin/_components/ActionForm";
import ProfileFields from "@/app/admin/_components/ProfileFields";
import { Avatar, Badge, Empty, Icon, btn, card, fmtDate, fmtDateTime, input, rupees } from "@/app/admin/_components/ui";

function Section({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`${card} ${className}`}>
      <h2 className="border-b border-zinc-100 px-5 py-3.5 text-sm font-semibold">{title}</h2>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Fields({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-xs font-medium text-zinc-500">{k}</dt>
          <dd className="mt-0.5 break-words text-zinc-900">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff("view");
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true, payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!user) notFound();
  const status = effectiveStatus(user, new Date());
  const mod = can(staff.role, "moderate");
  const p = user.profile;
  const name = user.displayName;
  // Only offer moves the lifecycle allows from the current state (see lib/lifecycle.ts).
  const canApprove = user.status === "PENDING_REVIEW" || user.status === "REJECTED";
  const canReject = user.status === "PENDING_PROFILE" || user.status === "PENDING_REVIEW";
  return (
    <div className="grid gap-6">
      <Link href="/admin/users" className="inline-flex w-fit items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
        <Icon name="left" /> Users
      </Link>

      <div className={`${card} flex flex-col gap-5 p-5 md:flex-row md:items-center`}>
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Avatar name={name} src={p?.profilePhoto} size="size-16" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight">{name}</h1>
              <Badge status={status} />
            </div>
            <div className="mt-1 text-sm text-zinc-500">
              <a href={`tel:${user.phoneNumber}`} className="hover:text-zinc-900">{user.phoneNumber}</a> · Joined {fmtDate(user.createdAt)}
            </div>
          </div>
        </div>
        {mod && (
          <div className="flex flex-wrap gap-2">
            {canReject && (
              <ActionForm action={rejectUser.bind(null, id)} confirm={`Disapprove ${name}?`} danger success="Disapproved">
                <button className={btn.danger}>Disapprove</button>
              </ActionForm>
            )}
            {user.status === "ACTIVE" && (
              <ActionForm action={suspendUser.bind(null, id)} confirm={`Suspend ${name}? They will lose access immediately.`} danger success="Suspended">
                <button className={btn.danger}>Suspend</button>
              </ActionForm>
            )}
            {user.status === "SUSPENDED" && (
              <ActionForm action={unsuspendUser.bind(null, id)} success="Access restored">
                <button className={btn.secondary}>Unsuspend</button>
              </ActionForm>
            )}
            <ActionForm action={markPaid.bind(null, id)} confirm={`Record a manual payment for ${name}?`} success="Payment recorded">
              <button className={btn.secondary}><Icon name="card" />Mark paid</button>
            </ActionForm>
            {canApprove && (
              <ActionForm action={approveUser.bind(null, id)} success={`${name} approved`}>
                <button className={btn.success}><Icon name="check" />Approve</button>
              </ActionForm>
            )}
          </div>
        )}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <Section title="Profile">
            {p ? (
              <Fields
                rows={[
                  ["Full name", p.fullName], ["Gender", p.gender === "BRIDE" ? "Bride" : "Groom"],
                  ["Date of birth", fmtDate(p.dateOfBirth)], ["Height", p.height],
                  ["Education", p.education], ["Profession", p.profession],
                  ["Salary", p.salary], ["Location", p.location],
                  ["Community", p.community], ["Sub-caste", p.subCaste],
                  ["Horoscope", p.hasHoroscope ? "Yes" : "No"],
                  ["Parent contact", <a key="pc" href={`tel:${p.parentContact}`} className="hover:underline">{p.parentContact}</a>],
                ]}
              />
            ) : (
              <p className="text-sm text-zinc-500">No profile yet.{mod && " Add one below."}</p>
            )}
          </Section>

          {p && (
            <Section title="Photos">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {[p.profilePhoto, ...p.additionalPhotos].map((src, i) => (
                  <a key={src} href={src} target="_blank" rel="noreferrer" className="group relative block aspect-square overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="size-full object-cover transition group-hover:scale-105" />
                    {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">Main</span>}
                  </a>
                ))}
              </div>
            </Section>
          )}

          <section className={`${card} overflow-hidden`}>
            <h2 className="border-b border-zinc-100 px-5 py-3.5 text-sm font-semibold">Payments</h2>
            {user.payments.length === 0 ? (
              <Empty text="No payments yet" />
            ) : (
              <ul className="divide-y divide-zinc-100">
                {user.payments.map((x) => (
                  <li key={x.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div>
                      <div className="font-medium tabular-nums">{rupees(x.amountPaise)}</div>
                      <div className="text-xs text-zinc-500">{fmtDateTime(x.paidAt ?? x.createdAt)} · {x.method === "MANUAL" ? "Manual" : "Razorpay"}</div>
                    </div>
                    <Badge status={x.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="grid gap-6">
          <Section title="Membership">
            <dl className="grid gap-3 text-sm">
              {([["Status", <Badge key="s" status={status} />], ["Expires", fmtDate(user.expiresAt)], ["Approved", fmtDate(user.approvedAt)], ["Joined", fmtDateTime(user.createdAt)]] as const).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <dt className="text-zinc-500">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            {mod && user.status === "ACTIVE" && (
              <ActionForm action={setExpiry.bind(null, id)} field="date" success="Expiry updated" className="mt-5 grid gap-1.5 border-t border-zinc-100 pt-5">
                <span className="text-xs font-medium text-zinc-500">Change expiry date</span>
                <div className="flex gap-2">
                  <input type="date" name="date" required defaultValue={user.expiresAt?.toISOString().slice(0, 10)} className={input} />
                  <button className={btn.secondary}>Save</button>
                </div>
              </ActionForm>
            )}
          </Section>

          {mod && (
            <Section title="Reset password">
              <ActionForm action={resetMemberPassword.bind(null, id)} field="password" success="Password reset" resetOnSuccess className="grid gap-2">
                <input type="password" name="password" autoComplete="new-password" placeholder="New password (8+ characters)" required minLength={8} className={input} />
                <button className={`${btn.secondary} w-full`}>Reset password</button>
              </ActionForm>
              <p className="mt-2 text-xs text-zinc-500">Tell the member their new password over the phone.</p>
            </Section>
          )}
        </div>
      </div>

      {mod && (
        <details className={`${card} group`} open={!p}>
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-sm font-semibold">
            {p ? "Edit profile" : "Add profile"}
            <Icon name="right" className="size-4 text-zinc-400 transition group-open:rotate-90" />
          </summary>
          <div className="border-t border-zinc-100 p-5">
            <ActionForm action={saveMemberProfile.bind(null, id)} success="Profile saved" className="grid gap-5">
              <ProfileFields profile={p} />
              <div className="flex justify-end border-t border-zinc-100 pt-4">
                <button className={btn.primary}>Save profile</button>
              </div>
            </ActionForm>
          </div>
        </details>
      )}
    </div>
  );
}
