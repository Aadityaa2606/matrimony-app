import { redirect } from "next/navigation";
import { getStaff } from "@/lib/staff";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function StaffLogin() {
  if (await getStaff()) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_top,#fff_0%,#f4f4f5_70%)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 grid size-12 place-items-center rounded-xl bg-[#8e1b2c] text-sm font-bold text-white shadow-lg shadow-[#8e1b2c]/20">KV</span>
          <h1 className="text-xl font-semibold tracking-tight">Sign in to Admin</h1>
          <p className="mt-1 text-sm text-zinc-500">Kalyana Varan Matrimony staff</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
