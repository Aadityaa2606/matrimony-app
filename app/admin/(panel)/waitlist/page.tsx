import Link from "next/link";
import prisma from "@/lib/db";
import { requireStaff } from "@/lib/staff";

export default async function Waitlist() {
  await requireStaff("view");
  const users = await prisma.user.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { updatedAt: "asc" },
    include: { profile: true },
  });
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Waitlist ({users.length})</h1>
      <table className="w-full border text-left">
        <thead><tr className="border-b"><th className="p-2">Name</th><th className="p-2">Phone</th><th className="p-2">Gender</th><th className="p-2">Waiting since</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2"><Link href={`/admin/users/${u.id}`} className="underline">{u.displayName}</Link></td>
              <td className="p-2">{u.phoneNumber}</td>
              <td className="p-2">{u.profile?.gender}</td>
              <td className="p-2">{u.updatedAt.toLocaleDateString("en-IN")}</td>
            </tr>
          ))}
          {users.length === 0 && <tr><td className="p-2" colSpan={4}>Nobody is waiting</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
