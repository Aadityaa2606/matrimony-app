import { can } from "@/lib/permissions";
import { requireStaff } from "@/lib/staff";
import { createMember } from "@/app/admin/actions";
import ActionForm from "@/app/admin/_components/ActionForm";
import ProfileFields from "@/app/admin/_components/ProfileFields";

export default async function NewUser() {
  const staff = await requireStaff("view");
  if (!can(staff.role, "moderate")) return <p>You don&apos;t have access to create users</p>;
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Create user</h1>
      <ActionForm action={createMember} redirectTo="/admin/users/{id}" className="grid max-w-xl gap-2">
        <input name="name" placeholder="Name" className="rounded border p-1" />
        <input name="phone" placeholder="Phone" className="rounded border p-1" />
        <input name="password" type="password" placeholder="Password (min 8)" className="rounded border p-1" />
        <label className="flex items-center gap-2"><input name="markPaid" type="checkbox" /> Mark as paid</label>
        <ProfileFields />
        <button className="w-fit rounded border px-3 py-1">Create</button>
      </ActionForm>
    </div>
  );
}
