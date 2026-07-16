"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Plan {
  id: "FREE" | "PRO" | "TEAMS";
  name: string;
  price: string;
  period: string;
  description: string;
  icon: typeof Sparkles;
  accent: string;
  features: string[];
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to start",
    icon: Sparkles,
    accent: "text-muted-foreground",
    features: [
      "2 resume reviews / month",
      "1 resume version",
      "1 ATS report",
      "3 AI rewrites / day",
      "AI Career Coach",
      "Coding Practice",
      "Learning Hub",
      "PDF export",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For serious job seekers",
    icon: Crown,
    accent: "text-primary",
    highlight: true,
    features: [
      "Unlimited resumes & versions",
      "Unlimited ATS reports",
      "JD matching & rewrite",
      "LinkedIn + Naukri optimization",
      "AI Mock Interview (camera)",
      "Portfolio builder",
      "Salary predictor",
      "Word export",
      "Priority AI (faster)",
    ],
  },
  {
    id: "TEAMS",
    name: "Teams",
    price: "$49",
    period: "/month",
    description: "For colleges & agencies",
    icon: Building2,
    accent: "text-purple-500",
    features: [
      "Everything in Pro",
      "Recruiter Platform",
      "Shared templates",
      "Student dashboards",
      "Bulk resume reviews",
      "Analytics & reports",
      "Team management",
      "Custom branding",
      "Dedicated support",
    ],
  },
];

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Feature key that triggered the upgrade prompt (for context). */
  featureKey?: string;
  requiredPlan?: "PRO" | "TEAMS";
}

export function UpgradeModal({
  open,
  onOpenChange,
  featureKey,
  requiredPlan,
}: UpgradeModalProps) {
  const { update } = useSession();
  const currentPlan = useCurrentPlan();
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleUpgrade = async (plan: "PRO" | "TEAMS") => {
    setLoading(plan);
    try {
      const res = await fetch("/api/auth/upgrade", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upgrade failed");
      // Update the client session so `plan` updates everywhere
      await update({ plan });
      toast.success(`Upgraded to ${plan}! 🎉`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upgrade failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 p-0">
        <DialogHeader className="border-b p-6">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-primary" /> Upgrade your plan
          </DialogTitle>
          <DialogDescription>
            {requiredPlan
              ? `This feature requires the ${requiredPlan} plan. Choose a plan below to unlock it.`
              : "Unlock the full power of CareerOS."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-xl border p-5",
                  plan.highlight && "border-primary ring-2 ring-primary/20",
                  isCurrent && "opacity-60"
                )}
              >
                {plan.highlight && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <div className="mb-3 flex items-center gap-2">
                  <Icon className={cn("size-5", plan.accent)} />
                  <span className="font-semibold">{plan.name}</span>
                  {isCurrent && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">
                  {plan.description}
                </p>
                <ul className="mb-5 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlight ? "default" : "outline"}
                  className="w-full"
                  disabled={isCurrent || loading !== null}
                  onClick={() =>
                    plan.id !== "FREE" && handleUpgrade(plan.id as "PRO" | "TEAMS")
                  }
                >
                  {loading === plan.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : plan.id === "FREE" ? (
                    "Downgrade"
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function useCurrentPlan() {
  const { data: session } = useSession();
  return (session?.user as { plan?: string } | undefined)?.plan ?? "FREE";
}
