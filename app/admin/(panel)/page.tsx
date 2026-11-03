import { requireStaff } from "@/lib/staff";

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const staff = await requireStaff("view");
  const { denied } = await searchParams;
  return (
    <div>
      {denied === "1" && <p className="mb-4 text-red-600">You don&apos;t have access to that page</p>}
      <h1 className="text-xl font-semibold">Welcome, {staff.username}</h1>
    </div>
  );
}
