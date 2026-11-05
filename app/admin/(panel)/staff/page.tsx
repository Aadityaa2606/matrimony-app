import prisma from "@/lib/db";
import { requireStaff } from "@/lib/staff";
import { createStaff, setStaffActive, setStaffRole, resetStaffPassword } from "@/app/admin/actions";
import ActionForm from "@/app/admin/_components/ActionForm";
import { Badge, PageHeader, Table, btn, card, fmtDate, input, label, statusLabel } from "@/app/admin/_components/ui";

export const metadata = { title: "Staff" };

const ROLES = ["VIEWER", "ADMIN", "SUPER_ADMIN"];

export default async function StaffPage() {
  const me = await requireStaff("manage_staff");
  const staff = await prisma.staff.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div>
      <PageHeader title="Staff" sub="Viewers can look, admins can moderate, super admins also manage staff and see logs." />
      <section className={`${card} mb-6`}>
        <h2 className="border-b border-zinc-100 px-5 py-3.5 text-sm font-semibold">Add staff member</h2>
        <ActionForm action={createStaff} success="Staff member added" resetOnSuccess className="grid items-end gap-3 p-5 sm:grid-cols-[1fr_1fr_10rem_auto]">
          <label className={label}>Username<input name="username" autoComplete="off" placeholder="e.g. priya" required className={input} /></label>
          <label className={label}>Password<input name="password" type="password" autoComplete="new-password" placeholder="8+ characters" required minLength={8} className={input} /></label>
          <label className={label}>
            Role
            <select name="role" defaultValue="VIEWER" className={input}>
              {ROLES.map((r) => <option key={r} value={r}>{statusLabel(r)}</option>)}
            </select>
          </label>
          <button className={btn.primary}>Add</button>
        </ActionForm>
      </section>
      <Table head={["Member", "Role", "Status", "Reset password"]}>
        {staff.map((s) => (
          <tr key={s.id} className="align-middle">
            <td>
              <div className="font-medium">{s.username}{s.id === me.id && <span className="ml-1.5 text-xs font-normal text-zinc-500">(you)</span>}</div>
              <div className="text-xs text-zinc-500">Since {fmtDate(s.createdAt)}</div>
            </td>
            <td>
              <ActionForm action={setStaffRole.bind(null, s.id)} field="role" success={`Role updated for ${s.username}`} className="flex gap-1.5">
                <select name="role" defaultValue={s.role} className={`${input} w-40`}>
                  {ROLES.map((r) => <option key={r} value={r}>{statusLabel(r)}</option>)}
                </select>
                <button className={btn.secondary}>Save</button>
              </ActionForm>
            </td>
            <td>
              <ActionForm
                action={setStaffActive.bind(null, s.id, !s.active)}
                confirm={s.active ? `Deactivate ${s.username}? They will be signed out.` : undefined}
                danger={s.active}
                success={s.active ? `${s.username} deactivated` : `${s.username} activated`}
                className="flex items-center gap-2"
              >
                <Badge status={s.active ? "ACTIVE" : "SUSPENDED"}>{s.active ? "Active" : "Inactive"}</Badge>
                <button className="text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:underline">{s.active ? "Deactivate" : "Activate"}</button>
              </ActionForm>
            </td>
            <td>
              <ActionForm action={resetStaffPassword.bind(null, s.id)} field="password" success={`Password reset for ${s.username}`} resetOnSuccess className="flex gap-1.5">
                <input name="password" type="password" autoComplete="new-password" placeholder="New password" required minLength={8} className={`${input} w-40`} />
                <button className={btn.secondary}>Reset</button>
              </ActionForm>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
