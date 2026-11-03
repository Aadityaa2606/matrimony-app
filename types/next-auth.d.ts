import type { StaffRole } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      kind: "member" | "staff";
      role?: StaffRole;
    } & import("next-auth").DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    kind: "member" | "staff";
    role?: StaffRole;
  }
}
