"use client";

import * as React from "react";
import {
  Sparkles,
  GraduationCap,
  Code2,
  Users,
  Boxes,
  Crown,
  Building2,
  Save,
  Check,
  ChevronRight,
  ArrowRight,
  Quote,
  Lightbulb,
  RotateCcw,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ModuleHeader, AIButton, AIEmptyState, Pill } from "@/components/shared/blocks";
import { useAI } from "@/components/shared/utils";
import { useResumeStore } from "@/store/resume-store";
import { cn } from "@/lib/utils";

type TargetLevel = "entry" | "senior" | "lead" | "architect" | "manager";

interface LevelDef {
  id: TargetLevel;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const LEVELS: LevelDef[] = [
  { id: "entry", label: "Entry", desc: "0–2 yrs", icon: GraduationCap },
  { id: "senior", label: "Senior", desc: "5+ yrs", icon: Code2 },
  { id: "lead", label: "Lead", desc: "7+ yrs", icon: Users },
  { id: "architect", label: "Architect", desc: "10+ yrs", icon: Boxes },
  { id: "manager", label: "Manager", desc: "People", icon: Crown },
];

const TONES = [
  { value: "confident", label: "Confident" },
  { value: "concise", label: "Concise" },
  { value: "story-driven", label: "Story-driven" },
  { value: "technical", label: "Technical" },
  { value: "executive", label: "Executive" },
];

interface RewrittenExperience {
  role: string;
  company: string;
  bullets: string[];
}

interface RewriterResult {
  newTitle: string;
  newSummary: string;
  rewrittenExperience: RewrittenExperience[];
  suggestedSkills: string[];
  rationale: string[];
}

export function ResumeRewriterModule() {
  const d = useResumeStore((s) => s.data);
  const [targetLevel, setTargetLevel] = React.useState<TargetLevel>("senior");
  const [company, setCompany] = React.useState("");
  const [tone, setTone] = React.useState("confident");

  const { data, loading, run } = useAI<RewriterResult>();

  const resumeText = React.useMemo(() => {
    return [
      `${d.name}`,
      `${d.title}`,
      ``,
      `SUMMARY`,
      `${d.summary}`,
      ``,
      `EXPERIENCE`,
      d.experience
        .map(
          (e) =>
            `${e.role} @ ${e.company} (${e.start}-${e.end})\n${e.bullets
              .map((b) => "- " + b)
              .join("\n")}`
        )
        .join("\n\n"),
      ``,
      `SKILLS`,
      d.skills.join(", "),
      ``,
      `PROJECTS`,
      d.projects
        .map((p) => `${p.name}: ${p.description} [${p.tech.join(", ")}]`)
        .join("\n"),
      ``,
      `EDUCATION`,
      d.education.map((ed) => `${ed.degree}, ${ed.school} (${ed.start}-${ed.end})`).join("\n"),
    ].join("\n");
  }, [d]);

  const handleRewrite = React.useCallback(() => {
    run("/api/ai/rewriter", {
      resumeText,
      targetLevel,
      company: company.trim() || undefined,
      tone,
    });
  }, [run, resumeText, targetLevel, company, tone]);

  function handleSave() {
    toast.success("Saved to Version Manager", {
      description: `${targetLevel} version${company ? ` for ${company}` : ""} added to your library.`,
    });
  }

  const activeLevel = LEVELS.find((l) => l.id === targetLevel) as LevelDef;
  const activeTone = TONES.find((t) => t.value === tone);

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Sparkles}
        title="AI Resume Rewriter"
        description="Transform tone & seniority with one click"
      />

