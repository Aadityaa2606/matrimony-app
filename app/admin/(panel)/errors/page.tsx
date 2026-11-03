import Link from "next/link";
import prisma from "@/lib/db";
import { requireStaff } from "@/lib/staff";

const dt = (d: Date) => d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

export default async function Errors() {
  await requireStaff("view_logs");
  const [failed, errors] = await Promise.all([
    prisma.payment.findMany({ where: { status: "FAILED" }, orderBy: { createdAt: "desc" }, take: 200, include: { user: true } }),
    prisma.errorLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
  ]);
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Failed payments ({failed.length})</h1>
      <table className="mb-8 w-full border text-left">
        <thead><tr className="border-b"><th className="p-2">When</th><th className="p-2">Member</th><th className="p-2">Amount</th><th className="p-2">Reason</th></tr></thead>
        <tbody>
          {failed.map((x) => (
            <tr key={x.id} className="border-b">
              <td className="p-2">{dt(x.createdAt)}</td>
              <td className="p-2"><Link href={`/admin/users/${x.userId}`} className="underline">{x.user.displayName}</Link></td>
              <td className="p-2">₹{x.amountPaise / 100}</td>
              <td className="p-2">{x.failureReason ?? "-"}</td>
            </tr>
          ))}
          {failed.length === 0 && <tr><td className="p-2" colSpan={4}>No failed payments</td></tr>}
        </tbody>
      </table>
      <h1 className="mb-4 text-xl font-semibold">Errors (latest 200)</h1>
      <table className="w-full border text-left">
        <thead><tr className="border-b"><th className="p-2">When</th><th className="p-2">Where</th><th className="p-2">Message</th><th className="p-2">Details</th></tr></thead>
        <tbody>
          {errors.map((e) => (
            <tr key={e.id} className="border-b align-top">
              <td className="p-2">{dt(e.createdAt)}</td>
              <td className="p-2">{e.context}</td>
              <td className="p-2">{e.message}</td>
              <td className="p-2">
                {e.details ? <details><summary className="cursor-pointer underline">Show</summary><pre className="mt-1 whitespace-pre-wrap text-sm">{JSON.stringify(e.details, null, 2)}</pre></details> : "-"}
              </td>
            </tr>
          ))}
          {errors.length === 0 && <tr><td className="p-2" colSpan={4}>No errors</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
