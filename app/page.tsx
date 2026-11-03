import { redirect } from "next/navigation";
import { getMember } from "@/lib/member";

export default async function RootPage() {
  redirect((await getMember()) ? "/dashboard" : "/welcome");
}
