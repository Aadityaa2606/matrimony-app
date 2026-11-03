import prisma from "@/lib/db";
import { requireStaff } from "@/lib/staff";
import { createStaff, setStaffActive, setStaffRole, resetStaffPassword } from "@/app/admin/actions";
import ActionForm from "@/app/admin/_components/ActionForm";

const ROLES = ["VIEWER", "ADMIN", "SUPER_ADMIN"];

export default async function StaffPage() {
  const me = await requireStaff("manage_staff");
  const staff = await prisma.staff.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Staff ({staff.length})</h1>
      <ActionForm action={createStaff} className="mb-6 flex flex-wrap items-start gap-2">
        <input name="username" placeholder="Username" required className="rounded border p-1" />
        <input name="password" type="password" placeholder="Password (8+ characters)" required minLength={8} className="rounded border p-1" />
        <select name="role" defaultValue="VIEWER" className="rounded border p-1">
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
        <button className="rounded border px-3 py-1">Add staff</button>
      </ActionForm>
      <table className="w-full border text-left">
        <thead><tr className="border-b"><th className="p-2">Username</th><th className="p-2">Role</th><th className="p-2">Status</th><th className="p-2">Created</th><th className="p-2">Reset password</th></tr></thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.id} className="border-b align-top">
              <td className="p-2">{s.username}{s.id === me.id && " (you)"}</td>
              <td className="p-2">
                <ActionForm action={setStaffRole.bind(null, s.id)} field="role" className="flex gap-1">
                  <select name="role" defaultValue={s.role} className="rounded border p-1">
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                  <button className="rounded border px-2">Save</button>
                </ActionForm>
              </td>
              <td className="p-2">
                <ActionForm action={setStaffActive.bind(null, s.id, !s.active)}>
                  {s.active ? "Active" : "Inactive"}{" "}
                  <button className="underline">{s.active ? "Deactivate" : "Activate"}</button>
                </ActionForm>
              </td>
              <td className="p-2">{s.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
              <td className="p-2">
                <ActionForm action={resetStaffPassword.bind(null, s.id)} field="password" className="flex gap-1">
                  <input name="password" type="password" placeholder="New password" required minLength={8} className="rounded border p-1" />
                  <button className="rounded border px-2">Reset</button>
                </ActionForm>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
