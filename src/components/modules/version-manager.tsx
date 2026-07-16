"use client";

import * as React from "react";
import {
  Layers,
  Plus,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Atom,
  Smartphone,
  Building2,
  Users,
  Package,
  Globe,
  MapPin,
  Clock,
  TrendingUp,
  Trophy,
  Archive,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ModuleHeader, Pill } from "@/components/shared/blocks";
import { cn } from "@/lib/utils";

type VersionStatus = "Active" | "Archived";

interface Version {
  id: string;
  name: string;
  role: string;
  icon: LucideIcon;
  accent: string;
  ats: number;
  updated: string;
  status: VersionStatus;
  market: string;
}

const VERSIONS: Version[] = [
  {
    id: "v1",
    name: "React Resume",
    role: "Senior Frontend Engineer",
    icon: Atom,
    accent: "oklch(0.62 0.15 162)",
    ats: 94,
    updated: "2d ago",
    status: "Active",
    market: "India",
  },
  {
    id: "v2",
    name: "React Native Resume",
    role: "Mobile Engineer",
    icon: Smartphone,
    accent: "oklch(0.6 0.13 200)",
    ats: 88,
    updated: "3d ago",
    status: "Active",
    market: "India",
  },
  {
    id: "v3",
    name: "Architect Resume",
    role: "Frontend Architect",
    icon: Building2,
    accent: "oklch(0.62 0.19 300)",
    ats: 91,
    updated: "5d ago",
    status: "Active",
    market: "India",
  },
  {
    id: "v4",
    name: "Manager Resume",
    role: "Engineering Manager",
    icon: Users,
    accent: "oklch(0.75 0.16 70)",
    ats: 86,
    updated: "1w ago",
    status: "Active",
    market: "India",
  },
  {
    id: "v5",
    name: "Product Resume",
    role: "Technical Product Manager",
    icon: Package,
    accent: "oklch(0.65 0.22 12)",
    ats: 84,
    updated: "1w ago",
    status: "Active",
    market: "India",
  },
  {
    id: "v6",
    name: "USA Resume",
    role: "Senior Frontend Engineer (US)",
    icon: Globe,
    accent: "oklch(0.7 0.15 162)",
    ats: 89,
    updated: "4d ago",
    status: "Active",
    market: "USA",
  },
  {
    id: "v7",
    name: "Europe Resume",
    role: "Lead Engineer (EU)",
    icon: MapPin,
    accent: "oklch(0.7 0.18 40)",
    ats: 82,
    updated: "2w ago",
    status: "Archived",
    market: "Europe",
  },
];

type Filter = "All" | "Active" | "Archived";

export function VersionManagerModule() {
  const [filter, setFilter] = React.useState<Filter>("All");

  const versions = React.useMemo(() => {
    if (filter === "All") return VERSIONS;
    return VERSIONS.filter((v) => v.status === filter);
  }, [filter]);

  const avgAts = Math.round(
    VERSIONS.reduce((a, v) => a + v.ats, 0) / VERSIONS.length
  );
  const bestAts = Math.max(...VERSIONS.map((v) => v.ats));
  const activeCount = VERSIONS.filter((v) => v.status === "Active").length;
  const archivedCount = VERSIONS.length - activeCount;
  const bestName = VERSIONS.find((v) => v.ats === bestAts)?.name ?? "—";

  const counts: Record<Filter, number> = {
    All: VERSIONS.length,
    Active: activeCount,
    Archived: archivedCount,
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Layers}
        title="Version Manager"
        description="Manage tailored resume variants for every role & market"
      >
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() =>
            toast.success("New version", {
              description: "Opening the resume builder with a fresh template…",
            })
          }
        >
          <Plus className="size-3.5" /> New Version
        </Button>
      </ModuleHeader>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          icon={Layers}
          label="Total Versions"
          value={VERSIONS.length}
          sub={`${activeCount} active`}
          color="oklch(0.62 0.15 162)"
        />
        <StatTile
          icon={TrendingUp}
          label="Avg ATS"
          value={avgAts}
          sub="/ 100"
          color="oklch(0.7 0.15 70)"
        />
        <StatTile
          icon={Trophy}
          label="Best Score"
          value={bestAts}
          sub={bestName}
          color="oklch(0.65 0.22 12)"
        />
        <StatTile
          icon={Archive}
          label="Archived"
          value={archivedCount}
          sub="kept for reference"
          color="oklch(0.62 0.19 300)"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {(["All", "Active", "Archived"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {f}
            <span
              className={cn(
                "ml-1.5",
                filter === f
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground"
              )}
            >
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Version grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {versions.map((v) => (
          <VersionCard key={v.id} v={v} />
        ))}
      </div>

      {versions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No {filter.toLowerCase()} versions.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function VersionCard({ v }: { v: Version }) {
  const Icon = v.icon;
  const onAction = (action: "Edit" | "Duplicate" | "Delete") => {
    const desc =
      action === "Delete"
        ? "Version moved to trash (demo)."
        : action === "Duplicate"
          ? "Created a copy (demo)."
          : "Opening editor (demo)…";
    toast.success(`${action} · ${v.name}`, { description: desc });
  };
  return (
    <Card className="group relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="h-1.5 w-full" style={{ backgroundColor: v.accent }} />
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="grid size-10 place-items-center rounded-lg"
              style={{
                backgroundColor: `${v.accent}1a`,
                color: v.accent,
              }}
            >
              <Icon className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-tight">
                {v.name}
              </h3>
              <p className="truncate text-xs text-muted-foreground">
                {v.role}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAction("Edit")}>
                <Pencil className="mr-2 size-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("Duplicate")}>
                <Copy className="mr-2 size-3.5" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onAction("Delete")}
              >
                <Trash2 className="mr-2 size-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
          <div className="flex items-center gap-3">
            <MiniRing value={v.ats} color={v.accent} />
            <div>
              <p className="text-xs text-muted-foreground">ATS Score</p>
              <p className="text-sm font-semibold">{v.ats}/100</p>
            </div>
          </div>
          <div className="text-right">
            {v.status === "Active" ? (
              <Pill tone="good">Active</Pill>
            ) : (
              <Pill tone="default">Archived</Pill>
            )}
            <p className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
              <Clock className="size-2.5" /> {v.updated}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <MapPin className="size-2.5" /> {v.market}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            v1.0
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniRing({
  value,
  color,
  size = 56,
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="oklch(0.7 0.02 200 / 0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-bold" style={{ color }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <div
            className="grid size-7 place-items-center rounded-md"
            style={{ backgroundColor: `${color}1a`, color }}
          >
            <Icon className="size-3.5" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight">
          {value}
          {sub && (
            <span className="ml-1 text-xs font-medium text-muted-foreground">
              {sub}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
