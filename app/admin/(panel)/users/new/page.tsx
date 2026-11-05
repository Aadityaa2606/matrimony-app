import { can } from "@/lib/permissions";
import { requireStaff } from "@/lib/staff";
import { createMember } from "@/app/admin/actions";
import ActionForm from "@/app/admin/_components/ActionForm";
import ProfileFields from "@/app/admin/_components/ProfileFields";
import { Empty, PageHeader, btn, card, input, label } from "@/app/admin/_components/ui";

export const metadata = { title: "Create user" };

export default async function NewUser() {
  const staff = await requireStaff("view");
  if (!can(staff.role, "moderate")) return <div className={card}><Empty text="You don't have access to create users" /></div>;
  return (
    <div className="max-w-3xl">
      <PageHeader title="Create user" sub="Add a member who signed up over the phone or in person." />
      <ActionForm action={createMember} redirectTo="/admin/users/{id}" success="Member created" className="grid gap-6">
        <section className={card}>
          <h2 className="border-b border-zinc-100 px-5 py-3.5 text-sm font-semibold">Account</h2>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <label className={label}>Name<input name="name" required maxLength={60} className={input} /></label>
            <label className={label}>Phone<input name="phone" type="tel" inputMode="numeric" placeholder="10-digit mobile" required className={input} /></label>
            <label className={label}>Password<input name="password" type="password" autoComplete="new-password" placeholder="8+ characters" required minLength={8} className={input} /></label>
            <label className="flex items-center gap-2.5 self-end rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700">
              <input name="markPaid" type="checkbox" className="size-4 accent-zinc-900" /> Mark as paid
            </label>
          </div>
        </section>
        <section className={card}>
          <h2 className="border-b border-zinc-100 px-5 py-3.5 text-sm font-semibold">Profile</h2>
          <div className="p-5"><ProfileFields /></div>
        </section>
        <div className="flex justify-end">
          <button className={btn.primary}>Create member</button>
        </div>
      </ActionForm>
    </div>
  );
}
