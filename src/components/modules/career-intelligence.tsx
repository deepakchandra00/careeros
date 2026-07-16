"use client";

import * as React from "react";
import {
  Brain,
  FileText,
  Linkedin,
  Briefcase,
  Github,
  Globe,
  Mic,
  Code2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  IndianRupee,
  ArrowRight,
  RefreshCw,
  Plug,
  Zap,
  Award,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ModuleHeader,
  AIButton,
  ScoreRing,
  Pill,
  AIEmptyState,
  TypingDots,
} from "@/components/shared/blocks";
import { useAI } from "@/components/shared/utils";
import { useResumeStore } from "@/store/resume-store";
import { useAppStore } from "@/store/app-store";
import { MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";
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

/* ---------------- Types ---------------- */

type Trend = "Improving" | "Stable" | "Needs Work";
type Priority = "High" | "Medium" | "Low";

interface ScoreEntry {
  score: number;
  label: string;
  status: string;
  connected?: boolean;
}

interface CareerIntelResult {
  careerHealth: {
    score: number;
    percentile: number;
    trend: Trend;
    summary: string;
  };
  scores: {
    resume: ScoreEntry;
    linkedin: ScoreEntry;
    naukri: ScoreEntry;
    github: ScoreEntry & { connected: boolean };
    portfolio: ScoreEntry & { connected: boolean };
    interview: ScoreEntry;
    coding: ScoreEntry;
  };
  salaryPotential: {
    low: number;
    high: number;
    median: number;
    currency: string;
  };
  topMatchingRoles: {
    title: string;
    matchScore: number;
    stars: number;
    reason: string;
  }[];
  weeklyInsight: string;
  actionItems: {
    priority: Priority;
    action: string;
    module: string;
  }[];
}

/* ---------------- Helpers ---------------- */

const TREND_META: Record<
  Trend,
  { icon: React.ComponentType<{ className?: string }>; tone: "good" | "info" | "warn"; label: string }
> = {
  Improving: { icon: TrendingUp, tone: "good", label: "Improving" },
  Stable: { icon: Minus, tone: "info", label: "Stable" },
  "Needs Work": { icon: TrendingDown, tone: "warn", label: "Needs Work" },
};

const PRIORITY_TONE: Record<Priority, "bad" | "warn" | "info"> = {
  High: "bad",
  Medium: "warn",
  Low: "info",
};

function statusTone(status: string): "good" | "warn" | "bad" | "info" {
  const s = (status || "").toLowerCase();
  if (s.includes("excel") || s.includes("strong") || s.includes("great")) return "good";
  if (s.includes("good")) return "good";
  if (s.includes("fair") || s.includes("moderate") || s.includes("average")) return "warn";
  if (s.includes("poor") || s.includes("weak") || s.includes("low")) return "bad";
  return "info";
}

interface ScoreCardDef {
  key: keyof CareerIntelResult["scores"];
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  accent: string;
}

const SCORE_CARDS: ScoreCardDef[] = [
  { key: "resume", icon: FileText, iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", accent: "oklch(0.62 0.15 162)" },
  { key: "linkedin", icon: Linkedin, iconBg: "bg-sky-500/15 text-sky-600 dark:text-sky-400", accent: "oklch(0.6 0.16 230)" },
  { key: "naukri", icon: Briefcase, iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400", accent: "oklch(0.75 0.16 70)" },
  { key: "github", icon: Github, iconBg: "bg-slate-500/15 text-slate-700 dark:text-slate-300", accent: "oklch(0.55 0.02 260)" },
  { key: "portfolio", icon: Globe, iconBg: "bg-purple-500/15 text-purple-600 dark:text-purple-400", accent: "oklch(0.6 0.18 320)" },
  { key: "interview", icon: Mic, iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400", accent: "oklch(0.65 0.2 20)" },
  { key: "coding", icon: Code2, iconBg: "bg-teal-500/15 text-teal-600 dark:text-teal-400", accent: "oklch(0.6 0.13 195)" },
];

function buildResumeText(d: ReturnType<typeof useResumeStore.getState>["data"]): string {
  return [
    `${d.name} — ${d.title}`,
    `${d.email} | ${d.phone} | ${d.location}`,
    `LinkedIn: ${d.linkedin} | GitHub: ${d.github} | Web: ${d.website}`,
    "",
    "SUMMARY",
    d.summary,
    "",
    "EXPERIENCE",
    ...d.experience.map(
      (e) =>
        `${e.role} @ ${e.company} (${e.start}–${e.end})\n${e.bullets
          .map((b) => "- " + b)
          .join("\n")}`,
    ),
    "",
    "SKILLS",
    d.skills.join(", "),
    "",
    "PROJECTS",
    ...d.projects.map(
      (p) => `- ${p.name}: ${p.description} [${p.tech.join(", ")}]`,
    ),
    "",
    "EDUCATION",
    ...d.education.map(
      (e) => `- ${e.degree}, ${e.school} (${e.start}–${e.end}), ${e.grade}`,
    ),
    "",
    "CERTIFICATIONS",
    ...d.certifications.map((c) => `- ${c.title} — ${c.subtitle} (${c.date})`),
  ].join("\n");
}

/* ---------------- Subcomponents ---------------- */

function ScoreBreakdownCard({
  def,
  entry,
}: {
  def: ScoreCardDef;
  entry: ScoreEntry;
}) {
  const Icon = def.icon;
  const disconnected = entry.connected === false;
  return (
    <Card className="relative overflow-hidden transition-colors hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className={cn("grid size-9 place-items-center rounded-lg", def.iconBg)}>
            <Icon className="size-4" />
          </div>
          {disconnected ? (
            <Pill tone="default">Not connected</Pill>
          ) : (
            <Pill tone={statusTone(entry.status)}>{entry.status}</Pill>
          )}
        </div>

        <div className="mt-3">
          <p className="text-sm font-medium leading-tight">{entry.label}</p>
          {disconnected ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Connect to unlock your score and insights.
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              {entry.score >= 80
                ? "Strong — keep it up"
                : entry.score >= 50
                  ? "Decent — room to grow"
                  : "Needs attention"}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          {disconnected ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                toast.info(`Connecting ${entry.label}…`, {
                  description: "OAuth flow would launch here.",
                })
              }
            >
              <Plug className="size-3.5" /> Connect
            </Button>
          ) : (
            <ScoreRing value={entry.score} size={64} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StarsRow({ count }: { count: number }) {
  const clamped = Math.max(0, Math.min(5, Math.round(count)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`${clamped} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i <= clamped
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground",
          )}
        />
      ))}
    </div>
  );
}

/* ---------------- Main ---------------- */

export function CareerIntelligenceModule() {
  const d = useResumeStore((s) => s.data);
  const setModule = useAppStore((s) => s.setModule);

  const resumeText = React.useMemo(() => buildResumeText(d), [d]);

  const { data, loading, error, run } = useAI<CareerIntelResult>();

  const analyze = React.useCallback(() => {
    run("/api/ai/career-intelligence", {
      resumeText,
      atsScore: 91,
      linkedinScore: 88,
      naukriScore: 84,
      interviewReadiness: 82,
      codingScore: 75,
    });
  }, [resumeText, run]);

  const openModule = React.useCallback(
    (name: string) => {
      toast.info(`Opening ${name}…`);
      const target = name.toLowerCase().trim();
      const match = MODULES.find(
        (m) =>
          m.label.toLowerCase() === target ||
          m.short.toLowerCase() === target ||
          m.label.toLowerCase().includes(target) ||
          target.includes(m.short.toLowerCase()),
      );
      if (match) setModule(match.id);
    },
    [setModule],
  );

  const salaryChart = React.useMemo(() => {
    if (!data?.salaryPotential) return [];
    const s = data.salaryPotential;
    return [
      { name: "Low", value: s.low, fill: "oklch(0.75 0.16 70)" },
      { name: "Median", value: s.median, fill: "oklch(0.95 0.95 0)" },
      { name: "High", value: s.high, fill: "oklch(0.6 0.18 280)" },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Brain}
        title="Career Intelligence"
        description="Your unified career health, score breakdown & matching roles"
      >
        {data && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={analyze}
            disabled={loading}
          >
            <RefreshCw className="size-3.5" /> Re-run
          </Button>
        )}
      </ModuleHeader>

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
              Synthesizing resume, LinkedIn, Naukri & interview signals…
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {!loading && !data && !error && (
        <Card>
          <CardContent className="py-8">
            <AIEmptyState
              icon={Brain}
              title="Unlock your Career Intelligence"
              description="Combine your resume, LinkedIn, Naukri, and more into one unified career health score."
            />
            <div className="mt-6 flex justify-center">
              <AIButton onClick={analyze} loading={loading} disabled={loading}>
                Generate Analysis
              </AIButton>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-6">
          {/* A. Hero: Career Health Score */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-600 via-primary to-teal-500 text-primary-foreground">
            <div className="absolute inset-0 opacity-25">
              <div className="animate-blob absolute -right-10 -top-10 size-64 rounded-full bg-white/30 blur-3xl" />
              <div className="animate-blob absolute -bottom-20 left-1/3 size-72 rounded-full bg-teal-200/30 blur-3xl [animation-delay:3s]" />
            </div>
            <CardContent className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:items-center">
              <div className="flex flex-col items-center gap-4">
                <ScoreRing
                  value={data.careerHealth.score}
                  size={160}
                  label="Health"
                />
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge className="border-0 bg-white/15 text-primary-foreground backdrop-blur">
                    <Award className="mr-1 size-3" /> Better than{" "}
                    {data.careerHealth.percentile}% of peers
                  </Badge>
                  {(() => {
                    const t = TREND_META[data.careerHealth.trend] ?? TREND_META.Stable;
                    const TIcon = t.icon;
                    return (
                      <Badge className="border-0 bg-white/15 text-primary-foreground backdrop-blur">
                        <TIcon className="mr-1 size-3" /> {t.label}
                      </Badge>
                    );
                  })()}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-0 bg-white/15 text-primary-foreground backdrop-blur">
                    <Sparkles className="mr-1 size-3" /> Career Health Score
                  </Badge>
                  <Badge className="border-0 bg-white/10 text-primary-foreground/90 backdrop-blur">
                    {d.name} · {d.title}
                  </Badge>
                </div>
                <p className="text-lg font-medium leading-relaxed text-primary-foreground/95 sm:text-xl">
                  {data.careerHealth.summary}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <AIButton
                    onClick={analyze}
                    loading={loading}
                    disabled={loading}
                    variant="secondary"
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    Re-run Analysis
                  </AIButton>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                    onClick={() =>
                      toast.info("Full report coming soon", {
                        description: "Export to PDF will be available in the next release.",
                      })
                    }
                  >
                    <ArrowRight className="size-3.5" /> Export report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* B. Score Breakdown Grid */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Target className="size-4" /> Score Breakdown
              </h2>
              <span className="text-xs text-muted-foreground">
                {SCORE_CARDS.length} signals combined
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {SCORE_CARDS.map((def) => {
                const entry = data.scores[def.key];
                if (!entry) return null;
                return (
                  <ScoreBreakdownCard key={def.key} def={def} entry={entry} />
                );
              })}
            </div>
          </section>

          {/* C. Salary Potential */}
          {data.salaryPotential && (
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-teal-600 via-emerald-600 to-primary text-primary-foreground">
              <div className="absolute -top-12 -left-12 size-48 rounded-full bg-white/15 blur-3xl" />
              <CardContent className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
                <div>
                  <Badge className="mb-3 border-0 bg-white/15 text-primary-foreground backdrop-blur">
                    <IndianRupee className="mr-1 size-3" /> Salary Potential
                  </Badge>
                  <p className="text-sm text-primary-foreground/80">
                    Estimated total compensation range
                  </p>
                  <h2 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                    ₹{data.salaryPotential.low}
                    <span className="mx-1 text-primary-foreground/60">–</span>₹
                    {data.salaryPotential.high}
                    <span className="ml-2 text-lg font-medium text-primary-foreground/80">
                      LPA
                    </span>
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur">
                      <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70">
                        Median
                      </p>
                      <p className="text-xl font-bold">
                        ₹{data.salaryPotential.median} LPA
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur">
                      <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70">
                        Currency
                      </p>
                      <p className="text-xl font-bold">
                        {data.salaryPotential.currency}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 px-4 py-2 backdrop-blur">
                      <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70">
                        Spread
                      </p>
                      <p className="text-xl font-bold">
                        ₹{data.salaryPotential.high - data.salaryPotential.low} LPA
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                  <p className="mb-2 text-xs text-primary-foreground/80">
                    Salary distribution (LPA)
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={salaryChart}
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
                        {salaryChart.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* D. Top Matching Roles */}
          {data.topMatchingRoles?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Star className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Top Matching Roles</CardTitle>
                    <CardDescription className="text-xs">
                      Roles aligned with your profile & momentum
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {data.topMatchingRoles.map((role, i) => (
                    <div
                      key={role.title + i}
                      className="flex items-start gap-4 rounded-xl border border-border/70 bg-card/60 p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
                    >
                      <div className="shrink-0">
                        <ScoreRing value={role.matchScore} size={64} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium leading-tight">{role.title}</p>
                          <StarsRow count={role.stars} />
                        </div>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          {role.reason}
                        </p>
                        <div className="mt-2">
                          <Pill tone="good">{role.matchScore}% match</Pill>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* E. Weekly Insight */}
          {data.weeklyInsight && (
            <Card className="relative overflow-hidden border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-fuchsia-500/10 to-pink-500/10">
              <div className="absolute -top-10 -right-10 size-44 rounded-full bg-purple-500/20 blur-3xl" />
              <div className="absolute -bottom-12 -left-8 size-40 rounded-full bg-fuchsia-500/15 blur-3xl" />
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300">
                    <Sparkles className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-purple-600/80 dark:text-purple-300/80">
                        Weekly Insight
                      </p>
                      <Badge className="border-0 bg-purple-500/15 text-purple-600 dark:text-purple-300">
                        <Zap className="mr-1 size-3" /> Personalized
                      </Badge>
                    </div>
                    <p className="mt-2 text-base font-medium leading-relaxed sm:text-lg">
                      {data.weeklyInsight}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* F. Action Items */}
          {data.actionItems?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Target className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Action Items</CardTitle>
                    <CardDescription className="text-xs">
                      Prioritized next steps to lift your career health
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {data.actionItems.map((item, i) => (
                    <li
                      key={i}
                      className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <Pill tone={PRIORITY_TONE[item.priority]}>{item.priority}</Pill>
                        <p className="text-sm leading-snug text-foreground/90">
                          {item.action}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1.5"
                        onClick={() => openModule(item.module)}
                      >
                        {item.module}
                        <ArrowRight className="size-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
