"use client";

import * as React from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart3,
  Sparkles,
  FileText,
  Flame,
  Target,
  TrendingUp,
  Activity,
  Award,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ModuleHeader,
  ScoreRing,
  Pill,
  AIEmptyState,
} from "@/components/shared/blocks";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface AnalyticsData {
  moduleUsage: { module: string; visits: number; actions: number }[];
  aiCalls: {
    total: number;
    byType: { type: string; count: number }[];
    trend: number[];
  };
  resumeStats: {
    versions: number;
    avgAtsScore: number;
    bestAtsScore: number;
    totalDownloads: number;
  };
  recentActivity: { action: string; entity?: string; timestamp: string }[];
  streak: { current: number; longest: number };
}

const PIE_COLORS = [
  "oklch(0.62 0.15 162)", // emerald
  "oklch(0.65 0.18 280)", // purple
  "oklch(0.7 0.15 70)", // amber
  "oklch(0.75 0.16 50)", // orange
  "oklch(0.65 0.2 340)", // pink
  "oklch(0.6 0.15 200)", // teal
];

const MODULE_COLORS: Record<string, string> = {
  "Resume Builder": "oklch(0.62 0.15 162)",
  "AI Career Coach": "oklch(0.65 0.18 280)",
  "Coding Practice": "oklch(0.7 0.15 70)",
  "ATS Review": "oklch(0.65 0.2 340)",
  "Job Tracker": "oklch(0.75 0.16 50)",
  "Learning Hub": "oklch(0.6 0.15 200)",
  "Mock Interview": "oklch(0.7 0.13 140)",
  "LinkedIn Optimizer": "oklch(0.6 0.18 230)",
};

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid oklch(0.7 0.02 200 / 0.2)",
  background: "oklch(0.2 0.018 200)",
  color: "white",
  fontSize: 12,
} as const;

