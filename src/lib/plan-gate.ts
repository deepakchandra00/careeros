"use client";

import { useSession } from "next-auth/react";
import { useFeatureFlags } from "@/store/feature-flags";

export type Plan = "FREE" | "PRO" | "TEAMS";

const PLAN_RANK: Record<Plan, number> = { FREE: 0, PRO: 1, TEAMS: 2 };

/**
 * Returns the current user's plan from the session, defaulting to FREE.
 */
export function usePlan(): Plan {
  const { data: session } = useSession();
  const plan = (session?.user as { plan?: string } | undefined)?.plan;
  return (plan as Plan) ?? "FREE";
}

/**
 * Check whether a feature is available for the current user's plan.
 * Uses the feature-flags store (tier field) + the user's plan.
 */
export function usePlanGate() {
  const plan = usePlan();
  const flags = useFeatureFlags((s) => s.flags);

  return {
    plan,
    canUse: (featureKey: string): boolean => {
      const flag = flags.find((f) => f.key === featureKey);
      if (!flag) return true; // unknown features default to allowed
      if (!flag.enabled) return false; // globally disabled
      return PLAN_RANK[plan] >= PLAN_RANK[flag.tier];
    },
    /** Returns the minimum plan required for a feature, or null if free. */
    requiredPlan: (featureKey: string): Plan | null => {
      const flag = flags.find((f) => f.key === featureKey);
      if (!flag || flag.tier === "FREE") return null;
      return flag.tier;
    },
  };
}
