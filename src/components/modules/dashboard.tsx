"use client";

import * as React from "react";
import {
  TrendingUp,
  FileText,
  Target,
  Mic,
  Send,
  ListChecks,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Zap,
  Trophy,
  Calendar,
  IndianRupee,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/store/app-store";
import { useResumeStore } from "@/store/resume-store";
import { ScoreRing } from "@/components/shared/blocks";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
} from "recharts";
import { cn } from "@/lib/utils";

const STATS = [
  {
    id: "ats",
    label: "ATS Score",
    value: 91,
    suffix: "/100",
    icon: Target,
    delta: "+8",
    color: "oklch(0.62 0.15 162)",
    module: "resume-review" as const,
  },
  {
    id: "versions",
    label: "Resume Versions",
    value: 5,
    icon: FileText,
    delta: "+1",
    color: "oklch(0.7 0.15 70)",
    module: "versions" as const,
  },
  {
    id: "matches",
    label: "Job Matches",
    value: 34,
    icon: TrendingUp,
    delta: "+12",
    color: "oklch(0.6 0.18 280)",
    module: "job-search" as const,
  },
  {
    id: "interview",
    label: "Interview Ready",
    value: 82,
    suffix: "%",
    icon: Mic,
    delta: "+15%",
    color: "oklch(0.75 0.16 50)",
    module: "interview" as const,
  },
  {
    id: "applications",
    label: "Applications",
    value: 23,
    icon: ListChecks,
    delta: "+5",
    color: "oklch(0.65 0.2 340)",
    module: "job-tracker" as const,
  },
  {
    id: "profile",
    label: "Profile Strength",
    value: 96,
    suffix: "%",
    icon: ShieldCheck,
    delta: "+4%",
    color: "oklch(0.62 0.15 162)",
    module: "linkedin" as const,
  },
];

const ACTIVITIES = [
  {
    icon: FileText,
    title: "Resume Updated",
    desc: "“Senior Frontend Engineer” version saved",
    time: "2h ago",
    tone: "primary" as const,
  },
  {
    icon: TrendingUp,
    title: "New Job Match",
    desc: "Staff Engineer at Atlassian — 94% match",
    time: "5h ago",
    tone: "amber" as const,
  },
  {
    icon: Calendar,
    title: "Interview Tomorrow",
    desc: "System Design round · Walmart Global Tech",
    time: "1d ago",
    tone: "purple" as const,
  },
  {
    icon: IndianRupee,
    title: "Salary Insights",
    desc: "Market range updated: 42–58 LPA",
    time: "2d ago",
    tone: "emerald" as const,
  },
];

const SKILL_TREND = [
  { month: "Jan", score: 62, interviews: 3 },
  { month: "Feb", score: 68, interviews: 5 },
  { month: "Mar", score: 71, interviews: 4 },
  { month: "Apr", score: 78, interviews: 7 },
  { month: "May", score: 84, interviews: 6 },
  { month: "Jun", score: 91, interviews: 9 },
];

const INTERVIEW_DATA = [{ name: "Ready", value: 82, fill: "oklch(0.62 0.15 162)" }];

const COACH_PROMPTS = [
  "Why am I not getting calls?",
  "Review my resume",
  "Optimize my LinkedIn",
  "Negotiate my salary",
  "Write a resignation letter",
];

