"use client";

import * as React from "react";
import {
  KanbanSquare,
  Plus,
  Search,
  ArrowRight,
  MapPin,
  Wallet,
  Calendar,
  Building2,
  Tag,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ModuleHeader,
  Pill,
} from "@/components/shared/blocks";
import { cn } from "@/lib/utils";

type ColumnId =
  | "wishlist"
  | "applied"
  | "interview"
  | "hr"
  | "offer"
  | "rejected";

type Source =
  | "LinkedIn"
  | "Naukri"
  | "Indeed"
  | "Wellfound"
  | "Glassdoor"
  | "Referral";

interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  matchScore: number;
  source: Source;
  column: ColumnId;
  appliedDate: string;
  tags: string[];
}

const COLUMNS: {
  id: ColumnId;
  label: string;
  accent: string;
  dot: string;
  headerBg: string;
}[] = [
  {
    id: "wishlist",
    label: "Wishlist",
    accent: "text-slate-600 dark:text-slate-300",
    dot: "bg-slate-400",
    headerBg: "bg-slate-500/10",
  },
  {
    id: "applied",
    label: "Applied",
    accent: "text-primary",
    dot: "bg-primary",
    headerBg: "bg-primary/10",
  },
  {
    id: "interview",
    label: "Interview",
    accent: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    headerBg: "bg-amber-500/10",
  },
  {
    id: "hr",
    label: "HR",
    accent: "text-purple-600 dark:text-purple-400",
    dot: "bg-purple-500",
    headerBg: "bg-purple-500/10",
  },
  {
    id: "offer",
    label: "Offer",
    accent: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    headerBg: "bg-emerald-500/10",
  },
  {
    id: "rejected",
    label: "Rejected",
    accent: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    headerBg: "bg-red-500/10",
  },
];

const COLUMN_FLOW: ColumnId[] = [
  "wishlist",
  "applied",
  "interview",
  "hr",
  "offer",
];

const SOURCE_STYLES: Record<Source, string> = {
  LinkedIn: "bg-[#0a66c2]/12 text-[#0a66c2] dark:text-[#5fa8f5]",
  Naukri: "bg-red-500/12 text-red-600 dark:text-red-400",
  Indeed: "bg-purple-500/12 text-purple-600 dark:text-purple-400",
  Wellfound: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  Glassdoor: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  Referral: "bg-slate-500/12 text-slate-600 dark:text-slate-300",
};

const SEED_JOBS: Job[] = [
  {
    id: "j1",
    company: "Atlassian",
    role: "Staff Engineer — Frontend Platform",
    location: "Bengaluru · Hybrid",
    salary: "₹70–95 LPA",
    matchScore: 94,
    source: "LinkedIn",
    column: "interview",
    appliedDate: "12 Jun",
    tags: ["React", "Design Systems", "Next.js"],
  },
  {
    id: "j2",
    company: "Microsoft",
    role: "SDE III — Web Experiences",
    location: "Hyderabad · Onsite",
    salary: "₹55–75 LPA",
    matchScore: 89,
    source: "LinkedIn",
    column: "applied",
    appliedDate: "18 Jun",
    tags: ["TypeScript", "Azure", "React"],
  },
  {
    id: "j3",
    company: "Razorpay",
    role: "Senior Frontend Engineer",
    location: "Bengaluru · Hybrid",
    salary: "₹42–58 LPA",
    matchScore: 91,
    source: "Referral",
    column: "hr",
    appliedDate: "05 Jun",
    tags: ["React", "Payments", "Node.js"],
  },
  {
    id: "j4",
    company: "PhonePe",
    role: "Frontend Tech Lead",
    location: "Bengaluru · Remote",
    salary: "₹48–62 LPA",
    matchScore: 78,
    source: "Wellfound",
    column: "wishlist",
    appliedDate: "—",
    tags: ["React", "Fintech", "Leadership"],
  },
  {
    id: "j5",
    company: "Flipkart",
    role: "Senior React Engineer",
    location: "Bengaluru · Hybrid",
    salary: "₹45–60 LPA",
    matchScore: 96,
    source: "Naukri",
    column: "offer",
    appliedDate: "01 Jun",
    tags: ["React", "Scale", "Web Vitals"],
  },
  {
    id: "j6",
    company: "Zomato",
    role: "UI Engineer — Consumer App",
    location: "Gurugram · Hybrid",
    salary: "₹38–50 LPA",
    matchScore: 65,
    source: "Indeed",
    column: "rejected",
    appliedDate: "22 May",
    tags: ["React", "Animation"],
  },
  {
    id: "j7",
    company: "Walmart Global Tech",
    role: "Lead Frontend Engineer",
    location: "Bengaluru · Hybrid",
    salary: "₹52–70 LPA",
    matchScore: 88,
    source: "Glassdoor",
    column: "applied",
    appliedDate: "20 Jun",
    tags: ["React", "eCommerce", "GraphQL"],
  },
  {
    id: "j8",
    company: "Atlassian",
    role: "Senior SDE — Jira Cloud",
    location: "Bengaluru · Remote",
    salary: "₹50–68 LPA",
    matchScore: 82,
    source: "LinkedIn",
    column: "wishlist",
    appliedDate: "—",
    tags: ["React", "TypeScript", "Cloud"],
  },
];

