import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {
  findUserByEmail,
  findUserById,
  findAccountByProvider,
  createAccount,
  updateAccount,
  deleteAccount,
  findSessionByToken,
  createSession,
  updateSession,
  deleteSession,
  type SupabaseUser,
} from "@/lib/supabase-client";

/**
 * NextAuth configuration for CareerOS.
 * Uses Supabase REST API (PostgREST) instead of Prisma for database access.
 * This works from any network (no direct PostgreSQL connection needed).
 */

// Custom adapter using Supabase REST API
const supabaseAdapter = {
  async getUserByEmail(email: string) {
    return findUserByEmail(email);
  },
  async getUserById(id: string) {
    return findUserById(id);
  },
  async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
    const account = await findAccountByProvider(provider, providerAccountId);
    if (!account) return null;
    return findUserById(account.userId);
  },
  async createUser(user: Partial<SupabaseUser>) {
    // Handled by signup route
    return user as SupabaseUser;
  },
  async updateUser(user: Partial<SupabaseUser> & { id: string }) {
    // Updates handled by specific routes
    return user as SupabaseUser;
  },
  async linkAccount(account: Partial<SupabaseUser>) {
    await createAccount(account);
    return account;
  },
  async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
    const account = await findAccountByProvider(provider, providerAccountId);
    if (account) await deleteAccount(account.id);
  },
  async createSession(session: { sessionToken: string; userId: string; expires: Date }) {
    await createSession(session);
    return session;
  },
  async getSession(sessionToken: string) {
    return findSessionByToken(sessionToken);
  },
  async updateSession(session: { sessionToken: string; expires: Date }) {
    await updateSession(session.sessionToken, { expires: session.expires.toISOString() });
    return session;
  },
  async deleteSession(sessionToken: string) {
    await deleteSession(sessionToken);
  },
  async createVerificationToken(data: { identifier: string; token: string; expires: Date }) {
    // Implemented in supabase-client if needed
    return data;
  },
  async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
    return null;
  },
};

export const authOptions: NextAuthOptions = {
  adapter: supabaseAdapter as never,
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
        const user = await findUserByEmail(credentials.email.toLowerCase());
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
      if (user) {
        const u = user as { role?: string; plan?: string; onboarded?: boolean; title?: string };
        token.role = u.role ?? "JOBSEEKER";
        token.plan = u.plan ?? "FREE";
        token.onboarded = u.onboarded ?? false;
        token.title = u.title;
      }
      if (trigger === "update") {
        const dbUser = await findUserById(token.sub!);
        if (dbUser) {
          token.onboarded = dbUser.onboarded;
          token.role = dbUser.role;
          token.plan = dbUser.plan;
          token.title = (dbUser as { title?: string }).title;
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
