"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  CreditCard,
  Check,
  X,
  Crown,
  Building2,
  Sparkles,
  Loader2,
  Download,
  HelpCircle,
  CalendarDays,
  Zap,
} from "lucide-react";
import { ModuleHeader, Pill } from "@/components/shared/blocks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type PlanId = "FREE" | "PRO" | "TEAMS";

const PLAN_RANK: Record<PlanId, number> = { FREE: 0, PRO: 1, TEAMS: 2 };

interface Plan {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: typeof Sparkles;
  accent: string;
  highlight?: boolean;
  features: string[];
  limits: { label: string; value: string }[];
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
    limits: [
      { label: "AI rewrites", value: "3 / day" },
      { label: "Resume versions", value: "1" },
      { label: "ATS reports", value: "1 / mo" },
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
    limits: [
      { label: "AI rewrites", value: "Unlimited" },
      { label: "Resume versions", value: "Unlimited" },
      { label: "ATS reports", value: "Unlimited" },
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
    limits: [
      { label: "Team seats", value: "Up to 25" },
      { label: "Bulk reviews", value: "Unlimited" },
      { label: "Support", value: "Dedicated" },
    ],
  },
];

type RowValue = boolean | string;

const COMPARISON_ROWS: { feature: string; free: RowValue; pro: RowValue; teams: RowValue }[] = [
  { feature: "Resume versions", free: "1", pro: "Unlimited", teams: "Unlimited" },
  { feature: "ATS reports", free: "1 / mo", pro: "Unlimited", teams: "Unlimited" },
  { feature: "AI rewrites", free: "3 / day", pro: "Unlimited", teams: "Unlimited" },
  { feature: "AI Career Coach", free: true, pro: true, teams: true },
  { feature: "Coding Practice", free: true, pro: true, teams: true },
  { feature: "Learning Hub", free: true, pro: true, teams: true },
  { feature: "PDF export", free: true, pro: true, teams: true },
  { feature: "JD matching & rewrite", free: false, pro: true, teams: true },
  { feature: "LinkedIn + Naukri optimization", free: false, pro: true, teams: true },
  { feature: "AI Mock Interview (camera)", free: false, pro: true, teams: true },
  { feature: "Portfolio builder", free: false, pro: true, teams: true },
  { feature: "Salary predictor", free: false, pro: true, teams: true },
  { feature: "Word export", free: false, pro: true, teams: true },
  { feature: "Priority AI (faster)", free: false, pro: true, teams: true },
  { feature: "Recruiter Platform", free: false, pro: false, teams: true },
  { feature: "Team management", free: false, pro: false, teams: true },
  { feature: "Bulk resume reviews", free: false, pro: false, teams: true },
  { feature: "Custom branding", free: false, pro: false, teams: true },
  { feature: "Dedicated support", free: false, pro: false, teams: true },
];

interface Invoice {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: "paid" | "pending" | "refunded";
}

const INVOICES: Invoice[] = [
  { id: "INV-2024-011", date: "Nov 1, 2024", plan: "Pro", amount: "$12.00", status: "paid" },
  { id: "INV-2024-010", date: "Oct 1, 2024", plan: "Pro", amount: "$12.00", status: "paid" },
  { id: "INV-2024-009", date: "Sep 1, 2024", plan: "Pro", amount: "$12.00", status: "paid" },
  { id: "INV-2024-008", date: "Aug 1, 2024", plan: "Free", amount: "$0.00", status: "paid" },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes. Upgrades take effect immediately and you get instant access to the new features. Downgrades take effect at the end of your current billing cycle.",
  },
  {
    q: "How does AI CareerOS billing work?",
    a: "Plans are billed monthly on the same date each month. You can cancel anytime — you keep access until the end of your paid period. No hidden fees.",
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "Your data is always safe. If you have more resume versions than the Free plan allows, the oldest drafts are archived (not deleted) and you can re-upgrade to restore them.",
  },
  {
    q: "Do you offer student or NGO discounts?",
    a: "Yes. Verified students get 50% off Pro, and registered NGOs get Teams at Pro pricing. Reach out from the in-app chat with your credentials to activate it.",
  },
];