export function DashboardModule() {
  const setModule = useAppStore((s) => s.setModule);
  const name = useResumeStore((s) => s.data.name);
  const firstName = name.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-emerald-600 to-emerald-500 text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <div className="animate-blob absolute -right-10 -top-10 size-64 rounded-full bg-white/30 blur-3xl" />
          <div className="animate-blob absolute -bottom-20 left-1/3 size-72 rounded-full bg-emerald-200/30 blur-3xl [animation-delay:3s]" />
        </div>
        <CardContent className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <Badge className="mb-3 border-0 bg-white/15 text-primary-foreground backdrop-blur">
              <Sparkles className="mr-1 size-3" /> AI CareerOS · Pro
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {firstName} 👋
            </h1>
            <p className="mt-2 max-w-lg text-sm text-primary-foreground/85">
              Your career is on track. You&apos;re in the top{" "}
              <strong>9%</strong> of applicants this month. 3 recruiters viewed
              your profile today.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                className="border-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={() => setModule("resume-builder")}
              >
                <Zap className="mr-1 size-3.5" /> Build Resume
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/30 bg-white/10 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
                onClick={() => setModule("resume-review")}
              >
                <Target className="mr-1 size-3.5" /> Run ATS Scan
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/30 bg-white/10 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
                onClick={() => setModule("coach")}
              >
                <Sparkles className="mr-1 size-3.5" /> Ask AI Coach
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur">
            <ScoreRing value={91} size={130} label="ATS" suffix="" />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-amber-300" />
                <span>Top 9% applicants</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="size-4" />
                <span>3 profile views today</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-200" />
                <span>+29% callback rate</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.id}
              className="group cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setModule(s.module)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div
                    className="grid size-9 place-items-center rounded-lg"
                    style={{ backgroundColor: `${s.color}1a`, color: s.color }}
                  >
                    <Icon className="size-4" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="gap-0.5 bg-primary/10 text-[10px] font-semibold text-primary"
                  >
                    <ArrowUpRight className="size-2.5" />
                    {s.delta}
                  </Badge>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight">
                  {s.value}
                  {s.suffix && (
                    <span className="text-sm font-medium text-muted-foreground">
                      {s.suffix}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Growth chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">Career Growth</CardTitle>
              <CardDescription className="text-xs">
                ATS score & interview activity · last 6 months
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="size-3 text-primary" /> +29 pts
            </Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={SKILL_TREND} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.15 162)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.62 0.15 162)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.7 0.02 200 / 0.15)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="oklch(0.55 0.02 200)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="oklch(0.55 0.02 200)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.7 0.02 200 / 0.2)",
                    background: "oklch(0.2 0.018 200)",
                    color: "white",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="oklch(0.62 0.15 162)"
                  strokeWidth={2.5}
                  fill="url(#scoreGrad)"
                  name="ATS Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Interview readiness radial */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Interview Readiness</CardTitle>
            <CardDescription className="text-xs">
              Based on prep + matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                innerRadius="68%"
                outerRadius="100%"
                data={INTERVIEW_DATA}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar background dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="-mt-32 text-center">
              <p className="text-3xl font-bold">82%</p>
              <p className="text-xs text-muted-foreground">Ready to interview</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-6 w-full"
              onClick={() => setModule("interview")}
            >
              Start Mock Interview <ChevronRight className="ml-1 size-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: activity + coach */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {ACTIVITIES.map((a, i) => {
              const Icon = a.icon;
              const toneMap = {
                primary: "bg-primary/15 text-primary",
                amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                purple: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
                emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
              };
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/50"
                >
                  <div
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-lg",
                      toneMap[a.tone]
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.desc}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {a.time}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* AI Coach widget */}
        <Card className="flex flex-col border-primary/30 bg-gradient-to-b from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base">AI Career Coach</CardTitle>
                <CardDescription className="text-xs">
                  Ask anything, 24/7
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3">
            <div className="flex flex-1 flex-col gap-2">
              {COACH_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setModule("coach")}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-left text-xs transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-3 text-primary" />
                    {p}
                  </span>
                  <ChevronRight className="size-3 text-muted-foreground" />
                </button>
              ))}
            </div>
            <Button
              className="gap-1.5"
              onClick={() => setModule("coach")}
            >
              <Send className="size-3.5" /> Open Coach
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Module shortcuts */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Quick access
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[
            { label: "JD Optimizer", desc: "Match any job", icon: Target, m: "jd-optimizer" as const },
            { label: "LinkedIn", desc: "Optimize profile", icon: ShieldCheck, m: "linkedin" as const },
            { label: "Salary", desc: "Know your worth", icon: IndianRupee, m: "salary" as const },
            { label: "Job Tracker", desc: "Kanban board", icon: ListChecks, m: "job-tracker" as const },
          ].map((q) => {
            const Icon = q.icon;
            return (
              <Card
                key={q.label}
                className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => setModule(q.m)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{q.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {q.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
