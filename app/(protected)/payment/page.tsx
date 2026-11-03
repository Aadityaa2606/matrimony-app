import { redirect } from "next/navigation";
import { getMember } from "@/lib/member";
import { membershipAmountPaise } from "@/lib/razorpay";
import { PaymentClient } from "./PaymentClient";

export default async function PaymentPage() {
  const member = await getMember();
  if (!member) redirect("/sign-in");
  const renew = member.status === "EXPIRED" || member.status === "ACTIVE";
  return <PaymentClient renew={renew} amount={membershipAmountPaise() / 100} />;
}
