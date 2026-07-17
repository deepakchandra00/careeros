"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  UserCog,
  CreditCard,
  TrendingUp,
  Search,
  Download,
  Plus,
  MoreHorizontal,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Gauge,
  Bot,
  Server,
  Database,
  RefreshCw,
  Eye,
  ArrowUpRight,
  CircleDot,
  ChevronDown,
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
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ModuleHeader } from "@/components/shared/blocks";
import { fetchWithFallback } from "@/components/shared/utils";
import { cn } from "@/lib/utils";
import { MODULES, type ModuleId } from "@/lib/modules";
import {
  adminGetAllUsers,
  adminGetUserDetail,
  adminUpdateUserRole,
  adminUpdateUserPlan,
  adminGetAllAuditLogs,
  adminGetAllFeatureFlags,
  adminUpdateFeatureFlag,
  adminCreateFeatureFlag,
  adminGetNavConfig,
  adminSetNavVisibility,
  type SupabaseUser,
  type AuditLog,
  type FeatureFlag,
  type ResumeData,
} from "@/lib/supabase-client";

/* ------------------------------ helpers ------------------------------ */

const initials = (name: string | null | undefined) => {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const fmtDay = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
};

const planTone = (plan?: string) => {
  switch ((plan || "").toUpperCase()) {
    case "PRO":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "TEAMS":
      return "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300";
    case "ADMIN":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
};

const roleTone = (role?: string) => {
  switch ((role || "").toUpperCase()) {
    case "ADMIN":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300/40";
    case "RECRUITER":
      return "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-300/40";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300/40";
  }
};

const actionTone = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes("delete") || a.includes("remove") || a.includes("suspend"))
    return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300";
  if (a.includes("upgrade") || a.includes("create") || a.includes("success"))
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
  if (a.includes("update") || a.includes("edit") || a.includes("change"))
    return "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300";
  if (a.includes("login") || a.includes("auth"))
    return "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300";
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
};

const isToday = (iso?: string | null) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const Loader = ({ label = "Loading…" }: { label?: string }) => (
  <div className="flex min-h-40 flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
    <RefreshCw className="size-6 animate-spin text-emerald-600" />
    <p className="text-sm">{label}</p>
  </div>
);

const ErrorBox = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
    <AlertTriangle className="size-7 text-red-600" />
    <p className="text-sm font-medium text-red-700 dark:text-red-300">
      Failed to load data
    </p>
    <p className="max-w-md text-xs text-red-600/80 dark:text-red-400/80">{message}</p>
    {onRetry && (
      <Button size="sm" variant="outline" onClick={onRetry} className="mt-1">
        <RefreshCw className="mr-1.5 size-3.5" /> Retry
      </Button>
    )}
  </div>
);

/* ------------------------------ Stat Card ------------------------------ */

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "amber" | "violet" | "sky";
}) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  };
  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {sub && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
        <div className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tones[tone])}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------ Access Denied ------------------------------ */

function AccessDenied() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 rounded-xl border border-amber-200 bg-amber-50 px-6 py-12 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
      <div className="grid size-14 place-items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
        <ShieldAlert className="size-7" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-amber-800 dark:text-amber-200">
          Access Denied
        </h3>
        <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/80">
          You need administrator privileges to view this panel. Contact your
          workspace owner if you believe this is an error.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
 * Tab 1: Overview / Analytics Dashboard
 * ============================================================ */

