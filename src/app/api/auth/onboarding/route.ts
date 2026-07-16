import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateUser } from "@/lib/supabase-client";

export const runtime = "nodejs";

/** PATCH /api/auth/onboarding — complete onboarding (mark onboarded). */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await updateUser(session.user.id, { onboarded: true });
    return NextResponse.json({ onboarded: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Onboarding update failed" },
      { status: 500 }
    );
  }
}
