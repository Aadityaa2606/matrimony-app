import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "./_components/Toaster";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = { title: { default: "Admin · Kalyana Varan", template: "%s · KV Admin" } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.className} min-h-screen bg-zinc-50 text-zinc-900 antialiased [--ring:#a1a1aa] [--sk-a:#f4f4f5] [--sk-b:#e9e9eb]`}>
      {children}
      <Toaster />
    </div>
  );
}
