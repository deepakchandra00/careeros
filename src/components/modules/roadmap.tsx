"use client";

import * as React from "react";
import {
  Map as MapIcon,
  MapPin,
  Target,
  BookOpen,
  FileText,
  Wrench,
  PlayCircle,
  CircleCheck,
  Flag,
  Award,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ModuleHeader,
  AIButton,
  AIEmptyState,
} from "@/components/shared/blocks";
import { useAI } from "@/components/shared/utils";
import { cn } from "@/lib/utils";

interface Week {
  week: number;
  focus: string;
  tasks: string[];
}
interface Phase {
  goal: string;
  weeks: Week[];
}
interface Resource {
  skill: string;
  resource: string;
  type: "Course" | "Book" | "Docs" | "Project" | "Video";
}
interface RoadmapResult {
  title: string;
  overview: string;
  plan30: Phase;
  plan60: Phase;
  plan90: Phase;
  resources: Resource[];
  milestones: string[];
  certifications: string[];
}

const RESOURCE_META: Record<
  Resource["type"],
  { icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  Course: {
    icon: PlayCircle,
    classes:
      "bg-primary/12 text-primary border-primary/20",
  },
  Book: {
    icon: BookOpen,
    classes:
      "bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  Docs: {
    icon: FileText,
    classes:
      "bg-purple-500/12 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  Project: {
    icon: Wrench,
    classes:
      "bg-red-500/12 text-red-600 dark:text-red-400 border-red-500/20",
  },
  Video: {
    icon: PlayCircle,
    classes:
      "bg-teal-500/12 text-teal-600 dark:text-teal-400 border-teal-500/20",
  },
};

const PHASES = [
  {
    key: "plan30" as const,
    label: "Days 1–30",
    title: "Foundation",
    accent: "emerald" as const,
    weekStart: 1,
  },
  {
    key: "plan60" as const,
    label: "Days 31–60",
    title: "Application",
    accent: "amber" as const,
    weekStart: 5,
  },
  {
    key: "plan90" as const,
    label: "Days 61–90",
    title: "Mastery",
    accent: "purple" as const,
    weekStart: 9,
  },
];

const accentMap = {
  emerald: {
    header:
      "bg-gradient-to-r from-primary/15 via-emerald-500/10 to-transparent text-primary",
    dot: "bg-primary text-primary-foreground",
    line: "bg-primary/30",
    chip: "bg-primary/10 text-primary",
    ring: "ring-primary/20",
  },
  amber: {
    header:
      "bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500 text-white",
    line: "bg-amber-500/30",
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/20",
  },
  purple: {
    header:
      "bg-gradient-to-r from-purple-500/15 via-purple-400/10 to-transparent text-purple-600 dark:text-purple-400",
    dot: "bg-purple-500 text-white",
    line: "bg-purple-500/30",
    chip: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    ring: "ring-purple-500/20",
  },
};

