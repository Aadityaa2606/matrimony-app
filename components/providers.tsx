"use client";

import { SessionProvider } from "next-auth/react";
import { ChatProvider } from "@/components/ChatProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChatProvider>{children}</ChatProvider>
    </SessionProvider>
  );
}
