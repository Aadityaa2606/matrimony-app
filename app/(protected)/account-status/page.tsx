import { redirect } from "next/navigation";
import { getMember } from "@/lib/member";
import { AccountStatusClient } from "./AccountStatusClient";

export default async function AccountStatusPage() {
  const member = await getMember();
  if (!member) redirect("/sign-in");
  if (member.status !== "REJECTED" && member.status !== "SUSPENDED") redirect("/dashboard");
  return <AccountStatusClient status={member.status} />;
}