function dayLabel(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() - (6 - offset));
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function AnalyticsModule() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to load analytics");
      const json = (await res.json()) as AnalyticsData;
      setData(json);
    } catch {
      setData(null);
      toast.error("Couldn't load analytics. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (loading) return <AnalyticsSkeleton />;

  const isEmpty =
    !data ||
    (data.aiCalls.total === 0 &&
      data.recentActivity.length === 0 &&
      data.moduleUsage.length === 0);

  if (isEmpty || !data) {
    return (
      <div className="space-y-6">
        <ModuleHeader
          icon={BarChart3}
          title="Analytics"
          description="Your usage & career insights"
        >
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => void fetchData()}
          >
            <RefreshCw className="size-3.5" /> Refresh
          </Button>
        </ModuleHeader>
        <AIEmptyState
          icon={BarChart3}
          title="No analytics yet"
          description="Your activity, AI usage, and career insights will appear here once you start using AI CareerOS."
        />
      </div>
    );
  }

  const aiTrend = data.aiCalls.trend.map((v, i) => ({
    day: dayLabel(i),
    calls: v,
  }));
  const moduleData = [...data.moduleUsage].sort((a, b) => b.visits - a.visits);
  const totalByType =
    data.aiCalls.byType.reduce((s, x) => s + x.count, 0) || 1;
  const pieData = data.aiCalls.byType.map((x) => ({
    name: x.type,
    value: x.count,
  }));

  const topStats = [
    {
      label: "AI Calls This Month",
      value: data.aiCalls.total,
      icon: Sparkles,
      tint: "bg-primary/12 text-primary",
      pill: "live",
    },
    {
      label: "Resume Downloads",
      value: data.resumeStats.totalDownloads,
      icon: FileText,
      tint: "bg-purple-500/12 text-purple-600 dark:text-purple-400",
      pill: "all-time",
    },
    {
      label: "Current Streak",
      value: `${data.streak.current}d`,
      icon: Flame,
      tint: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
      pill: "best 12d",
    },
    {
      label: "Avg ATS Score",
      value: data.resumeStats.avgAtsScore,
      icon: Target,
      tint: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
      pill: `best ${data.resumeStats.bestAtsScore}`,
    },
  ];

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={BarChart3}
        title="Analytics"
        description="Your usage & career insights"
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => void fetchData()}
        >
          <RefreshCw className="size-3.5" /> Refresh
        </Button>
      </ModuleHeader>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {topStats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "grid size-10 place-items-center rounded-lg",
                      s.tint
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <Pill tone="default">{s.pill}</Pill>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row: AI usage area + breakdown donut */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">AI Usage</CardTitle>
              <CardDescription className="text-xs">
                Last 7 days · calls per day
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="size-3 text-primary" /> {data.aiCalls.total}{" "}
              total
            </Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={aiTrend}
                margin={{ left: -20, right: 8, top: 8 }}
              >
                <defs>
                  <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="oklch(0.62 0.15 162)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(0.62 0.15 162)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.7 0.02 200 / 0.15)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
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
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ stroke: "oklch(0.62 0.15 162)", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="oklch(0.62 0.15 162)"
                  strokeWidth={2.5}
                  fill="url(#aiGrad)"
                  name="AI Calls"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">AI Calls Breakdown</CardTitle>
            <CardDescription className="text-xs">
              Distribution by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value: number, name: string) => [
                    `${value} calls`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {pieData.map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      background: PIE_COLORS[i % PIE_COLORS.length],
                    }}
                  />
                  <span className="truncate text-muted-foreground">
                    {p.name}
                  </span>
                  <span className="ml-auto font-medium tabular-nums">
                    {Math.round((p.value / totalByType) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module usage bar chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">Module Usage</CardTitle>
            <CardDescription className="text-xs">
              Visits per module · last 30 days
            </CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1">
            <BarChart3 className="size-3 text-primary" />{" "}
            {moduleData.reduce((s, m) => s + m.visits, 0)} visits
          </Badge>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={moduleData}
              layout="vertical"
              margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.7 0.02 200 / 0.15)"
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="oklch(0.55 0.02 200)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="module"
                stroke="oklch(0.55 0.02 200)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={132}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                cursor={{ fill: "oklch(0.7 0.02 200 / 0.08)" }}
                formatter={(value: number, name: string) => [
                  `${value}`,
                  name === "visits" ? "Visits" : name,
                ]}
              />
              <Bar dataKey="visits" radius={[0, 6, 6, 0]} barSize={18}>
                {moduleData.map((m) => (
                  <Cell
                    key={m.module}
                    fill={MODULE_COLORS[m.module] ?? "oklch(0.62 0.15 162)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom: resume stats + streak + recent activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Resume stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="size-4 text-primary" /> Resume Stats
            </CardTitle>
            <CardDescription className="text-xs">
              Across {data.resumeStats.versions} versions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around">
              <ScoreRing
                value={data.resumeStats.versions}
                size={88}
                label="Versions"
              />
              <ScoreRing
                value={data.resumeStats.avgAtsScore}
                size={88}
                label="Avg ATS"
              />
              <ScoreRing
                value={data.resumeStats.bestAtsScore}
                size={88}
                label="Best ATS"
              />
            </div>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="size-4 text-amber-500" /> Streak
            </CardTitle>
            <CardDescription className="text-xs">
              Keep the momentum going
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-3xl font-bold leading-none">
                  {data.streak.current}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  current days
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-3xl font-bold leading-none text-muted-foreground">
                  {data.streak.longest}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">longest</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-1">
              {aiTrend.map((d, i) => {
                const active = d.calls > 0;
                return (
                  <div
                    key={i}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <span
                      className={cn(
                        "grid size-8 place-items-center rounded-full text-[11px] font-semibold transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground/60"
                      )}
                      title={`${d.day}: ${d.calls} calls`}
                    >
                      {active ? d.calls : "·"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-primary" /> Recent Activity
            </CardTitle>
            <CardDescription className="text-xs">
              Last {Math.min(10, data.recentActivity.length)} events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No activity yet.
              </p>
            ) : (
              <ol className="relative max-h-[260px] space-y-3 overflow-y-auto border-l border-border pl-4 pr-1">
                {data.recentActivity.slice(0, 10).map((a, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[1.2rem] top-1 size-2.5 rounded-full bg-primary ring-4 ring-background" />
                    <p className="text-sm font-medium leading-tight">
                      {a.action}
                    </p>
                    {a.entity && (
                      <p className="text-xs text-muted-foreground">
                        {a.entity}
                      </p>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(a.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={BarChart3}
        title="Analytics"
        description="Your usage & career insights"
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
    </div>
  );
}
