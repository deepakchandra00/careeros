import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Returns analytics for the current user: module usage breakdown, AI calls,
 * resume stats, recent activity (from audit logs). For the MVP we synthesize
 * realistic data + real audit-log entries where available.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Real audit-log activity (last 20 entries for this user)
    const logs = await db.auditLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Synthesized usage data (in production these come from real usage counters)
    const moduleUsage = [
      { module: "Resume Builder", visits: 47, actions: 12 },
      { module: "AI Career Coach", visits: 23, actions: 89 },
      { module: "Coding Practice", visits: 18, actions: 34 },
      { module: "ATS Review", visits: 9, actions: 5 },
      { module: "Job Tracker", visits: 14, actions: 7 },
      { module: "Learning Hub", visits: 11, actions: 22 },
      { module: "Mock Interview", visits: 4, actions: 4 },
      { module: "LinkedIn Optimizer", visits: 3, actions: 2 },
    ];

    const aiCalls = {
      total: 156,
      byType: [
        { type: "Resume Rewrite", count: 42 },
        { type: "Coach Chat", count: 89 },
        { type: "ATS Review", count: 5 },
        { type: "Code Review", count: 12 },
        { type: "JD Match", count: 4 },
        { type: "Interview Score", count: 4 },
      ],
      trend: [12, 18, 22, 15, 28, 34, 27], // last 7 days
    };

    const resumeStats = {
      versions: 3,
      avgAtsScore: 87,
      bestAtsScore: 94,
      totalDownloads: 11,
    };

    return Response.json({
      moduleUsage,
      aiCalls,
      resumeStats,
      recentActivity: logs.map((l) => ({
        action: l.action,
        entity: l.entity,
        timestamp: l.createdAt.toISOString(),
      })),
      streak: { current: 7, longest: 12 },
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Analytics failed" },
      { status: 500 }
    );
  }
}
