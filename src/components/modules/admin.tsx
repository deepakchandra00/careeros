"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Users,
  IndianRupee,
  CreditCard,
  LifeBuoy,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Download,
  Plus,
  MoreHorizontal,
  FileText,
  Cpu,
  Bot,
  Sparkles,
  Zap,
  Gauge,
  Activity,
  TicketCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Router,
  BookOpen,
  Newspaper,
  Ticket,
  Receipt,
  LayoutDashboard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ModuleHeader, Pill } from "@/components/shared/blocks";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ------------------------------ Seeded data ------------------------------ */

const TOP_STATS = [
  {
    id: "users",
    label: "Total Users",
    value: "12,847",
    delta: "+18%",
    deltaTone: "good" as const,
    up: true,
    icon: Users,
    color: "oklch(0.62 0.15 162)",
    sub: "2,310 new this month",
  },
  {
    id: "mrr",
    label: "MRR",
    value: "₹14.2L",
    delta: "+12%",
    deltaTone: "good" as const,
    up: true,
    icon: IndianRupee,
    color: "oklch(0.6 0.18 280)",
    sub: "₹1.5L vs last month",
  },
  {
    id: "subs",
    label: "Active Subscriptions",
    value: "3,421",
    delta: "+6%",
    deltaTone: "good" as const,
    up: true,
    icon: CreditCard,
    color: "oklch(0.75 0.16 50)",
    sub: "Pro 3,150 · Teams 271",
  },
  {
    id: "tickets",
    label: "Support Tickets",
    value: "47",
    delta: "open",
    deltaTone: "warn" as const,
    up: false,
    icon: LifeBuoy,
    color: "oklch(0.58 0.22 25)",
    sub: "8 high priority",
  },
];

const REVENUE_DATA = [
  { month: "Jan", revenue: 6.8, users: 5200 },
  { month: "Feb", revenue: 7.4, users: 5840 },
  { month: "Mar", revenue: 8.1, users: 6420 },
  { month: "Apr", revenue: 9.2, users: 7180 },
  { month: "May", revenue: 9.9, users: 7920 },
  { month: "Jun", revenue: 10.8, users: 8610 },
  { month: "Jul", revenue: 11.4, users: 9280 },
  { month: "Aug", revenue: 12.1, users: 9970 },
  { month: "Sep", revenue: 12.6, users: 10620 },
  { month: "Oct", revenue: 13.2, users: 11340 },
  { month: "Nov", revenue: 13.7, users: 12110 },
  { month: "Dec", revenue: 14.2, users: 12847 },
];

const PLAN_DISTRIBUTION = [
  { name: "Free", value: 60, fill: "oklch(0.62 0.15 162)" },
  { name: "Pro", value: 32, fill: "oklch(0.6 0.18 280)" },
  { name: "Teams", value: 8, fill: "oklch(0.75 0.16 50)" },
];

const MODULE_USAGE = [
  { module: "Resume Builder", usage: 8420 },
  { module: "ATS Review", usage: 6230 },
  { module: "JD Match", usage: 4810 },
  { module: "LinkedIn", usage: 3120 },
  { module: "Coach", usage: 2380 },
];

const RECENT_ACTIVITY = [
  {
    icon: ArrowUpRight,
    title: "New Pro subscription",
    desc: "Priya Reddy upgraded to Pro · ₹2,999/mo",
    time: "2m ago",
    tone: "good" as const,
  },
  {
    icon: AlertTriangle,
    title: "Support ticket #4821",
    desc: '"AI coach is slow" — flagged high priority',
    time: "18m ago",
    tone: "bad" as const,
  },
  {
    icon: Newspaper,
    title: "Blog published",
    desc: '"10 Resume Tips for 2024" went live',
    time: "1h ago",
    tone: "info" as const,
  },
  {
    icon: Ticket,
    title: "Coupon WELCOME50",
    desc: "142 redemptions in the last 24h",
    time: "3h ago",
    tone: "warn" as const,
  },
  {
    icon: LifeBuoy,
    title: "Bug report",
    desc: "Resume export failed for 3 users",
    time: "6h ago",
    tone: "bad" as const,
  },
];