export function PricingModule() {
  const { data: session, update } = useSession();
  const currentPlan = (session?.user?.plan as PlanId | undefined) ?? "FREE";
  const [loadingPlan, setLoadingPlan] = React.useState<PlanId | null>(null);

  const currentMeta = PLANS.find((p) => p.id === currentPlan) ?? PLANS[0];

  const handleChange = async (plan: PlanId) => {
    if (plan === currentPlan) return;
    setLoadingPlan(plan);
    const isUpgrade = PLAN_RANK[plan] > PLAN_RANK[currentPlan];
    try {
      const res = await fetch("/api/auth/upgrade", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = (await res.json()) as { plan?: string; error?: string };
      if (!res.ok) throw new Error(json.error || "Plan change failed");
      await update({ plan });
      toast.success(
        isUpgrade
          ? `Upgraded to ${plan}! 🎉`
          : `Switched to ${plan}. Changes apply at next cycle.`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Plan change failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={CreditCard}
        title="Plans & Billing"
        description="Upgrade or manage your subscription"
      >
        <Badge variant="secondary" className="gap-1">
          <CalendarDays className="size-3" /> Renews Dec 1
        </Badge>
      </ModuleHeader>

      {/* Current plan banner */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-emerald-600 to-emerald-500 text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <div className="animate-blob absolute -right-10 -top-10 size-64 rounded-full bg-white/30 blur-3xl" />
          <div className="animate-blob absolute -bottom-20 left-1/3 size-72 rounded-full bg-emerald-200/30 blur-3xl [animation-delay:3s]" />
        </div>
        <CardContent className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge className="border-0 bg-white/15 text-primary-foreground backdrop-blur">
                Current Plan
              </Badge>
              <Pill tone="good">
                <span className="text-primary-foreground">Active</span>
              </Pill>
            </div>
            <div className="flex items-center gap-3">
              <currentMeta.icon className="size-7" />
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {currentMeta.name}
              </h2>
              <span className="text-lg text-primary-foreground/80">
                {currentMeta.price}
                {currentMeta.period !== "forever" && (
                  <span className="text-sm"> {currentMeta.period}</span>
                )}
              </span>
            </div>
            <p className="mt-2 max-w-lg text-sm text-primary-foreground/85">
              {currentMeta.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {currentMeta.limits.map((l) => (
                <span
                  key={l.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur"
                >
                  <Zap className="size-3" />
                  {l.label}: <strong>{l.value}</strong>
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span className="text-primary-foreground/80">Next billing date</span>
              <span className="font-semibold">Dec 1, 2024</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-primary-foreground/80">Payment method</span>
              <span className="font-semibold">•••• 4242</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-primary-foreground/80">Billing email</span>
              <span className="font-semibold">
                {session?.user?.email ?? "you@example.com"}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-1 border-white/30 bg-white/10 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
              onClick={() => toast.info("Opening payment portal…")}
            >
              Manage payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.id === currentPlan;
          const isUpgrade = PLAN_RANK[plan.id] > PLAN_RANK[currentPlan];
          const isLoading = loadingPlan === plan.id;
          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col",
                plan.highlight && "border-primary ring-2 ring-primary/20",
                isCurrent && "ring-1 ring-primary/40"
              )}
            >
              {plan.highlight && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className={cn("size-5", plan.accent)} />
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="mb-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <ul className="mb-5 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  disabled={isCurrent || loadingPlan !== null}
                  onClick={() => handleChange(plan.id)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Processing…
                    </>
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : isUpgrade ? (
                    `Upgrade to ${plan.name}`
                  ) : (
                    "Downgrade"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan comparison</CardTitle>
          <CardDescription>
            Everything you get in each plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[42%]">Feature</TableHead>
                <TableHead className="text-center">Free</TableHead>
                <TableHead className="text-center">
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Crown className="size-3.5" /> Pro
                  </span>
                </TableHead>
                <TableHead className="text-center">Teams</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPARISON_ROWS.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell className="font-medium">{row.feature}</TableCell>
                  {([row.free, row.pro, row.teams] as RowValue[]).map((v, i) => (
                    <TableCell key={i} className="text-center">
                      {v === true ? (
                        <Check className="mx-auto size-4 text-primary" />
                      ) : v === false ? (
                        <X className="mx-auto size-4 text-muted-foreground/40" />
                      ) : (
                        <span className="text-sm">{v}</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Billing history */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Billing history</CardTitle>
            <CardDescription>Download your past invoices</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => toast.info("Exporting all invoices as CSV…")}
          >
            Export all
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVOICES.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs font-medium">
                    {inv.id}
                  </TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>{inv.plan}</TableCell>
                  <TableCell>{inv.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        inv.status === "paid" &&
                          "border-primary/30 bg-primary/10 text-primary",
                        inv.status === "pending" &&
                          "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                        inv.status === "refunded" &&
                          "border-muted bg-muted text-muted-foreground"
                      )}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() =>
                        toast.success(`Downloading ${inv.id}.pdf…`)
                      }
                    >
                      <Download className="size-3.5" /> PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HelpCircle className="size-4 text-primary" /> Frequently asked
            questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