      {/* Target seniority stepper */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Target seniority</CardTitle>
          <CardDescription className="text-xs">
            Pick where you want AI to position your career narrative
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-stretch gap-2 sm:gap-1">
            {LEVELS.map((lvl, i) => {
              const Icon = lvl.icon;
              const active = targetLevel === lvl.id;
              return (
                <React.Fragment key={lvl.id}>
                  <button
                    type="button"
                    onClick={() => setTargetLevel(lvl.id)}
                    className={cn(
                      "group relative flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all sm:min-w-[120px]",
                      active
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-accent/50"
                    )}
                  >
                    {active && (
                      <div className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "grid size-10 place-items-center rounded-lg transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className={cn("text-sm font-semibold", active && "text-primary")}>{lvl.label}</p>
                      <p className="text-[10px] text-muted-foreground">{lvl.desc}</p>
                    </div>
                  </button>
                  {i < LEVELS.length - 1 && (
                    <div className="hidden shrink-0 items-center text-muted-foreground/40 sm:flex">
                      <ChevronRight className="size-4" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Options + CTA */}
      <Card>
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Target company <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Stripe, Razorpay"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tone</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AIButton
            onClick={handleRewrite}
            loading={loading}
            disabled={loading}
            className="h-9 px-5"
          >
            Rewrite Resume
          </AIButton>
        </CardContent>
      </Card>

      {/* Empty state */}
      {!data && !loading && (
        <AIEmptyState
          icon={Sparkles}
          title="Ready to reinvent your resume"
          description="Pick a target level and let AI reposition your career narrative."
        />
      )}

      {/* Loading state */}
      {loading && (
        <Card className="border-primary/30">
          <CardContent className="flex items-center justify-center gap-3 py-12">
            <Sparkles className="size-5 animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">
              Rewriting your resume for{" "}
              <span className="font-medium text-foreground">{activeLevel.label}</span>
              {company ? ` at ${company}` : ""}…
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-4">
          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-gradient-to-r from-primary/5 to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-primary/15 text-primary">
                <activeLevel.icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  Rewritten for {activeLevel.label}
                  {company ? ` · ${company}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tone: {activeTone?.label} · {data.rewrittenExperience?.length ?? 0} roles updated
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRewrite}
                disabled={loading}
                className="gap-1.5"
              >
                <RotateCcw className="size-3.5" /> Regenerate
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-1.5">
                <Save className="size-3.5" /> Save as new version
              </Button>
            </div>
          </div>

          {/* Top row: headline + experience */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* New headline + summary */}
            <Card className="border-primary/20 lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">New Headline</CardTitle>
                  <Pill tone="good">Updated</Pill>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Title
                  </p>
                  <p className="text-lg font-bold tracking-tight text-primary">{data.newTitle}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Summary
                  </p>
                  <div className="relative mt-1 rounded-lg bg-muted/50 p-3">
                    <Quote className="absolute -left-1 -top-2 size-4 text-primary/40" />
                    <p className="text-sm leading-relaxed text-foreground">{data.newSummary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewritten experience */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Rewritten Experience</CardTitle>
                  <Pill tone="info">{data.rewrittenExperience?.length ?? 0} roles</Pill>
                </div>
                <CardDescription className="text-xs">
                  AI-repositioned bullets tailored for {activeLevel.label}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(data.rewrittenExperience ?? []).map((exp, i) => (
                  <div key={i} className="rounded-lg border bg-card p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{exp.role}</p>
                        <p className="text-xs text-muted-foreground">{exp.company}</p>
                      </div>
                      <ArrowRight className="size-3.5 text-muted-foreground/50" />
                    </div>
                    <ul className="space-y-1.5">
                      {(exp.bullets ?? []).map((b, j) => (
                        <li key={j} className="flex gap-2 text-sm text-foreground">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                          <span className="leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Bottom row: skills + rationale */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Suggested skills */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Suggested Skills</CardTitle>
                  <Pill tone="warn">{(data.suggestedSkills ?? []).length} new</Pill>
                </div>
                <CardDescription className="text-xs">
                  Add these to align with the {activeLevel.label} level
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(data.suggestedSkills ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No new skills suggested.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {data.suggestedSkills.map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="bg-primary/10 text-primary hover:bg-primary/15"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rationale */}
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="size-4 text-amber-500" /> Rationale
                </CardTitle>
                <CardDescription className="text-xs">Why AI made these changes</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(data.rationale ?? []).map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
