"use client";

import * as React from "react";
import {
  GitCompareArrows,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Trophy,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
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
import {
  ModuleHeader,
  AIButton,
  ScoreRing,
  Pill,
  AIEmptyState,
} from "@/components/shared/blocks";
import { useAI } from "@/components/shared/utils";
import { useResumeStore } from "@/store/resume-store";
import { cn } from "@/lib/utils";

interface MissingSkill {
  skill: string;
  importance: "Critical" | "High" | "Medium";
  why: string;
}

interface SkillGapResult {
  gapScore: number;
  currentLevel: string;
  targetLevel: string;
  haveSkills: string[];
  missingSkills: MissingSkill[];
  strengthsToLeverage: string[];
  quickWins: string[];
  longTermBets: string[];
}

const importanceTone = {
  Critical: "bad" as const,
  High: "warn" as const,
  Medium: "info" as const,
};

export function SkillGapModule() {
  const resumeSkills = useResumeStore((s) => s.data.skills);
  const [targetRole, setTargetRole] = React.useState("Staff Engineer");
  const [skillsInput, setSkillsInput] = React.useState(
    resumeSkills.join(", "),
  );
  const [years, setYears] = React.useState(6);
  const { data, loading, error, run } = useAI<SkillGapResult>();

  const analyze = () => {
    const currentSkills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!currentSkills.length || !targetRole) return;
    run("/api/ai/skill-gap", {
      currentSkills,
      targetRole,
      experienceYears: years,
    });
  };

  const reset = () => {
    setTargetRole("Staff Engineer");
    setSkillsInput(resumeSkills.join(", "));
    setYears(6);
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={GitCompareArrows}
        title="Skill Gap Analysis"
        description="Find exactly what's between you and your dream role"
      >
        {data && (
          <AIButton variant="outline" onClick={reset}>
            <RotateCcw className="size-3.5" /> Reset
          </AIButton>
        )}
      </ModuleHeader>

      {/* Input form */}
      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-[1.4fr_2fr_0.7fr_auto] md:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="target-role" className="text-xs font-medium">
              Target Role
            </Label>
            <Input
              id="target-role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Staff Engineer"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="current-skills" className="text-xs font-medium">
              Current Skills (comma-separated)
            </Label>
            <Input
              id="current-skills"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="React, TypeScript, Node.js…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="years" className="text-xs font-medium">
              Experience (yrs)
            </Label>
            <Input
              id="years"
              type="number"
              min={0}
              max={40}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
          </div>
          <AIButton
            onClick={analyze}
            loading={loading}
            disabled={!targetRole || !skillsInput}
            className="h-9"
          >
            Analyze Gap
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
          icon={GitCompareArrows}
          title="Ready to map your gap"
          description="Enter your target role and current skills above — we'll show you exactly what to learn next, ranked by importance."
        />
      )}

      {loading && !data && <SkeletonResults />}

      {data && (
        <div className="space-y-6">
          {/* Top: gap score + level transition */}
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5">
            <CardContent className="grid items-center gap-6 p-6 md:grid-cols-[auto_1fr]">
              <div className="flex items-center gap-5">
                <ScoreRing value={data.gapScore} size={130} label="Gap" />
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Gap Score
                  </p>
                  <p className="text-2xl font-bold">{data.gapScore}/100</p>
                  <p className="max-w-[14rem] text-xs text-muted-foreground">
                    {data.gapScore < 30
                      ? "You're nearly there — small targeted upskilling will close the gap."
                      : data.gapScore < 60
                        ? "Moderate gap. A focused 60–90 day plan will get you interview-ready."
                        : "Significant gap. Plan a deeper, multi-quarter learning sprint."}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <div className="flex-1 rounded-xl border border-border/60 bg-card p-4">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Current Level
                  </p>
                  <p className="mt-1 font-semibold">{data.currentLevel}</p>
                </div>
                <div className="grid place-items-center self-center">
                  <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                    <ArrowRight className="size-4" />
                  </div>
                </div>
                <div className="flex-1 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <p className="text-[10px] uppercase tracking-wide text-primary/80">
                    Target Level
                  </p>
                  <p className="mt-1 font-semibold text-primary">
                    {data.targetLevel}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two columns: have / missing */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    Skills You Have
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {data.haveSkills.length} relevant skills matched to{" "}
                    {targetRole}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {data.haveSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary"
                    >
                      <CheckCircle2 className="size-3" /> {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <div className="grid size-8 place-items-center rounded-lg bg-red-500/15 text-red-600 dark:text-red-400">
                  <AlertTriangle className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    Missing Skills
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {data.missingSkills.length} gaps — ranked by importance
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {data.missingSkills.map((m) => (
                  <div
                    key={m.skill}
                    className="rounded-lg border border-border/60 bg-muted/30 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{m.skill}</p>
                      <Pill tone={importanceTone[m.importance]}>
                        {m.importance}
                      </Pill>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {m.why}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Strengths to leverage */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <div className="grid size-8 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Trophy className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Strengths to Leverage
                </CardTitle>
                <CardDescription className="text-xs">
                  What you should double-down on in interviews & applications
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {data.strengthsToLeverage.map((s, i) => (
                <div
                  key={s}
                  className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"
                >
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-amber-500/15 text-xs font-bold text-amber-600 dark:text-amber-400">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{s}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick wins + Long term bets */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
                  <Zap className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Quick Wins</CardTitle>
                  <CardDescription className="text-xs">
                    Learn these fastest — biggest ROI in 30 days
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {data.quickWins.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary"
                    >
                      <Zap className="size-3" /> {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20">
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <div className="grid size-8 place-items-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
                  <Lightbulb className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Long Term Bets</CardTitle>
                  <CardDescription className="text-xs">
                    Deeper skills that signal seniority & leadership
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {data.longTermBets.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-full bg-purple-500/12 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400"
                    >
                      <Sparkles className="size-3" /> {s}
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

function SkeletonResults() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          <div className="size-[130px] rounded-full bg-muted shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 rounded bg-muted shimmer" />
            <div className="h-6 w-48 rounded bg-muted shimmer" />
            <div className="h-3 w-72 rounded bg-muted shimmer" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardContent className="space-y-2 p-6">
              <div className="h-5 w-40 rounded bg-muted shimmer" />
              <div className="h-3 w-full rounded bg-muted shimmer" />
              <div className="h-3 w-2/3 rounded bg-muted shimmer" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