const USERS = [
  {
    name: "Deepak Sharma",
    email: "deepak.s@gmail.com",
    plan: "Pro" as const,
    status: "Active" as const,
    joined: "12 Jan 2024",
    mrr: 2999,
    color: "oklch(0.62 0.15 162)",
  },
  {
    name: "Priya Reddy",
    email: "priya.r@outlook.com",
    plan: "Pro" as const,
    status: "Active" as const,
    joined: "03 Feb 2024",
    mrr: 2999,
    color: "oklch(0.6 0.18 280)",
  },
  {
    name: "Arjun Mehta",
    email: "arjun.m@yahoo.com",
    plan: "Teams" as const,
    status: "Active" as const,
    joined: "21 Feb 2024",
    mrr: 9999,
    color: "oklch(0.75 0.16 50)",
  },
  {
    name: "Sara Khan",
    email: "sara.khan@gmail.com",
    plan: "Free" as const,
    status: "Active" as const,
    joined: "08 Mar 2024",
    mrr: 0,
    color: "oklch(0.62 0.15 162)",
  },
  {
    name: "Vikram Singh",
    email: "vikram.s@icloud.com",
    plan: "Pro" as const,
    status: "Past due" as const,
    joined: "15 Mar 2024",
    mrr: 2999,
    color: "oklch(0.6 0.18 280)",
  },
  {
    name: "Anjali Patel",
    email: "anjali.p@gmail.com",
    plan: "Teams" as const,
    status: "Active" as const,
    joined: "02 Apr 2024",
    mrr: 9999,
    color: "oklch(0.75 0.16 50)",
  },
  {
    name: "Rohit Verma",
    email: "rohit.v@gmail.com",
    plan: "Free" as const,
    status: "Inactive" as const,
    joined: "19 Apr 2024",
    mrr: 0,
    color: "oklch(0.62 0.15 162)",
  },
  {
    name: "Neha Gupta",
    email: "neha.g@outlook.com",
    plan: "Pro" as const,
    status: "Active" as const,
    joined: "05 May 2024",
    mrr: 2999,
    color: "oklch(0.6 0.18 280)",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    users: 7710,
    mrr: "₹0",
    churn: "—",
    enabled: true,
    color: "oklch(0.62 0.15 162)",
  },
  {
    name: "Pro",
    price: "₹2,999",
    period: "per month",
    users: 3150,
    mrr: "₹9.4L",
    churn: "4.2%",
    enabled: true,
    color: "oklch(0.6 0.18 280)",
  },
  {
    name: "Teams",
    price: "₹9,999",
    period: "per month",
    users: 271,
    mrr: "₹2.7L",
    churn: "2.8%",
    enabled: true,
    color: "oklch(0.75 0.16 50)",
  },
];

const TEMPLATES = [
  { name: "Modern", uses: 4210, enabled: true, color: "oklch(0.62 0.15 162)" },
  { name: "ATS", uses: 3890, enabled: true, color: "oklch(0.6 0.18 280)" },
  { name: "Executive", uses: 1540, enabled: true, color: "oklch(0.75 0.16 50)" },
  { name: "Minimal", uses: 2610, enabled: true, color: "oklch(0.62 0.15 162)" },
  { name: "Google", uses: 980, enabled: false, color: "oklch(0.6 0.18 280)" },
  { name: "Microsoft", uses: 1230, enabled: true, color: "oklch(0.75 0.16 50)" },
  { name: "Startup", uses: 760, enabled: true, color: "oklch(0.62 0.15 162)" },
  { name: "Creative", uses: 1420, enabled: true, color: "oklch(0.6 0.18 280)" },
];