function scoreTone(score: number): "good" | "info" | "warn" | "bad" {
  if (score >= 85) return "good";
  if (score >= 70) return "info";
  if (score >= 50) return "warn";
  return "bad";
}

function companyInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function avatarColor(name: string): string {
  const palette = [
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    "bg-red-500/15 text-red-600 dark:text-red-400",
    "bg-slate-500/15 text-slate-600 dark:text-slate-300",
    "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export function JobTrackerModule() {
  const [jobs, setJobs] = React.useState<Job[]>(SEED_JOBS);
  const [query, setQuery] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [detailJob, setDetailJob] = React.useState<Job | null>(null);

  // Add form state
  const [form, setForm] = React.useState({
    company: "",
    role: "",
    location: "Bengaluru, India",
    salary: "",
    source: "LinkedIn" as Source,
    column: "wishlist" as ColumnId,
  });

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(
      (j) =>
        j.company.toLowerCase().includes(q) ||
        j.role.toLowerCase().includes(q)
    );
  }, [jobs, query]);

  const byColumn = React.useMemo(() => {
    const map: Record<ColumnId, Job[]> = {
      wishlist: [],
      applied: [],
      interview: [],
      hr: [],
      offer: [],
      rejected: [],
    };
    filtered.forEach((j) => map[j.column].push(j));
    return map;
  }, [filtered]);

  const stats = React.useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter(
      (j) => j.column !== "rejected" && j.column !== "offer"
    ).length;
    const offers = jobs.filter((j) => j.column === "offer").length;
    const reject = jobs.filter((j) => j.column === "rejected").length;
    return { total, active, offers, reject };
  }, [jobs]);

  function advance(id: string) {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== id) return j;
        const idx = COLUMN_FLOW.indexOf(j.column);
        if (idx === -1 || idx === COLUMN_FLOW.length - 1) return j;
        return { ...j, column: COLUMN_FLOW[idx + 1] };
      })
    );
    const job = jobs.find((j) => j.id === id);
    if (job) {
      const next = COLUMN_FLOW[COLUMN_FLOW.indexOf(job.column) + 1];
      const label = COLUMNS.find((c) => c.id === next)?.label ?? next;
      toast.success(`Moved to ${label}`, {
        description: `${job.role} · ${job.company}`,
      });
    }
  }

  function addJob() {
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    const newJob: Job = {
      id: `j${Date.now()}`,
      company: form.company.trim(),
      role: form.role.trim(),
      location: form.location.trim() || "—",
      salary: form.salary.trim() || "—",
      matchScore: Math.floor(60 + Math.random() * 35),
      source: form.source,
      column: form.column,
      appliedDate:
        form.column === "wishlist"
          ? "—"
          : new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            }),
      tags: [],
    };
    setJobs((prev) => [newJob, ...prev]);
    setForm({
      company: "",
      role: "",
      location: "Bengaluru, India",
      salary: "",
      source: "LinkedIn",
      column: "wishlist",
    });
    setAddOpen(false);
    toast.success("Application added", {
      description: `${newJob.role} @ ${newJob.company}`,
    });
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={KanbanSquare}
        title="Job Tracker"
        description="Track every application from wishlist to offer"
      >
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" /> Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add new application</DialogTitle>
              <DialogDescription>
                Manually track a job you applied to or want to apply for.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="e.g. Atlassian"
                  value={form.company}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, company: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  placeholder="e.g. Staff Engineer"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Bengaluru"
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    placeholder="₹50–70 LPA"
                    value={form.salary}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, salary: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Source</Label>
                  <Select
                    value={form.source}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, source: v as Source }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        [
                          "LinkedIn",
                          "Naukri",
                          "Indeed",
                          "Wellfound",
                          "Glassdoor",
                          "Referral",
                        ] as Source[]
                      ).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Stage</Label>
                  <Select
                    value={form.column}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, column: v as ColumnId }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLUMNS.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addJob}>
                <Plus className="size-3.5" /> Add to tracker
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ModuleHeader>

      {/* Toolbar */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by company or role…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:bg-accent"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="default">Total {stats.total}</Pill>
            <Pill tone="info">Active {stats.active}</Pill>
            <Pill tone="good">Offers {stats.offers}</Pill>
            <Pill tone="bad">Rejected {stats.reject}</Pill>
          </div>
        </CardContent>
      </Card>

      {/* Kanban */}
      <div className="overflow-x-auto pb-2 scroll-thin">
        <div className="flex min-w-max gap-4">
          {COLUMNS.map((col) => {
            const items = byColumn[col.id];
            return (
              <div
                key={col.id}
                className="flex w-[280px] shrink-0 flex-col rounded-xl border bg-muted/30"
              >
                <div
                  className={cn(
                    "flex items-center justify-between rounded-t-xl px-3 py-2.5",
                    col.headerBg
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", col.dot)} />
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        col.accent
                      )}
                    >
                      {col.label}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-5 justify-center bg-background/80 px-1.5 text-[11px] font-semibold"
                  >
                    {items.length}
                  </Badge>
                </div>
                <div className="flex-1 space-y-2 p-2 max-h-[70vh] overflow-y-auto scroll-thin">
                  {items.length === 0 ? (
                    <div className="grid place-items-center rounded-lg border border-dashed py-8 text-center">
                      <p className="text-xs text-muted-foreground">
                        No jobs here
                      </p>
                    </div>
                  ) : (
                    items.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        canAdvance={
                          col.id !== "rejected" &&
                          col.id !== "offer" &&
                          COLUMN_FLOW.includes(col.id)
                        }
                        onAdvance={() => advance(job.id)}
                        onOpen={() => setDetailJob(job)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog
        open={!!detailJob}
        onOpenChange={(o) => !o && setDetailJob(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {detailJob && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-xl text-base font-bold",
                      avatarColor(detailJob.company)
                    )}
                  >
                    {companyInitial(detailJob.company)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-base">
                      {detailJob.role}
                    </DialogTitle>
                    <DialogDescription className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-medium text-foreground">
                        {detailJob.company}
                      </span>
                      <span className="text-muted-foreground">
                        · {detailJob.location}
                      </span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={scoreTone(detailJob.matchScore)}>
                    {detailJob.matchScore}% match
                  </Pill>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      SOURCE_STYLES[detailJob.source]
                    )}
                  >
                    {detailJob.source}
                  </span>
                  <Pill tone="default">
                    {
                      COLUMNS.find((c) => c.id === detailJob.column)
                        ?.label
                    }
                  </Pill>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow
                    icon={Wallet}
                    label="Salary"
                    value={detailJob.salary}
                  />
                  <DetailRow
                    icon={Calendar}
                    label="Applied"
                    value={detailJob.appliedDate}
                  />
                  <DetailRow
                    icon={Building2}
                    label="Company"
                    value={detailJob.company}
                  />
                  <DetailRow
                    icon={MapPin}
                    label="Location"
                    value={detailJob.location}
                  />
                </div>
                {detailJob.tags.length > 0 && (
                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Tag className="size-3" /> Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {detailJob.tags.map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="font-normal"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDetailJob(null)}
                >
                  Close
                </Button>
                {COLUMN_FLOW.includes(detailJob.column) &&
                  detailJob.column !== "offer" && (
                    <Button
                      onClick={() => {
                        advance(detailJob.id);
                        setDetailJob(null);
                      }}
                    >
                      <ArrowRight className="size-3.5" /> Advance stage
                    </Button>
                  )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function JobCard({
  job,
  canAdvance,
  onAdvance,
  onOpen,
}: {
  job: Job;
  canAdvance: boolean;
  onAdvance: () => void;
  onOpen: () => void;
}) {
  return (
    <Card
      className="group cursor-pointer gap-0 py-0 transition-all hover:-translate-y-0.5 hover:shadow-md"
      onClick={onOpen}
    >
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start gap-2">
          <div
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold",
              avatarColor(job.company)
            )}
          >
            {companyInitial(job.company)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">
              {job.company}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {job.role}
            </p>
          </div>
          {canAdvance && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdvance();
              }}
              className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-primary hover:text-primary-foreground group-hover:opacity-100"
              aria-label="Advance to next stage"
            >
              <ArrowRight className="size-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="size-3" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Pill tone={scoreTone(job.matchScore)}>
            {job.matchScore}% match
          </Pill>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
              SOURCE_STYLES[job.source]
            )}
          >
            {job.source}
          </span>
        </div>
        <div className="flex items-center justify-between border-t pt-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Wallet className="size-3" />
            {job.salary}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {job.appliedDate}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
