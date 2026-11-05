import NextAuth, { type User } from "next-auth";
import type { StaffRole } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { normalizePhone } from "@/lib/phone";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "member",
      name: "Phone",
      credentials: {
        phone: { label: "Phone Number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const phone = normalizePhone(String(credentials?.phone ?? ""));
        const password = String(credentials?.password ?? "");
        if (!phone || !password) return null;

        const user = await prisma.user.findUnique({
          where: { phoneNumber: phone },
        });
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
          return null;
        }
        return { id: user.id, name: user.displayName };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.kind = "member";
        token.role = undefined;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.kind = token.kind;
      session.user.role = token.role;
      return session;
    },
  },
});

// Staff get their own NextAuth instance and cookie, so signing in to the member site in the same
// browser can't overwrite (and log out) an admin session, and vice versa.
export const {
  auth: staffAuth,
  signIn: staffSignIn,
  signOut: staffSignOut,
} = NextAuth({
  basePath: "/api/staff-auth",
  providers: [
    Credentials({
      id: "staff",
      name: "Staff",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!username || !password) return null;
        const staff = await prisma.staff.findUnique({ where: { username } });
        if (!staff || !staff.active || !(await bcrypt.compare(password, staff.passwordHash))) {
          return null;
        }
        return { id: staff.id, name: staff.username, role: staff.role } as User;
      },
    }),
  ],
  session: { strategy: "jwt" },
  cookies: { sessionToken: { name: "kv-staff.session-token" } },
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.kind = "staff";
        token.role = (user as { role?: StaffRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.kind = token.kind;
      session.user.role = token.role;
      return session;
    },
  },
});
