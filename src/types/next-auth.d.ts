import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      plan: string;
      onboarded: boolean;
      title?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    plan: string;
    onboarded: boolean;
    title?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    plan: string;
    onboarded: boolean;
    title?: string | null;
  }
}
