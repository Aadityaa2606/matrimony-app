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

const btn = "rounded border px-3 py-1";

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
  const fmt = (d: Date | null) => d?.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) ?? "-";
  return (
    <div className="grid max-w-3xl gap-6">
      <h1 className="text-xl font-semibold">{user.displayName}</h1>
      <table className="border text-left">
        <tbody>
          {([
            ["Phone", user.phoneNumber], ["Status", status], ["Expires", fmt(user.expiresAt)],
            ["Approved", fmt(user.approvedAt)], ["Joined", fmt(user.createdAt)],
            ...(p ? [
              ["Full name", p.fullName], ["Gender", p.gender], ["Date of birth", p.dateOfBirth.toLocaleDateString("en-IN")],
              ["Height", p.height], ["Education", p.education], ["Profession", p.profession], ["Salary", p.salary ?? "-"],
              ["Location", p.location], ["Community", p.community], ["Sub-caste", p.subCaste ?? "-"],
              ["Horoscope", p.hasHoroscope ? "Yes" : "No"], ["Parent contact", p.parentContact],
            ] : []),
          ] as [string, string][]).map(([k, v]) => (
            <tr key={k} className="border-b"><th className="p-2 font-normal text-gray-600">{k}</th><td className="p-2">{v}</td></tr>
          ))}
        </tbody>
      </table>
      {p && (
        <div className="flex flex-wrap gap-2">
          {[p.profilePhoto, ...p.additionalPhotos].map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className="h-32 w-32 rounded border object-cover" />
          ))}
        </div>
      )}
      <section>
        <h2 className="mb-2 font-semibold">Payments</h2>
        <table className="w-full border text-left">
          <thead><tr className="border-b"><th className="p-2">Date</th><th className="p-2">Method</th><th className="p-2">Status</th><th className="p-2">Amount</th></tr></thead>
          <tbody>
            {user.payments.map((x) => (
              <tr key={x.id} className="border-b">
                <td className="p-2">{fmt(x.paidAt ?? x.createdAt)}</td><td className="p-2">{x.method}</td>
                <td className="p-2">{x.status}</td><td className="p-2">₹{x.amountPaise / 100}</td>
              </tr>
            ))}
            {user.payments.length === 0 && <tr><td className="p-2" colSpan={4}>No payments</td></tr>}
          </tbody>
        </table>
      </section>
      {mod && (
        <>
          <section className="grid gap-3">
            <h2 className="font-semibold">Actions</h2>
            <div className="flex flex-wrap gap-2">
              <ActionForm action={approveUser.bind(null, id)}><button className={btn}>Approve</button></ActionForm>
              <ActionForm action={rejectUser.bind(null, id)} confirm="Disapprove this user?"><button className={btn}>Disapprove</button></ActionForm>
              <ActionForm action={suspendUser.bind(null, id)} confirm="Suspend this user?"><button className={btn}>Suspend</button></ActionForm>
              <ActionForm action={unsuspendUser.bind(null, id)}><button className={btn}>Unsuspend</button></ActionForm>
              <ActionForm action={markPaid.bind(null, id)} confirm="Record a manual payment for this user?"><button className={btn}>Mark paid</button></ActionForm>
            </div>
            <ActionForm action={setExpiry.bind(null, id)} field="date" className="flex gap-2">
              <input type="date" name="date" className="rounded border p-1" />
              <button className={btn}>Set expiry</button>
            </ActionForm>
            <ActionForm action={resetMemberPassword.bind(null, id)} field="password" className="flex gap-2">
              <input type="password" name="password" placeholder="New password (min 8)" className="rounded border p-1" />
              <button className={btn}>Reset password</button>
            </ActionForm>
          </section>
          <section>
            <h2 className="mb-2 font-semibold">{p ? "Edit profile" : "Add profile"}</h2>
            <ActionForm action={saveMemberProfile.bind(null, id)} className="grid gap-2">
              <ProfileFields profile={p} />
              <button className={`${btn} w-fit`}>Save profile</button>
            </ActionForm>
          </section>
        </>
      )}
    </div>
  );
}