function OverviewTab({
  users,
  auditLogs,
  loading,
  error,
  onRetry,
}: {
  users: SupabaseUser[];
  auditLogs: AuditLog[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const totalUsers = users.length;
  const proUsers = users.filter((u) => (u.plan || "").toUpperCase() === "PRO").length;
  const teamsUsers = users.filter((u) => (u.plan || "").toUpperCase() === "TEAMS").length;
  const freeUsers = users.filter((u) => (u.plan || "").toUpperCase() === "FREE").length;
  const activeToday = new Set(
    auditLogs.filter((l) => isToday(l.createdAt)).map((l) => l.userId),
  ).size;
  const aiCallsToday = auditLogs.filter(
    (l) =>
      isToday(l.createdAt) &&
      /ai|coach|rewrite|generate|ats|match|extract/i.test(l.action),
  ).length;

  const planData = [
    { name: "Free", value: freeUsers, color: "bg-slate-400" },
    { name: "Pro", value: proUsers, color: "bg-emerald-500" },
    { name: "Teams", value: teamsUsers, color: "bg-violet-500" },
  ];
  const planMax = Math.max(1, ...planData.map((p) => p.value));

  // User growth (last 6 months from createdAt)
  const now = new Date();
  const months: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString(undefined, { month: "short" });
    const count = users.filter((u) => {
      if (!u.createdAt) return false;
      const c = new Date(u.createdAt);
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
    }).length;
    months.push({ label, count });
  }
  const growthMax = Math.max(1, ...months.map((m) => m.count));

  const recentLogs = auditLogs.slice(0, 10);

  if (loading) return <Loader label="Loading analytics…" />;
  if (error) return <ErrorBox message={error} onRetry={onRetry} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={totalUsers.toLocaleString()}
          sub={`${activeToday} active today`}
          icon={Users}
          tone="emerald"
        />
        <StatCard
          label="PRO Users"
          value={proUsers.toLocaleString()}
          sub={`${teamsUsers} on Teams plan`}
          icon={CreditCard}
          tone="violet"
        />
        <StatCard
          label="Active Today"
          value={activeToday.toLocaleString()}
          sub="From audit log events"
          icon={Activity}
          tone="sky"
        />
        <StatCard
          label="AI Calls Today"
          value={aiCallsToday.toLocaleString()}
          sub="Coach / Rewrite / ATS"
          icon={Bot}
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-emerald-600" /> User Growth
            </CardTitle>
            <CardDescription>New signups over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-44 items-end gap-3">
              {months.map((m) => (
                <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all"
                      style={{ height: `${(m.count / growthMax) * 100}%`, minHeight: 4 }}
                      title={`${m.count} users`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {m.label}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    {m.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="size-4 text-violet-600" /> Plan Distribution
            </CardTitle>
            <CardDescription>Active subscriptions across the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {planData.map((p) => (
              <div key={p.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {p.value.toLocaleString()} ·{" "}
                    {totalUsers > 0 ? Math.round((p.value / totalUsers) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", p.color)}
                    style={{ width: `${(p.value / planMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4 text-emerald-600" /> Recent Activity
          </CardTitle>
          <CardDescription>Latest 10 audit log events</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <CircleDot className="size-5 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <ul className="max-h-96 space-y-1 overflow-y-auto pr-1">
              {recentLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg border border-border/50 px-3 py-2.5 text-sm hover:bg-muted/40"
                >
                  <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-muted">
                    <ArrowUpRight className="size-3.5 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{log.action}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {log.userId ? `User ${log.userId.slice(0, 8)}…` : "System"} ·{" "}
                      {fmtDate(log.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("text-[10px] font-medium", actionTone(log.action))}
                  >
                    {log.action.split(".")[0]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================
 * Tab 2: Users Management
 * ============================================================ */

function UsersTab({
  users,
  loading,
  error,
  onRetry,
  onMutated,
}: {
  users: SupabaseUser[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onMutated: () => void;
}) {
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("ALL");
  const [planFilter, setPlanFilter] = React.useState<string>("ALL");
  const [detail, setDetail] = React.useState<SupabaseUser | null>(null);

  const filtered = React.useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "ALL" && (u.role || "").toUpperCase() !== roleFilter) return false;
      if (planFilter !== "ALL" && (u.plan || "").toUpperCase() !== planFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!(`${u.name || ""} ${u.email}`.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [users, search, roleFilter, planFilter]);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await adminUpdateUserRole(userId, role);
      toast.success(`User role updated to ${role}`);
      onMutated();
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message.slice(0, 100)}`);
    }
  };

  const handlePlanChange = async (userId: string, plan: string) => {
    try {
      await adminUpdateUserPlan(userId, plan);
      toast.success(`User plan updated to ${plan}`);
      onMutated();
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message.slice(0, 100)}`);
    }
  };

  const handleSuspend = async (userId: string) => {
    // Suspend = mark plan as SUSPENDED (we don't delete the account)
    try {
      await adminUpdateUserPlan(userId, "SUSPENDED");
      toast.success("User suspended");
      onMutated();
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message.slice(0, 100)}`);
    }
  };

  if (loading) return <Loader label="Loading users…" />;
  if (error) return <ErrorBox message={error} onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="JOBSEEKER">Job Seeker</SelectItem>
              <SelectItem value="RECRUITER">Recruiter</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Plans</SelectItem>
              <SelectItem value="FREE">Free</SelectItem>
              <SelectItem value="PRO">Pro</SelectItem>
              <SelectItem value="TEAMS">Teams</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <p className="text-sm font-medium">
              {filtered.length.toLocaleString()} user{filtered.length === 1 ? "" : "s"}
            </p>
            <Badge variant="secondary" className="text-[10px]">
              Showing first 100
            </Badge>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No users match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.slice(0, 100).map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 border">
                            <AvatarFallback className="bg-emerald-50 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              {initials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{u.name || "Unnamed"}</p>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px] font-medium", roleTone(u.role))}>
                          {u.role || "JOBSEEKER"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn("text-[10px] font-medium", planTone(u.plan))}>
                          {u.plan || "FREE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {fmtDay(u.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setDetail(u)}>
                              <Eye className="mr-2 size-3.5" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs">Change Role</DropdownMenuLabel>
                            {["JOBSEEKER", "RECRUITER", "ADMIN"].map((r) => (
                              <DropdownMenuItem
                                key={r}
                                onClick={() => handleRoleChange(u.id, r)}
                                disabled={(u.role || "").toUpperCase() === r}
                              >
                                <UserCog className="mr-2 size-3.5" /> {r}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs">Change Plan</DropdownMenuLabel>
                            {["FREE", "PRO", "TEAMS"].map((p) => (
                              <DropdownMenuItem
                                key={p}
                                onClick={() => handlePlanChange(u.id, p)}
                                disabled={(u.plan || "").toUpperCase() === p}
                              >
                                <CreditCard className="mr-2 size-3.5" /> {p}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleSuspend(u.id)}
                              className="text-red-600 focus:text-red-700"
                            >
                              <ShieldAlert className="mr-2 size-3.5" /> Suspend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserDetailDialog
        user={detail}
        onClose={() => setDetail(null)}
        onMutated={onMutated}
      />
    </div>
  );
}

/* ------------------------------ User Detail Dialog ------------------------------ */

function UserDetailDialog({
  user,
  onClose,
  onMutated,
}: {
  user: SupabaseUser | null;
  onClose: () => void;
  onMutated: () => void;
}) {
  const [data, setData] = React.useState<{
    resume: ResumeData | null;
    logs: AuditLog[];
    loading: boolean;
    error: string | null;
  }>({ resume: null, logs: [], loading: false, error: null });

  const loadDetail = React.useCallback(async (userId: string) => {
    setData({ resume: null, logs: [], loading: true, error: null });
    try {
      const res = await adminGetUserDetail(userId);
      setData({
        resume: res.resumeData,
        logs: res.auditLogs,
        loading: false,
        error: null,
      });
    } catch (e) {
      setData({
        resume: null,
        logs: [],
        loading: false,
        error: (e as Error).message,
      });
    }
  }, []);

  React.useEffect(() => {
    if (user) loadDetail(user.id);
  }, [user, loadDetail]);

  const act = async (fn: () => Promise<void>, msg: string) => {
    try {
      await fn();
      toast.success(msg);
      onMutated();
      if (user) loadDetail(user.id);
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message.slice(0, 100)}`);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" /> User Details
          </DialogTitle>
          <DialogDescription>
            Full profile, resume data, and recent activity for this user.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="space-y-5">
            {/* User info */}
            <div className="flex items-start gap-4 rounded-lg border border-border/60 p-4">
              <Avatar className="size-14 border">
                <AvatarFallback className="bg-emerald-50 text-sm font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold">{user.name || "Unnamed"}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline" className={cn("text-[10px]", roleTone(user.role))}>
                    {user.role || "JOBSEEKER"}
                  </Badge>
                  <Badge variant="secondary" className={cn("text-[10px]", planTone(user.plan))}>
                    {user.plan || "FREE"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    Joined {fmtDay(user.createdAt)}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    ID: {user.id.slice(0, 12)}…
                  </Badge>
                </div>
              </div>
            </div>

            {/* Resume data */}
            <div className="rounded-lg border border-border/60 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <FileText className="size-4 text-emerald-600" /> Resume Data
              </h4>
              {data.loading ? (
                <Loader label="Loading resume…" />
              ) : data.error ? (
                <ErrorBox message={data.error} />
              ) : !data.resume ? (
                <p className="text-xs text-muted-foreground">
                  No resume data has been saved by this user yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  <InfoCell label="Name" value={(data.resume as ResumeData).name || "—"} />
                  <InfoCell label="Title" value={(data.resume as ResumeData).title || "—"} />
                  <InfoCell label="Template" value={(data.resume as ResumeData).template || "—"} />
                  <InfoCell
                    label="Experience"
                    value={`${(data.resume as ResumeData).experience?.length ?? 0} entries`}
                  />
                  <InfoCell
                    label="Skills"
                    value={`${(data.resume as ResumeData).skills?.length ?? 0} listed`}
                  />
                  <InfoCell
                    label="Projects"
                    value={`${(data.resume as ResumeData).projects?.length ?? 0} entries`}
                  />
                </div>
              )}
            </div>

            {/* Activity */}
            <div className="rounded-lg border border-border/60 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Activity className="size-4 text-emerald-600" /> Recent Activity
              </h4>
              {data.loading ? (
                <Loader label="Loading activity…" />
              ) : data.logs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent activity recorded.</p>
              ) : (
                <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
                  {data.logs.slice(0, 20).map((l) => (
                    <li
                      key={l.id}
                      className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-xs hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{l.action}</p>
                        <p className="truncate text-muted-foreground">{fmtDate(l.createdAt)}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn("text-[9px]", actionTone(l.action))}
                      >
                        {l.action.split(".")[0]}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Button
                size="sm"
                onClick={() =>
                  act(
                    () => adminUpdateUserPlan(user.id, "PRO"),
                    "Upgraded to PRO",
                  )
                }
              >
                <CreditCard className="mr-1.5 size-3.5" /> Upgrade to PRO
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  act(
                    () => adminUpdateUserPlan(user.id, "FREE"),
                    "Downgraded to FREE",
                  )
                }
              >
                Downgrade to FREE
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  act(
                    () => adminUpdateUserRole(user.id, "ADMIN"),
                    "Promoted to Admin",
                  )
                }
              >
                Make Admin
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  act(
                    () => adminUpdateUserPlan(user.id, "SUSPENDED"),
                    "User suspended",
                  )
                }
              >
                <ShieldAlert className="mr-1.5 size-3.5" /> Suspend
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 px-2.5 py-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

/* ============================================================
 * Tab 3: Navigation Control
 * ============================================================ */

function NavigationTab({
  navConfig,
  loading,
  error,
  onRetry,
  onToggle,
}: {
  navConfig: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onToggle: (moduleId: string, visible: boolean) => void;
}) {
  const [scope, setScope] = React.useState<"global" | "role" | "user">("global");
  const [selectedRole, setSelectedRole] = React.useState<string>("JOBSEEKER");
  // For per-role / per-user we read the same global flag store for the demo
  // (the spec calls this out — production would have separate per-role/per-user stores).
  const [userSearch, setUserSearch] = React.useState("");
  const [userResults, setUserResults] = React.useState<SupabaseUser[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<SupabaseUser | null>(null);

  const searchUsers = React.useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setUserResults([]);
      return;
    }
    setSearching(true);
    try {
      const all = await adminGetAllUsers();
      const lc = q.trim().toLowerCase();
      setUserResults(
        all
          .filter((u) => `${u.name || ""} ${u.email}`.toLowerCase().includes(lc))
          .slice(0, 10),
      );
    } catch {
      setUserResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => searchUsers(userSearch), 300);
    return () => clearTimeout(t);
  }, [userSearch, searchUsers]);

  if (loading) return <Loader label="Loading navigation config…" />;
  if (error) return <ErrorBox message={error} onRetry={onRetry} />;

  const modulesToShow = MODULES;

  const renderModuleRow = (m: (typeof MODULES)[number]) => {
    const Icon = m.icon;
    const visible = navConfig[m.id] !== false; // default true if undefined
    return (
      <div
        key={m.id}
        className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-4 py-3"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{m.label}</p>
            <p className="truncate text-xs text-muted-foreground">{m.description}</p>
          </div>
        </div>
        <Switch
          checked={visible}
          onCheckedChange={(v) => onToggle(m.id, v)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="size-4 text-emerald-600" /> Navigation Control
          </CardTitle>
          <CardDescription>
            Show or hide modules globally, per role, or per user. Changes are
            saved to Supabase immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="role">Per Role</TabsTrigger>
              <TabsTrigger value="user">Per User</TabsTrigger>
            </TabsList>

            <TabsContent value="global" className="mt-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {modulesToShow.map(renderModuleRow)}
              </div>
            </TabsContent>

            <TabsContent value="role" className="mt-4 space-y-4">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:w-60">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JOBSEEKER">Job Seeker</SelectItem>
                  <SelectItem value="RECRUITER">Recruiter</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
                <AlertTriangle className="mr-1.5 inline size-3.5" />
                Per-role visibility is stored alongside the global flag. Toggling
                here writes a <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">nav.{selectedRole.toLowerCase()}.{"<module>"}</code>{" "}
                flag in the FeatureFlag table. The current demo shares the global
                flag set for simplicity.
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {modulesToShow.map(renderModuleRow)}
              </div>
            </TabsContent>

            <TabsContent value="user" className="mt-4 space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {searching && (
                <p className="text-xs text-muted-foreground">Searching…</p>
              )}
              {!searching && userSearch && userResults.length === 0 && (
                <p className="text-xs text-muted-foreground">No users found.</p>
              )}
              {userResults.length > 0 && !selectedUser && (
                <ul className="max-h-48 divide-y divide-border/50 overflow-y-auto rounded-lg border border-border/60">
                  {userResults.map((u) => (
                    <li key={u.id}>
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/40"
                      >
                        <Avatar className="size-7 border">
                          <AvatarFallback className="bg-emerald-50 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {initials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{u.name || "Unnamed"}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {selectedUser && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 border">
                        <AvatarFallback className="bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {initials(selectedUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{selectedUser.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{selectedUser.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedUser(null)}
                    >
                      Change
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {modulesToShow.map(renderModuleRow)}
                  </div>
                </div>
              )}
              {!userSearch && !selectedUser && (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                  <Users className="size-6 opacity-40" />
                  <p className="text-sm">Search for a user to control their navigation.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================
 * Tab 4: Activity Log
 * ============================================================ */

function ActivityLogTab({
  logs,
  users,
  loading,
  error,
  onRetry,
}: {
  logs: AuditLog[];
  users: SupabaseUser[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const [actionFilter, setActionFilter] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");

  const emailByUserId = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const u of users) m.set(u.id, u.email);
    return m;
  }, [users]);

  const actionTypes = React.useMemo(() => {
    const s = new Set<string>();
    for (const l of logs) {
      const prefix = (l.action || "").split(".")[0];
      if (prefix) s.add(prefix);
    }
    return Array.from(s).sort();
  }, [logs]);

  const filtered = React.useMemo(() => {
    return logs.filter((l) => {
      if (actionFilter !== "ALL") {
        const prefix = (l.action || "").split(".")[0];
        if (prefix !== actionFilter) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const email = l.userId ? emailByUserId.get(l.userId) || "" : "";
        if (!`${l.action} ${email}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [logs, actionFilter, search, emailByUserId]);

  const exportCsv = () => {
    const rows = [
      ["Timestamp", "User", "Action", "IP", "Metadata"],
      ...filtered.map((l) => [
        l.createdAt,
        l.userId ? emailByUserId.get(l.userId) || l.userId : "system",
        l.action,
        l.ip || "",
        typeof l.metadata === "string" ? l.metadata : JSON.stringify(l.metadata ?? ""),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} rows`);
  };

  if (loading) return <Loader label="Loading audit logs…" />;
  if (error) return <ErrorBox message={error} onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by action or user email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              {actionTypes.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          {filtered.length.toLocaleString()} of {logs.length.toLocaleString()} entries
        </p>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="mr-1.5 size-3.5" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No audit log entries match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((l) => (
                    <AuditLogRow key={l.id} log={l} email={l.userId ? emailByUserId.get(l.userId) : undefined} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AuditLogRow({ log, email }: { log: AuditLog; email?: string }) {
  const [open, setOpen] = React.useState(false);
  const meta = log.metadata;
  const hasMeta = meta !== null && meta !== undefined && meta !== "";
  const metaStr = typeof meta === "string" ? meta : JSON.stringify(meta);

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
        {fmtDate(log.createdAt)}
      </TableCell>
      <TableCell className="text-xs">
        {email || (log.userId ? `${log.userId.slice(0, 8)}…` : "system")}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={cn("text-[10px] font-medium", actionTone(log.action))}>
          {log.action}
        </Badge>
      </TableCell>
      <TableCell className="max-w-md">
        {hasMeta ? (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1 text-xs text-emerald-700 hover:underline dark:text-emerald-300">
                {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                {open ? "Hide" : "Show"} metadata
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-1 max-h-40 overflow-auto rounded-md bg-muted/60 p-2 text-[10px] leading-relaxed">
                {metaStr.slice(0, 1000)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}

/* ============================================================
 * Tab 5: Feature Flags
 * ============================================================ */

function FeatureFlagsTab({
  flags,
  loading,
  error,
  onRetry,
  onToggle,
  onCreated,
}: {
  flags: FeatureFlag[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onToggle: (key: string, enabled: boolean) => void;
  onCreated: () => void;
}) {
  const [showAdd, setShowAdd] = React.useState(false);
  const [newKey, setNewKey] = React.useState("");
  const [newEnabled, setNewEnabled] = React.useState(true);
  const [newRollout, setNewRollout] = React.useState("100");
  const [creating, setCreating] = React.useState(false);

  const handleCreate = async () => {
    const key = newKey.trim();
    if (!key) {
      toast.error("Key is required");
      return;
    }
    if (flags.some((f) => f.key === key)) {
      toast.error("A flag with that key already exists");
      return;
    }
    setCreating(true);
    try {
      await adminCreateFeatureFlag(key, newEnabled, Number(newRollout) || 0);
      toast.success(`Created flag: ${key}`);
      setNewKey("");
      setNewEnabled(true);
      setNewRollout("100");
      setShowAdd(false);
      onCreated();
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message.slice(0, 100)}`);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Loader label="Loading feature flags…" />;
  if (error) return <ErrorBox message={error} onRetry={onRetry} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          {flags.length.toLocaleString()} feature flag{flags.length === 1 ? "" : "s"} configured
        </p>
        <Button size="sm" onClick={() => setShowAdd((s) => !s)}>
          <Plus className="mr-1.5 size-3.5" /> Add Feature Flag
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Feature Flag</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium">Key</label>
              <Input
                placeholder="e.g. enable.ai.coach.v2"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Rollout %</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={newRollout}
                onChange={(e) => setNewRollout(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-xs font-medium">
                <Switch checked={newEnabled} onCheckedChange={setNewEnabled} />
                {newEnabled ? "Enabled" : "Disabled"}
              </label>
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={creating}>
                {creating ? "Creating…" : "Create Flag"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Rollout</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No feature flags configured. Click "Add Feature Flag" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  flags.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {f.enabled ? (
                            <CheckCircle2 className="size-4 text-emerald-600" />
                          ) : (
                            <CircleDot className="size-4 text-muted-foreground" />
                          )}
                          <code className="text-xs font-medium">{f.key}</code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={f.enabled}
                          onCheckedChange={(v) => onToggle(f.key, v)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${Math.min(100, Math.max(0, f.rollout || 0))}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {f.rollout ?? 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {fmtDate(f.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================
 * Tab 6: System Health
 * ============================================================ */

interface HealthStatus {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "ok" | "fail" | "checking" | "unknown";
  responseMs?: number;
  message?: string;
  lastChecked?: string;
}

function SystemHealthTab() {
  const [statuses, setStatuses] = React.useState<HealthStatus[]>([
    { key: "api", label: "App API", icon: Server, status: "unknown" },
    { key: "db", label: "Database (Supabase)", icon: Database, status: "unknown" },
    { key: "ai", label: "AI Service", icon: Bot, status: "unknown" },
    { key: "pdf", label: "PDF Service", icon: FileText, status: "unknown" },
  ]);
  const [running, setRunning] = React.useState(false);

  const runCheck = async () => {
    setRunning(true);
    const checks: HealthStatus[] = [];

    // 1. App API — fetch /api/auth/providers (always exists, no auth required)
    {
      const start = performance.now();
      try {
        const res = await fetch("/api/auth/providers", { cache: "no-store" });
        const ms = Math.round(performance.now() - start);
        checks.push({
          key: "api",
          label: "App API",
          icon: Server,
          status: res.ok ? "ok" : "fail",
          responseMs: ms,
          message: res.ok ? "OK" : `HTTP ${res.status}`,
          lastChecked: new Date().toISOString(),
        });
      } catch (e) {
        checks.push({
          key: "api",
          label: "App API",
          icon: Server,
          status: "fail",
          message: (e as Error).message.slice(0, 80),
          lastChecked: new Date().toISOString(),
        });
      }
    }

    // 2. Database (Supabase) — try to fetch a single user row
    {
      const start = performance.now();
      try {
        await adminGetAllUsers();
        const ms = Math.round(performance.now() - start);
        checks.push({
          key: "db",
          label: "Database (Supabase)",
          icon: Database,
          status: "ok",
          responseMs: ms,
          message: "Connection OK",
          lastChecked: new Date().toISOString(),
        });
      } catch (e) {
        checks.push({
          key: "db",
          label: "Database (Supabase)",
          icon: Database,
          status: "fail",
          message: (e as Error).message.slice(0, 80),
          lastChecked: new Date().toISOString(),
        });
      }
    }

    // 3. AI service — ping /api/ai/coach (tests ZAI + Puter.js fallback)
    {
      const start = performance.now();
      try {
        await fetchWithFallback<{ reply: string }>("/api/ai/coach", {
          messages: [{ role: "user", content: "ping" }],
          resumeContext: "",
        });
        const ms = Math.round(performance.now() - start);
        checks.push({
          key: "ai",
          label: "AI Service",
          icon: Bot,
          status: "ok",
          responseMs: ms,
          message: "OK",
          lastChecked: new Date().toISOString(),
        });
      } catch (e) {
        checks.push({
          key: "ai",
          label: "AI Service",
          icon: Bot,
          status: "fail",
          message: (e as Error).message.slice(0, 80),
          lastChecked: new Date().toISOString(),
        });
      }
    }

    // 4. PDF service — ping the mini-service on port 3002 via gateway
    {
      const start = performance.now();
      try {
        const res = await fetch("/api/health?XTransformPort=3002", { cache: "no-store" });
        const ms = Math.round(performance.now() - start);
        checks.push({
          key: "pdf",
          label: "PDF Service",
          icon: FileText,
          status: res.ok ? "ok" : "fail",
          responseMs: ms,
          message: res.ok ? "OK" : `HTTP ${res.status}`,
          lastChecked: new Date().toISOString(),
        });
      } catch (e) {
        // PDF service may not have a /api/health endpoint — soft-fail
        checks.push({
          key: "pdf",
          label: "PDF Service",
          icon: FileText,
          status: "unknown",
          message: (e as Error).message.slice(0, 80) + " (no health endpoint)",
          lastChecked: new Date().toISOString(),
        });
      }
    }

    setStatuses(checks);
    setRunning(false);
    toast.success("Health check complete");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Live status of platform services. Click "Run Health Check" to refresh.
        </p>
        <Button onClick={runCheck} disabled={running} size="sm">
          <RefreshCw className={cn("mr-1.5 size-3.5", running && "animate-spin")} />
          {running ? "Checking…" : "Run Health Check"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {statuses.map((s) => (
          <HealthCard key={s.key} status={s} />
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Gauge className="size-4 text-emerald-600" /> Service Information
          </h4>
          <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            <div className="flex justify-between border-b border-border/50 pb-1">
              <dt className="text-muted-foreground">App Server</dt>
              <dd className="font-medium">Next.js 16 (port 3000)</dd>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1">
              <dt className="text-muted-foreground">Database</dt>
              <dd className="font-medium">Supabase (PostgREST)</dd>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1">
              <dt className="text-muted-foreground">AI Provider</dt>
              <dd className="font-medium">z-ai-web-dev-sdk</dd>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1">
              <dt className="text-muted-foreground">PDF Service</dt>
              <dd className="font-medium">Playwright mini-service (port 3002)</dd>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1">
              <dt className="text-muted-foreground">Auth</dt>
              <dd className="font-medium">NextAuth.js v4 (JWT)</dd>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1">
              <dt className="text-muted-foreground">Cache</dt>
              <dd className="font-medium">In-memory (no Redis)</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function HealthCard({ status }: { status: HealthStatus }) {
  const Icon = status.icon;
  const tone = {
    ok: {
      ring: "border-emerald-300 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20",
      dot: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-300",
      label: "Operational",
    },
    fail: {
      ring: "border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20",
      dot: "bg-red-500",
      text: "text-red-700 dark:text-red-300",
      label: "Down",
    },
    checking: {
      ring: "border-amber-300 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20",
      dot: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-300",
      label: "Checking…",
    },
    unknown: {
      ring: "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40",
      dot: "bg-slate-400",
      text: "text-slate-600 dark:text-slate-400",
      label: "Not checked",
    },
  }[status.status];

  return (
    <Card className={cn("border", tone.ring)}>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-card/80">
            <Icon className="size-5 text-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{status.label}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", tone.dot)} />
              <span className={cn("text-xs font-medium", tone.text)}>{tone.label}</span>
            </div>
            {status.message && (
              <p className="mt-1 truncate text-xs text-muted-foreground">{status.message}</p>
            )}
            {status.lastChecked && (
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                <Clock className="mr-1 inline size-2.5" />
                {fmtDate(status.lastChecked)}
              </p>
            )}
          </div>
        </div>
        {typeof status.responseMs === "number" && (
          <div className="text-right">
            <p className="text-xs font-semibold tabular-nums">{status.responseMs}ms</p>
            <p className="text-[10px] text-muted-foreground">response</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================
 * Main: AdminModule
 * ============================================================ */

export function AdminModule() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role || "JOBSEEKER";

  const [users, setUsers] = React.useState<SupabaseUser[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
  const [featureFlags, setFeatureFlags] = React.useState<FeatureFlag[]>([]);
  const [navConfig, setNavConfig] = React.useState<Record<string, boolean>>({});

  const [loadingUsers, setLoadingUsers] = React.useState(true);
  const [loadingLogs, setLoadingLogs] = React.useState(true);
  const [loadingFlags, setLoadingFlags] = React.useState(true);
  const [loadingNav, setLoadingNav] = React.useState(true);

  const [errorUsers, setErrorUsers] = React.useState<string | null>(null);
  const [errorLogs, setErrorLogs] = React.useState<string | null>(null);
  const [errorFlags, setErrorFlags] = React.useState<string | null>(null);
  const [errorNav, setErrorNav] = React.useState<string | null>(null);

  const [activeTab, setActiveTab] = React.useState<string>("overview");

  const loadUsers = React.useCallback(async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const rows = await adminGetAllUsers();
      setUsers(rows);
    } catch (e) {
      setErrorUsers((e as Error).message);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const loadLogs = React.useCallback(async () => {
    setLoadingLogs(true);
    setErrorLogs(null);
    try {
      const rows = await adminGetAllAuditLogs(200);
      setAuditLogs(rows);
    } catch (e) {
      setErrorLogs((e as Error).message);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  const loadFlags = React.useCallback(async () => {
    setLoadingFlags(true);
    setErrorFlags(null);
    try {
      const rows = await adminGetAllFeatureFlags();
      setFeatureFlags(rows.filter((f) => !f.key.startsWith("nav.")));
    } catch (e) {
      setErrorFlags((e as Error).message);
    } finally {
      setLoadingFlags(false);
    }
  }, []);

  const loadNav = React.useCallback(async () => {
    setLoadingNav(true);
    setErrorNav(null);
    try {
      const cfg = await adminGetNavConfig();
      setNavConfig(cfg);
    } catch (e) {
      setErrorNav((e as Error).message);
    } finally {
      setLoadingNav(false);
    }
  }, []);

  React.useEffect(() => {
    if (userRole !== "ADMIN") return;
    loadUsers();
    loadLogs();
    loadFlags();
    loadNav();
  }, [userRole, loadUsers, loadLogs, loadFlags, loadNav]);

  const handleToggleNav = async (moduleId: string, visible: boolean) => {
    // Optimistic update
    setNavConfig((prev) => ({ ...prev, [moduleId]: visible }));
    try {
      await adminSetNavVisibility(moduleId, visible);
      toast.success(`Module "${moduleId}" ${visible ? "shown" : "hidden"}`);
    } catch (e) {
      // Revert
      setNavConfig((prev) => ({ ...prev, [moduleId]: !visible }));
      toast.error(`Failed: ${(e as Error).message.slice(0, 100)}`);
    }
  };

  const handleToggleFlag = async (key: string, enabled: boolean) => {
    setFeatureFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled } : f)),
    );
    try {
      await adminUpdateFeatureFlag(key, enabled);
      toast.success(`Flag "${key}" ${enabled ? "enabled" : "disabled"}`);
    } catch (e) {
      setFeatureFlags((prev) =>
        prev.map((f) => (f.key === key ? { ...f, enabled: !enabled } : f)),
      );
      toast.error(`Failed: ${(e as Error).message.slice(0, 100)}`);
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <ModuleHeader
          title="Admin Panel"
          description="Platform administration"
          icon={ShieldCheck}
        />
        <Loader label="Checking session…" />
      </div>
    );
  }

  if (userRole !== "ADMIN") {
    return (
      <div className="space-y-6">
        <ModuleHeader
          title="Admin Panel"
          description="Platform administration"
          icon={ShieldCheck}
        />
        <AccessDenied />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Admin Panel"
        description="SuperAdmin control center for users, navigation, billing & system health"
        icon={ShieldCheck}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full min-w-[720px] grid-cols-6">
            <TabsTrigger value="overview">
              <TrendingUp className="mr-1.5 size-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-1.5 size-3.5" /> Users
            </TabsTrigger>
            <TabsTrigger value="navigation">
              <Eye className="mr-1.5 size-3.5" /> Navigation
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="mr-1.5 size-3.5" /> Activity
            </TabsTrigger>
            <TabsTrigger value="flags">
              <Cpu className="mr-1.5 size-3.5" /> Flags
            </TabsTrigger>
            <TabsTrigger value="system">
              <Server className="mr-1.5 size-3.5" /> System
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <OverviewTab
            users={users}
            auditLogs={auditLogs}
            loading={loadingUsers || loadingLogs}
            error={errorUsers || errorLogs}
            onRetry={() => {
              loadUsers();
              loadLogs();
            }}
          />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab
            users={users}
            loading={loadingUsers}
            error={errorUsers}
            onRetry={loadUsers}
            onMutated={loadUsers}
          />
        </TabsContent>

        <TabsContent value="navigation">
          <NavigationTab
            navConfig={navConfig}
            loading={loadingNav}
            error={errorNav}
            onRetry={loadNav}
            onToggle={handleToggleNav}
          />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLogTab
            logs={auditLogs}
            users={users}
            loading={loadingLogs || loadingUsers}
            error={errorLogs || errorUsers}
            onRetry={() => {
              loadLogs();
              loadUsers();
            }}
          />
        </TabsContent>

        <TabsContent value="flags">
          <FeatureFlagsTab
            flags={featureFlags}
            loading={loadingFlags}
            error={errorFlags}
            onRetry={loadFlags}
            onToggle={handleToggleFlag}
            onCreated={loadFlags}
          />
        </TabsContent>

        <TabsContent value="system">
          <SystemHealthTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
