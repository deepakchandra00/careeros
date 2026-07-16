import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** PATCH /api/auth/onboarding — complete onboarding (set title + mark onboarded). */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { title } = (await req.json()) as { title?: string };
    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        title: title?.trim() || null,
        onboarded: true,
      },
    });
    return NextResponse.json({
      onboarded: user.onboarded,
      title: user.title,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Onboarding update failed" },
      { status: 500 }
    );
  }
}