export function RoadmapModule() {
  const [targetRole, setTargetRole] = React.useState("Staff Engineer");
  const [missingSkillsInput, setMissingSkillsInput] = React.useState(
    "Docker, GraphQL, AWS, System Design",
  );
  const { data, loading, error, run } = useAI<RoadmapResult>();
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});

  const generate = () => {
    const missingSkills = missingSkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!missingSkills.length || !targetRole) return;
    setChecked({});
    run("/api/ai/roadmap", { missingSkills, targetRole });
  };

  const reset = () => {
    setTargetRole("Staff Engineer");
    setMissingSkillsInput("Docker, GraphQL, AWS, System Design");
    setChecked({});
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={MapIcon}
        title="Learning Roadmap"
        description="Your personalized 30/60/90 day upskilling plan"
      >
        {data && (
          <AIButton variant="outline" onClick={reset}>
            <RotateCcw className="size-3.5" /> Reset
          </AIButton>
        )}
      </ModuleHeader>

      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_2fr_auto] md:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="road-role" className="text-xs font-medium">
              Target Role
            </Label>
            <Input
              id="road-role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Staff Engineer"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="road-skills" className="text-xs font-medium">
              Missing Skills (comma-separated)
            </Label>
            <Input
              id="road-skills"
              value={missingSkillsInput}
              onChange={(e) => setMissingSkillsInput(e.target.value)}
              placeholder="Docker, GraphQL, AWS…"
            />
          </div>
          <AIButton
            onClick={generate}
            loading={loading}
            disabled={!targetRole || !missingSkillsInput}
            className="h-9"
          >
            Generate Roadmap
          </AIButton>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="size-4 shrink-0" /> {error}
          </CardContent>
        </Card>
      )}

      {!data && !loading && !error && (
        <AIEmptyState
          icon={MapIcon}
          title="Plan your next 90 days"
          description="Add the skills you're missing and we'll generate a week-by-week roadmap with resources, milestones, and certifications."
        />
      )}

      {loading && !data && <SkeletonRoadmap />}

      {data && (
        <div className="space-y-6">
          {/* Title + overview */}
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {data.title}
                  </h2>
                  <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {data.overview}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase cards */}
          <div className="grid gap-4 lg:grid-cols-3">
            {PHASES.map((p) => {
              const phase = data[p.key];
              const accent = accentMap[p.accent];
              return (
                <Card key={p.key} className={cn("overflow-hidden ring-1", accent.ring)}>
                  <div className={cn("px-5 py-4", accent.header)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider opacity-80">
                          {p.label}
                        </p>
                        <h3 className="text-base font-bold">{p.title}</h3>
                      </div>
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", accent.chip)}>
                        Weeks {p.weekStart}–{p.weekStart + 3}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-start gap-2 rounded-lg bg-muted/40 p-3">
                      <Target className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Phase Goal
                        </p>
                        <p className="text-sm font-medium">{phase.goal}</p>
                      </div>
                    </div>

                    {/* Week timeline */}
                    <ol className="relative space-y-5 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-1.5rem)] before:w-px before:content-['']">
                      {phase.weeks.map((w) => (
                        <li key={w.week} className="relative pl-7">
                          <span
                            className={cn(
                              "absolute left-0 top-0.5 grid size-3.5 place-items-center rounded-full text-[9px] font-bold",
                              accent.dot,
                            )}
                          />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                Week {w.week}
                              </span>
                              <ChevronRight className="size-3 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {w.focus}
                              </span>
                            </div>
                            <ul className="space-y-1.5">
                              {w.tasks.map((t, ti) => {
                                const id = `${w.week}-${ti}`;
                                return (
                                  <li key={id} className="flex items-start gap-2">
                                    <Checkbox
                                      id={`task-${id}`}
                                      checked={!!checked[id]}
                                      onCheckedChange={(v) =>
                                        setChecked((c) => ({
                                          ...c,
                                          [id]: v === true,
                                        }))
                                      }
                                      className="mt-0.5 size-4"
                                    />
                                    <label
                                      htmlFor={`task-${id}`}
                                      className={cn(
                                        "cursor-pointer text-xs leading-relaxed",
                                        checked[id]
                                          ? "text-muted-foreground line-through"
                                          : "text-foreground",
                                      )}
                                    >
                                      {t}
                                    </label>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Resources */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <div className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
                <BookOpen className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base">Curated Resources</CardTitle>
                <CardDescription className="text-xs">
                  Hand-picked materials grouped by skill
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ResourceGrid resources={data.resources} />
            </CardContent>
          </Card>

          {/* Milestones + certifications */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <div className="grid size-8 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Flag className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Milestones</CardTitle>
                  <CardDescription className="text-xs">
                    Checkpoints to validate your progress
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-wrap items-start gap-x-2 gap-y-4">
                  {data.milestones.map((m, i) => (
                    <li
                      key={i}
                      className="flex min-w-[12rem] flex-1 items-start gap-3"
                    >
                      <div className="flex flex-col items-center">
                        <div className="grid size-8 place-items-center rounded-full bg-primary/15 text-primary">
                          <CircleCheck className="size-4" />
                        </div>
                        {i < data.milestones.length - 1 && (
                          <div className="hidden h-px w-12 bg-border sm:block" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Milestone {i + 1}
                        </p>
                        <p className="text-sm font-medium leading-snug">{m}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <div className="grid size-8 place-items-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
                  <Award className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Certifications</CardTitle>
                  <CardDescription className="text-xs">
                    Validate your new skills
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.certifications.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 rounded-full bg-purple-500/12 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400"
                    >
                      <Award className="size-3" /> {c}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function ResourceGrid({ resources }: { resources: Resource[] }) {
  // group by skill
  const grouped = React.useMemo(() => {
    const map = new Map<string, Resource[]>();
    for (const r of resources) {
      if (!map.has(r.skill)) map.set(r.skill, []);
      map.get(r.skill)!.push(r);
    }
    return Array.from(map.entries());
  }, [resources]);

  if (!grouped.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No resources returned — try regenerating.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {grouped.map(([skill, items]) => (
        <div
          key={skill}
          className="rounded-lg border border-border/60 bg-muted/30 p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-primary/15 text-[10px] font-bold text-primary">
              {skill.charAt(0).toUpperCase()}
            </span>
            <p className="text-sm font-semibold">{skill}</p>
            <span className="ml-auto inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <ul className="space-y-1.5">
            {items.map((r, i) => {
              const meta = RESOURCE_META[r.type];
              const Icon = meta.icon;
              return (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-md border border-border/40 bg-card px-2.5 py-2"
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-md border",
                      meta.classes,
                    )}
                  >
                    <Icon className="size-3" />
                  </span>
                  <span className="flex-1 truncate text-xs">{r.resource}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      meta.classes,
                    )}
                  >
                    {r.type}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SkeletonRoadmap() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="h-5 w-64 rounded bg-muted shimmer" />
          <div className="h-3 w-full rounded bg-muted shimmer" />
          <div className="h-3 w-2/3 rounded bg-muted shimmer" />
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <div className="h-16 rounded-t-xl bg-muted shimmer" />
            <CardContent className="space-y-3 p-5">
              <div className="h-3 w-32 rounded bg-muted shimmer" />
              <div className="h-3 w-full rounded bg-muted shimmer" />
              <div className="h-3 w-3/4 rounded bg-muted shimmer" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
