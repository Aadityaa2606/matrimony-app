import NextAuth from "next-auth";
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
