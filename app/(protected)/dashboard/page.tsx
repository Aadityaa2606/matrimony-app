import { redirect } from "next/navigation";
import { landingPath } from "@/lib/lifecycle";
import { getMember } from "@/lib/member";

export default async function DashboardPage() {
  const member = await getMember();
  redirect(member ? landingPath(member.status) : "/sign-in");
}
