"use client";

import * as React from "react";
import {
  IndianRupee,
  TrendingUp,
  Building2,
  Sparkles,
  Gift,
  GitCompareArrows,
  RefreshCw,
  DollarSign,
  Briefcase,
  MapPin,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AIButton,
  AIEmptyState,
  ModuleHeader,
  Pill,
  TypingDots,
} from "@/components/shared/blocks";
import { useAI } from "@/components/shared/utils";
import { useResumeStore } from "@/store/resume-store";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DemandLevel = "Very High" | "High" | "Medium" | "Low";

interface SalaryResult {
  marketSalaryINR: { low: number; high: number; median: number };
  marketSalaryUSD: { low: number; high: number };
  topCompanies: string[];
  demandLevel: DemandLevel;
  growthOutlook: string;
  negotiationTips: string[];
  perks: string[];
  comparableRoles: string[];
}

const DEMAND_TONE: Record<DemandLevel, "good" | "info" | "warn" | "bad"> = {
  "Very High": "good",
  High: "good",
  Medium: "info",
  Low: "warn",
};

const COMPANY_COLORS = [
  "oklch(0.62 0.15 162)",
  "oklch(0.7 0.15 70)",
  "oklch(0.6 0.18 280)",
  "oklch(0.75 0.16 50)",
  "oklch(0.65 0.2 340)",
  "oklch(0.58 0.18 200)",
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function SalaryModule() {
  const d = useResumeStore((s) => s.data);

  const [role, setRole] = React.useState(d.title);
  const [experienceYears, setExperienceYears] = React.useState(6);
  const [location, setLocation] = React.useState("Bengaluru");
  const [skills, setSkills] = React.useState(d.skills.join(", "));
  const [currentCtcLPA, setCurrentCtcLPA] = React.useState<string>("");

  const { data, loading, error, run } = useAI<SalaryResult>();

  const predict = () => {
    run("/api/ai/salary", {
      role: role.trim() || d.title,
      experienceYears: Number(experienceYears) || 0,
      location: location.trim() || "Bengaluru",
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      currentCtcLPA: currentCtcLPA
        ? Number(currentCtcLPA)
        : undefined,
    });
  };

  const inr = data?.marketSalaryINR;
  const usd = data?.marketSalaryUSD;
  const chartData = inr
    ? [
        { name: "Low", value: inr.low, fill: "oklch(0.7 0.15 70)" },
        { name: "Median", value: inr.median, fill: "oklch(0.62 0.15 162)" },
        { name: "High", value: inr.high, fill: "oklch(0.6 0.18 280)" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={IndianRupee}
        title="Salary Predictor"
        description="Know your market worth across India & global"
      >
        {data && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={predict}
            disabled={loading}
          >
            <RefreshCw className="size-3.5" /> Re-predict
          </Button>
        )}
      </ModuleHeader>

      {/* Input form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your profile</CardTitle>
          <CardDescription className="text-xs">
            Defaults pulled from your resume — tweak as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="role" className="gap-1.5">
                <Briefcase className="size-3.5 text-muted-foreground" />
                Role
              </Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Senior Frontend Engineer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp" className="gap-1.5">
                <TrendingUp className="size-3.5 text-muted-foreground" />
                Experience (years)
              </Label>
              <Input
                id="exp"
                type="number"
                min={0}
                max={40}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc" className="gap-1.5">
                <MapPin className="size-3.5 text-muted-foreground" />
                Location
              </Label>
              <Input
                id="loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bengaluru"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="skills" className="gap-1.5">
                <Sparkles className="size-3.5 text-muted-foreground" />
                Skills (comma-separated)
              </Label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, Next.js"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ctc" className="gap-1.5">
                <IndianRupee className="size-3.5 text-muted-foreground" />
                Current CTC (LPA, optional)
              </Label>
              <Input
                id="ctc"
                type="number"
                min={0}
                value={currentCtcLPA}
                onChange={(e) => setCurrentCtcLPA(e.target.value)}
                placeholder="e.g. 28"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end">
            <AIButton onClick={predict} loading={loading} disabled={loading}>
              {data ? "Re-predict Salary" : "Predict Salary"}
            </AIButton>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-500/40 bg-red-500/5">
          <CardContent className="py-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && !data && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
            <TypingDots />
            <p className="text-sm text-muted-foreground">
              Benchmarking your worth against the live market…
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {!loading && !data && !error && (
        <AIEmptyState
          icon={IndianRupee}
          title="No prediction yet"
          description="Add your profile and hit Predict to get an INR + USD salary range, demand level, top companies, and negotiation tips."
        />
      )}

      {/* Results */}
      {data && inr && (
        <div className="space-y-6">
          {/* Hero card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-600 via-primary to-teal-500 text-primary-foreground">
            <div className="absolute inset-0 opacity-25">
              <div className="animate-blob absolute -right-10 -top-10 size-64 rounded-full bg-white/30 blur-3xl" />
              <div className="animate-blob absolute -bottom-20 left-1/3 size-72 rounded-full bg-teal-200/30 blur-3xl [animation-delay:3s]" />
            </div>
            <CardContent className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <Badge className="mb-3 border-0 bg-white/15 text-primary-foreground backdrop-blur">
                  <Sparkles className="mr-1 size-3" /> Market range · {role}
                </Badge>
                <p className="text-sm text-primary-foreground/80">
                  Estimated total compensation
                </p>
                <h2 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                  ₹{inr.low}
                  <span className="mx-1 text-primary-foreground/60">–</span>₹
                  {inr.high}
                  <span className="ml-2 text-lg font-medium text-primary-foreground/80">
                    LPA
                  </span>
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70">
                      Median
                    </p>
                    <p className="text-xl font-bold">₹{inr.median} LPA</p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur">
                    <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary-foreground/70">
                      <DollarSign className="size-3" /> USD
                    </p>
                    <p className="text-xl font-bold">
                      ${usd?.low}K–${usd?.high}K
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70">
                      Demand
                    </p>
                    <p className="text-xl font-bold">{data.demandLevel}</p>
                  </div>
                </div>
                <p className="mt-4 flex items-start gap-2 text-sm text-primary-foreground/85">
                  <TrendingUp className="mt-0.5 size-4 shrink-0" />
                  {data.growthOutlook}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <p className="mb-2 text-xs text-primary-foreground/80">
                  INR salary distribution (LPA)
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(1 0 0 / 0.15)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="oklch(1 0 0 / 0.7)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="oklch(1 0 0 / 0.7)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "oklch(1 0 0 / 0.08)" }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid oklch(1 0 0 / 0.2)",
                        background: "oklch(0.16 0.02 200)",
                        color: "white",
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`₹${v} LPA`, "Range"]}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={64}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Demand + outlook row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Demand level</p>
                <div className="mt-2">
                  <Pill tone={DEMAND_TONE[data.demandLevel]}>
                    {data.demandLevel}
                  </Pill>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Median (INR)</p>
                <p className="mt-1 text-2xl font-bold">₹{inr.median} LPA</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">US range</p>
                <p className="mt-1 text-2xl font-bold">
                  ${usd?.low}K–${usd?.high}K
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Growth outlook</p>
                <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug">
                  {data.growthOutlook}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top companies */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Top companies hiring</CardTitle>
                  <CardDescription className="text-xs">
                    For {role} in {location}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {data.topCompanies?.length ? (
                  data.topCompanies.map((c, i) => {
                    const color = COMPANY_COLORS[i % COMPANY_COLORS.length];
                    return (
                      <button
                        key={c + i}
                        onClick={() => toast.info(`${c} — openings coming soon`)}
                        className="group flex items-center gap-2.5 rounded-xl border border-border/70 bg-card/60 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-accent/40"
                      >
                        <span
                          className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: color }}
                        >
                          {initials(c)}
                        </span>
                        <span className="text-sm font-medium">{c}</span>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No companies listed.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Negotiation + Perks */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-amber-500/20 bg-amber-500/[0.04]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <TrendingUp className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Negotiation tips</CardTitle>
                    <CardDescription className="text-xs">
                      Maximize your offer
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {data.negotiationTips?.length ? (
                    data.negotiationTips.map((tip, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 rounded-lg border border-amber-500/15 bg-amber-500/[0.06] p-3 text-sm"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span className="text-foreground/90">{tip}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tips.</p>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-purple-500/[0.04]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
                    <Gift className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Common perks</CardTitle>
                    <CardDescription className="text-xs">
                      Beyond base pay
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.perks?.length ? (
                    data.perks.map((p, i) => (
                      <Pill key={i} tone="info">
                        <Gift className="mr-1 size-3" />
                        {p}
                      </Pill>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No perks.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparable roles */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <GitCompareArrows className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Comparable roles</CardTitle>
                  <CardDescription className="text-xs">
                    Worth exploring next
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.comparableRoles?.length ? (
                  data.comparableRoles.map((r, i) => (
                    <Pill key={i} tone="good">
                      {r}
                    </Pill>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No suggestions.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
