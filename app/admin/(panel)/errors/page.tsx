import Link from "next/link";
import prisma from "@/lib/db";
import { requireStaff } from "@/lib/staff";
import { Table, PageHeader, fmtDateTime, rupees } from "@/app/admin/_components/ui";

export const metadata = { title: "Errors" };

export default async function Errors() {
  await requireStaff("view_logs");
  const [failed, errors] = await Promise.all([
    prisma.payment.findMany({ where: { status: "FAILED" }, orderBy: { createdAt: "desc" }, take: 200, include: { user: true } }),
    prisma.errorLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
  ]);
  return (
    <div className="grid gap-10">
      <div>
        <PageHeader title="Failed payments" sub={`${failed.length} most recent`} />
        <Table head={["When", "Member", "Amount", "Reason"]} empty={failed.length === 0 && "No failed payments"}>
          {failed.map((x) => (
            <tr key={x.id}>
              <td className="whitespace-nowrap text-zinc-600">{fmtDateTime(x.createdAt)}</td>
              <td><Link href={`/admin/users/${x.userId}`} className="font-medium hover:underline">{x.user.displayName}</Link></td>
              <td className="tabular-nums">{rupees(x.amountPaise)}</td>
              <td className="text-rose-600">{x.failureReason ?? "—"}</td>
            </tr>
          ))}
        </Table>
      </div>
      <div>
        <PageHeader title="Errors" sub="Latest 200" />
        <Table head={["When", "Where", "Message", "Details"]} empty={errors.length === 0 && "No errors"}>
          {errors.map((e) => (
            <tr key={e.id} className="align-top">
              <td className="whitespace-nowrap text-zinc-600">{fmtDateTime(e.createdAt)}</td>
              <td><code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">{e.context}</code></td>
              <td className="max-w-md">{e.message}</td>
              <td>
                {e.details ? (
                  <details>
                    <summary className="cursor-pointer text-xs font-medium text-zinc-600 hover:text-zinc-900">Show</summary>
                    <pre className="mt-2 max-w-md overflow-x-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-2 text-xs">{JSON.stringify(e.details, null, 2)}</pre>
                  </details>
                ) : "—"}
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
