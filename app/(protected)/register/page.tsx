import { redirect } from "next/navigation";
import { getMember } from "@/lib/member";
import { RegisterClient } from "./RegisterClient";

export default async function RegisterPage() {
  const member = await getMember();
  if (!member) redirect("/sign-in");
  if (member.status !== "PENDING_PROFILE") redirect("/dashboard");
  return <RegisterClient />;
}