const LLMS = [
  {
    name: "OpenAI GPT-4o",
    provider: "OpenAI",
    status: "Active" as const,
    cost: "₹0.45",
    latency: "420ms",
    requests: "12,480",
    priority: 1,
    icon: Bot,
    color: "oklch(0.62 0.15 162)",
  },
  {
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    status: "Active" as const,
    cost: "₹0.38",
    latency: "380ms",
    requests: "8,210",
    priority: 2,
    icon: Bot,
    color: "oklch(0.6 0.18 280)",
  },
  {
    name: "Gemini 1.5 Pro",
    provider: "Google",
    status: "Routing" as const,
    cost: "₹0.32",
    latency: "510ms",
    requests: "4,890",
    priority: 3,
    icon: Bot,
    color: "oklch(0.75 0.16 50)",
  },
  {
    name: "GLM-5",
    provider: "Zhipu AI",
    status: "Active" as const,
    cost: "₹0.12",
    latency: "290ms",
    requests: "18,540",
    priority: 1,
    icon: Bot,
    color: "oklch(0.62 0.15 162)",
  },
  {
    name: "DeepSeek V3",
    provider: "DeepSeek",
    status: "Routing" as const,
    cost: "₹0.18",
    latency: "340ms",
    requests: "6,720",
    priority: 2,
    icon: Bot,
    color: "oklch(0.6 0.18 280)",
  },
  {
    name: "Local Llama",
    provider: "Self-hosted",
    status: "Disabled" as const,
    cost: "₹0.00",
    latency: "1200ms",
    requests: "0",
    priority: 4,
    icon: Cpu,
    color: "oklch(0.58 0.22 25)",
  },
];

const TICKETS = [
  {
    id: "#4821",
    subject: "AI coach is slow",
    user: "Priya Reddy",
    priority: "High" as const,
    status: "Open" as const,
    updated: "18m ago",
  },
  {
    id: "#4820",
    subject: "Resume export to PDF failed",
    user: "Vikram Singh",
    priority: "Medium" as const,
    status: "In Progress" as const,
    updated: "2h ago",
  },
  {
    id: "#4819",
    subject: "How to upgrade to Teams?",
    user: "Sara Khan",
    priority: "Low" as const,
    status: "Open" as const,
    updated: "5h ago",
  },
  {
    id: "#4812",
    subject: "LinkedIn optimizer not working",
    user: "Rohit Verma",
    priority: "High" as const,
    status: "Resolved" as const,
    updated: "1d ago",
  },
  {
    id: "#4807",
    subject: "Billing issue with coupon",
    user: "Anjali Patel",
    priority: "Medium" as const,
    status: "Open" as const,
    updated: "2d ago",
  },
];

const COMING_SOON = [
  { id: "prompts", label: "Prompt Library", icon: BookOpen, desc: "Curated, versioned prompts for every module." },
  { id: "blogs", label: "Blogs", icon: Newspaper, desc: "Publish, schedule and SEO-tune career articles." },
  { id: "coupons", label: "Coupons", icon: Ticket, desc: "Discount codes with redemption analytics." },
  { id: "invoices", label: "Invoices", icon: Receipt, desc: "GST-compliant invoicing & exports." },
  { id: "cms", label: "CMS", icon: LayoutDashboard, desc: "Landing pages, hero blocks & marketing content." },
];

/* ------------------------------ Helpers ------------------------------ */

const planTone = (plan: string) =>
  plan === "Pro" ? "info" : plan === "Teams" ? "warn" : "default";

const statusTone = (status: string) =>
  status === "Active"
    ? ("good" as const)
    : status === "Past due"
    ? ("bad" as const)
    : ("default" as const);

const ticketStatusTone = (s: string) =>
  s === "Open" ? ("warn" as const) : s === "In Progress" ? ("info" as const) : ("good" as const);

const llmStatusTone = (s: string) =>
  s === "Active" ? ("good" as const) : s === "Routing" ? ("info" as const) : ("bad" as const);

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const chartTooltipStyle = {
  borderRadius: 12,
  border: "1px solid oklch(0.7 0.02 200 / 0.2)",
  background: "oklch(0.2 0.018 200)",
  color: "white",
  fontSize: 12,
};

