import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateUser } from "@/lib/supabase-client";

export const runtime = "nodejs";

/**
 * Upgrade the current user's plan. In production this would be called after a
 * Stripe/Razorpay webhook confirms payment. For the MVP it's a direct upgrade
 * so the plan-gating UX can be demonstrated end-to-end.
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { plan } = (await req.json()) as { plan: string };
    if (!["FREE", "PRO", "TEAMS"].includes(plan)) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }
    await updateUser(session.user.id, { plan });
    return Response.json({ plan });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Upgrade failed" },
      { status: 500 }
    );
  }
}
