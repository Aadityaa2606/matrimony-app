import { redirect } from "next/navigation";
import MainShell from "@/components/MainShell";
import { landingPath } from "@/lib/lifecycle";
import { getMember } from "@/lib/member";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const member = await getMember();
  if (!member) redirect("/sign-in");
  if (member.status !== "ACTIVE") redirect(landingPath(member.status));
  return <MainShell expiresAt={member.expiresAt?.toISOString() ?? null}>{children}</MainShell>;
}