/* ------------------------------ Sub-components ------------------------------ */

function StatCard({
  stat,
}: {
  stat: (typeof TOP_STATS)[number];
}) {
  const Icon = stat.icon;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div
            className="grid size-10 place-items-center rounded-xl"
            style={{ backgroundColor: `${stat.color}1a`, color: stat.color }}
          >
            <Icon className="size-5" />
          </div>
          <Pill tone={stat.deltaTone}>
            {stat.up ? (
              <ArrowUpRight className="mr-0.5 size-3" />
            ) : (
              <ArrowDownRight className="mr-0.5 size-3" />
            )}
            {stat.delta}
          </Pill>
        </div>
        <p className="mt-4 text-3xl font-bold tracking-tight">{stat.value}</p>
        <p className="text-sm font-medium text-foreground">{stat.label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{stat.sub}</p>
      </CardContent>
    </Card>
  );
}

function ComingSoonCard({
  label,
  icon: Icon,
  desc,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-primary/5 blur-2xl" />
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{label}</h3>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            {desc}
          </p>
        </div>
        <Badge variant="outline" className="gap-1 text-muted-foreground">
          <Sparkles className="size-3" /> Coming soon
        </Badge>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/* ------------------------------ Main module ------------------------------ */

export function AdminModule() {
  const [search, setSearch] = React.useState("");
  const [planFilter, setPlanFilter] = React.useState("all");

  const filteredUsers = React.useMemo(() => {
    return USERS.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesPlan = planFilter === "all" || u.plan === planFilter;
      return matchesSearch && matchesPlan;
    });
  }, [search, planFilter]);

  const exportCsv = () => {
    toast.success("Users exported", {
      description: `${filteredUsers.length} rows downloaded as CSV`,
    });
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={ShieldCheck}
        title="Admin Panel"
        description="Users, subscriptions, templates & analytics"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="size-3.5" /> Reports
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" /> New user
          </Button>
        </div>
      </ModuleHeader>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TOP_STATS.map((s) => (
          <StatCard key={s.id} stat={s} />
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-9 w-max">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="llms">LLMs</TabsTrigger>
            <TabsTrigger value="prompts">Prompt Library</TabsTrigger>
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="cms">CMS</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Charts row 1: revenue + plan distribution */}
          <div className="grid gap-4 lg:grid-cols-3">
            <SectionCard
              title="Revenue"
              description="Monthly recurring revenue · last 12 months (₹L)"
              className="lg:col-span-2"
              action={
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="size-3 text-primary" /> +108% YoY
                </Badge>
              }
            >
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={REVENUE_DATA}
                  margin={{ left: -16, right: 8, top: 8 }}
                >
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="oklch(0.62 0.15 162)"
                        stopOpacity={0.45}
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
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="oklch(0.62 0.15 162)"
                    strokeWidth={2.5}
                    fill="url(#revGrad)"
                    name="Revenue (₹L)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard
              title="Plan Distribution"
              description="Active user split by plan"
            >
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={PLAN_DISTRIBUTION}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {PLAN_DISTRIBUTION.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="-mt-4 text-center">
                  <p className="text-2xl font-bold">12,847</p>
                  <p className="text-xs text-muted-foreground">Total users</p>
                </div>
                <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center">
                  {PLAN_DISTRIBUTION.map((p) => (
                    <div key={p.name} className="rounded-lg bg-muted/40 p-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: p.fill }}
                        />
                        <span className="text-xs font-medium">{p.name}</span>
                      </div>
                      <p className="mt-0.5 text-sm font-bold">{p.value}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Charts row 2: user growth + module usage */}
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="User Growth"
              description="Total registered users · last 12 months"
              action={
                <Badge variant="secondary" className="gap-1">
                  <Users className="size-3 text-primary" /> 12,847
                </Badge>
              }
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={REVENUE_DATA}
                  margin={{ left: -16, right: 8, top: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.7 0.02 200 / 0.15)"
                    vertical={false}
                  />
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
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="oklch(0.6 0.18 280)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "oklch(0.6 0.18 280)" }}
                    activeDot={{ r: 5 }}
                    name="Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard
              title="Top Modules"
              description="Usage by module · last 30 days"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={MODULE_USAGE}
                  margin={{ left: -16, right: 8, top: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.7 0.02 200 / 0.15)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="module"
                    stroke="oklch(0.55 0.02 200)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    stroke="oklch(0.55 0.02 200)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    cursor={{ fill: "oklch(0.7 0.02 200 / 0.08)" }}
                  />
                  <Bar
                    dataKey="usage"
                    fill="oklch(0.62 0.15 162)"
                    radius={[6, 6, 0, 0]}
                    name="Sessions"
                  />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>

          {/* Recent activity */}
          <SectionCard
            title="Recent Activity"
            description="Latest events across the platform"
            action={
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                View all
              </Button>
            }
          >
            <div className="space-y-1">
              {RECENT_ACTIVITY.map((a, i) => {
                const Icon = a.icon;
                const toneMap = {
                  good: "bg-primary/15 text-primary",
                  bad: "bg-red-500/15 text-red-600 dark:text-red-400",
                  warn: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                  info: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
                  default: "bg-muted text-muted-foreground",
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
            </div>
          </SectionCard>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Users</CardTitle>
                <CardDescription className="text-xs">
                  {filteredUsers.length} of {USERS.length} users shown
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-full pl-8 sm:w-64"
                  />
                </div>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger size="sm" className="w-full sm:w-36">
                    <SelectValue placeholder="Filter by plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All plans</SelectItem>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Teams">Teams</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={exportCsv}
                >
                  <Download className="size-3.5" /> Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="pl-6">User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">MRR</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.email}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback
                              className="text-xs font-semibold text-white"
                              style={{ backgroundColor: u.color }}
                            >
                              {initials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {u.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Pill tone={planTone(u.plan)}>{u.plan}</Pill>
                      </TableCell>
                      <TableCell>
                        <Pill tone={statusTone(u.status)}>{u.status}</Pill>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.joined}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        ₹{u.mrr.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit subscription</DropdownMenuItem>
                            <DropdownMenuItem>Send email</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Suspend user
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        No users match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscription Plans</CardTitle>
              <CardDescription className="text-xs">
                Pricing, reach and retention per plan · toggle to enable/disable
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="pl-6">Plan</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Active users</TableHead>
                    <TableHead>MRR</TableHead>
                    <TableHead>Churn</TableHead>
                    <TableHead className="text-right pr-6">Enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PLANS.map((p) => (
                    <TableRow key={p.name}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          <span className="text-sm font-medium">{p.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{p.price}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.period}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {p.users.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {p.mrr}
                      </TableCell>
                      <TableCell>
                        {p.churn === "—" ? (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        ) : (
                          <Pill
                            tone={
                              parseFloat(p.churn) > 3.5 ? "warn" : "good"
                            }
                          >
                            {p.churn}
                          </Pill>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Switch defaultChecked={p.enabled} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="border-t bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
              Total MRR across all plans:{" "}
              <span className="ml-1 font-semibold text-foreground">₹12.1L</span>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Resume Templates</h2>
              <p className="text-xs text-muted-foreground">
                {TEMPLATES.filter((t) => t.enabled).length} of {TEMPLATES.length}{" "}
                templates published
              </p>
            </div>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" /> New template
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((t) => (
              <Card key={t.name} className="overflow-hidden">
                <div
                  className="relative h-28"
                  style={{
                    background: `linear-gradient(135deg, ${t.color}26, ${t.color}08)`,
                  }}
                >
                  <div className="absolute inset-0 grid place-items-center">
                    <FileText
                      className="size-10"
                      style={{ color: t.color }}
                    />
                  </div>
                  {!t.enabled && (
                    <div className="absolute right-2 top-2">
                      <Pill tone="default">Disabled</Pill>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.uses.toLocaleString("en-IN")} uses
                      </p>
                    </div>
                    <Switch defaultChecked={t.enabled} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* LLMs */}
        <TabsContent value="llms" className="space-y-4">
          {/* Smart Routing card */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Router className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">Smart Routing</h3>
                    <Badge
                      variant="outline"
                      className="gap-1 text-[10px] text-primary"
                    >
                      <Zap className="size-2.5" /> Auto
                    </Badge>
                  </div>
                  <p className="mt-1 max-w-xl text-xs text-muted-foreground">
                    Automatically routes each request to the cheapest model that
                    meets the quality bar. GLM-5 and DeepSeek V3 are preferred
                    for cost; GPT-4o and Claude 3.5 are used for high-stakes
                    tasks like ATS reviews and salary negotiation.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Cost saved</p>
                  <p className="text-lg font-bold text-primary">₹2.1L / mo</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LLMS.map((m) => {
              const Icon = m.icon;
              return (
                <Card key={m.name} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="grid size-10 place-items-center rounded-xl"
                        style={{
                          backgroundColor: `${m.color}1a`,
                          color: m.color,
                        }}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{m.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {m.provider}
                        </CardDescription>
                      </div>
                    </div>
                    <Pill tone={llmStatusTone(m.status)}>{m.status}</Pill>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Cost/1K
                        </p>
                        <p className="text-sm font-semibold">{m.cost}</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Latency
                        </p>
                        <p className="text-sm font-semibold">{m.latency}</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Today
                        </p>
                        <p className="text-sm font-semibold">{m.requests}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                      <div className="flex items-center gap-1.5">
                        <Gauge className="size-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Priority
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-semibold"
                        >
                          P{m.priority}
                        </Badge>
                      </div>
                      <Switch defaultChecked={m.status !== "Disabled"} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Support */}
        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Support Tickets</CardTitle>
                <CardDescription className="text-xs">
                  {TICKETS.length} tickets ·{" "}
                  {TICKETS.filter((t) => t.status === "Open").length} open ·{" "}
                  {
                    TICKETS.filter((t) => t.priority === "High").length
                  }{" "}
                  high priority
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="size-3.5" /> New ticket
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {TICKETS.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-accent/50"
                >
                  <div
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-lg",
                      t.status === "Resolved"
                        ? "bg-primary/15 text-primary"
                        : t.priority === "High"
                        ? "bg-red-500/15 text-red-600 dark:text-red-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {t.status === "Resolved" ? (
                      <CheckCircle2 className="size-4" />
                    ) : t.priority === "High" ? (
                      <AlertTriangle className="size-4" />
                    ) : (
                      <TicketCheck className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        {t.id}
                      </span>
                      <p className="truncate text-sm font-medium">
                        {t.subject}
                      </p>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.user}
                    </p>
                  </div>
                  <div className="hidden items-center gap-2 sm:flex">
                    <Pill
                      tone={
                        t.priority === "High"
                          ? "bad"
                          : t.priority === "Medium"
                          ? "warn"
                          : "default"
                      }
                    >
                      {t.priority}
                    </Pill>
                    <Pill tone={ticketStatusTone(t.status)}>{t.status}</Pill>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {t.updated}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coming soon tabs */}
        {COMING_SOON.map((c) => {
          const Icon = c.icon;
          return (
            <TabsContent key={c.id} value={c.id}>
              <ComingSoonCard label={c.label} icon={Icon} desc={c.desc} />
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Footer note */}
      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-primary" />
        <span>AI CareerOS Admin · Phase 1 MVP</span>
        <span className="text-muted-foreground/40">·</span>
        <Activity className="size-3.5 text-primary" />
        <span>All systems operational</span>
      </div>
    </div>
  );
}
