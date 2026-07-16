import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/**
 * NextAuth configuration for CareerOS.
 * - Google OAuth + email/password credentials
 * - JWT session strategy (works for both provider types)
 * - Role/plan/onboarded carried in the token and exposed on session.user
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          plan: user.plan,
          onboarded: user.onboarded,
        } as never;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On first sign-in `user` is present — persist role/plan/onboarded
      if (user) {
        const u = user as { role?: string; plan?: string; onboarded?: boolean; title?: string };
        token.role = u.role ?? "JOBSEEKER";
        token.plan = u.plan ?? "FREE";
        token.onboarded = u.onboarded ?? false;
        token.title = u.title;
      }
      // Refresh onboarded state on session update
      if (trigger === "update") {
        const dbUser = await db.user.findUnique({ where: { id: token.sub! } });
        if (dbUser) {
          token.onboarded = dbUser.onboarded;
          token.role = dbUser.role;
          token.plan = dbUser.plan;
          token.title = dbUser.title;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { plan?: string }).plan = token.plan as string;
        (session.user as { onboarded?: boolean }).onboarded = token.onboarded as boolean;
        (session.user as { title?: string }).title = token.title as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
};

export type AppSession = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
    plan: string;
    onboarded: boolean;
    title?: string | null;
  };
};
