"use client";

import * as React from "react";
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Wand2,
  ArrowRight,
  Plus,
  Minus,
  Info,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";

interface JdMatch {
  matchScore: number;
  matchGrade: "Excellent" | "Good" | "Fair" | "Poor";
  matchedSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  strengths: string[];
  gaps: string[];
  rewriteSuggestions: string[];
}

type PillTone = "default" | "good" | "warn" | "bad" | "info";

export function JdOptimizerModule() {
  const d = useResumeStore((s) => s.data);
  const setModule = useAppStore((s) => s.setModule);

  const defaultResumeText = React.useMemo(
    () =>
      `${d.name}\n${d.title}\n\nSUMMARY\n${d.summary}\n\nEXPERIENCE\n${d.experience
        .map(
          (e) =>
            `${e.role} @ ${e.company} (${e.start}-${e.end})\n${e.bullets
              .map((b) => "- " + b)
              .join("\n")}`
        )
        .join("\n\n")}\n\nSKILLS\n${d.skills.join(
        ", "
      )}\n\nPROJECTS\n${d.projects
        .map((p) => `${p.name}: ${p.description} [${p.tech.join(", ")}]`)
        .join("\n")}`,
    [d]
  );

  const [jd, setJd] = React.useState("");
  const [resume, setResume] = React.useState(defaultResumeText);
  const { data, loading, error, run } = useAI<JdMatch>();

  const calc = () => {
    if (!jd.trim()) {
      toast.error("Please paste a job description first.");
      return;
    }
    run("/api/ai/jd-match", { resumeText: resume, jd });
  };

  const gradeTone: PillTone =
    data?.matchGrade === "Excellent"
      ? "good"
      : data?.matchGrade === "Good"
        ? "info"
        : data?.matchGrade === "Fair"
          ? "warn"
          : "bad";

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Target}
        title="JD Optimizer"
        description="Match your resume to any job description"
      >
        <AIButton onClick={calc} loading={loading} disabled={loading}>
          {loading ? "Matching…" : "Calculate Match"}
        </AIButton>
      </ModuleHeader>

      {/* Inputs */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="size-4 text-primary" /> Job Description
              </CardTitle>
              {jd && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setJd("")}
                >
                  Clear
                </Button>
              )}
            </div>
            <CardDescription className="text-xs">
              Paste the full JD including responsibilities and required skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the job description here…"
              className="min-h-[260px] resize-y"
            />
            <p className="mt-2 text-xs text-muted-foreground">{jd.length} chars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" /> Your Resume
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setResume(defaultResumeText)}
              >
                Reset
              </Button>
            </div>
            <CardDescription className="text-xs">
              Pre-filled from your store · edit freely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              className="min-h-[260px] resize-y font-mono text-xs"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {resume.length} chars
            </p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-red-500/40 bg-red-500/5">
          <CardContent className="flex items-center gap-2 py-4 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="size-4" /> {error}
          </CardContent>
        </Card>
      )}

      {loading && !data && (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
            <TypingDots /> Matching your resume to the job description…
          </CardContent>
        </Card>
      )}

      {!data && !loading && !error && (
        <AIEmptyState
          icon={Target}
          title="No match calculated yet"
          description="Paste a job description on the left, keep your resume on the right, then click Calculate Match to see how well you fit."
        />
      )}

      {data && (
        <div className="space-y-6">
          {/* Score row */}
          <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
            <Card>
              <CardContent className="flex items-center gap-5 p-6">
                <ScoreRing value={data.matchScore} size={140} label="Match" />
                <div className="hidden space-y-1 lg:block">
                  <p className="text-sm text-muted-foreground">Match Score</p>
                  <p className="text-2xl font-bold">{data.matchScore}/100</p>
                  <Pill tone={gradeTone}>{data.matchGrade}</Pill>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MiniStat
                label="Matched"
                value={data.matchedSkills.length}
                tone="good"
                icon={CheckCircle2}
              />
              <MiniStat
                label="Missing"
                value={data.missingSkills.length}
                tone="bad"
                icon={Minus}
              />
              <MiniStat
                label="Extra"
                value={data.extraSkills.length}
                tone="info"
                icon={Plus}
              />
              <MiniStat
                label="Grade"
                value={<Pill tone={gradeTone}>{data.matchGrade}</Pill>}
                tone="default"
                icon={Sparkles}
              />
            </div>
          </div>

          {/* Skills: matched vs missing */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="size-4 text-primary" /> Matched Skills
                </CardTitle>
                <CardDescription className="text-xs">
                  {data.matchedSkills.length} skills you already have
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.matchedSkills.length ? (
                    data.matchedSkills.map((s) => (
                      <Pill key={s} tone="good">
                        {s}
                      </Pill>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No matched skills.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="size-4 text-red-500" /> Missing Skills
                </CardTitle>
                <CardDescription className="text-xs">
                  {data.missingSkills.length} skills the JD requires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.missingSkills.length ? (
                    data.missingSkills.map((s) => (
                      <Pill key={s} tone="bad">
                        {s}
                      </Pill>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No missing skills — full coverage!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Extra skills */}
          {data.extraSkills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="size-4 text-purple-500" /> Extra Skills
                  (resume-only)
                </CardTitle>
                <CardDescription className="text-xs">
                  Strengths you have beyond the JD — highlight these
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.extraSkills.map((s) => (
                    <Pill key={s} tone="info">
                      {s}
                    </Pill>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths & Gaps */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="size-4 text-primary" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{s}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="size-4 text-amber-500" /> Gaps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.gaps.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                    <span>{s}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Rewrite suggestions */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="size-4 text-primary" /> Rewrite Suggestions
              </CardTitle>
              <CardDescription className="text-xs">
                Tailor your resume to this JD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3">
                {data.rewriteSuggestions.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <span>{r}</span>
                  </li>
                ))}
              </ol>
              <Button
                className="gap-1.5"
                onClick={() => {
                  toast.success("Opening Resume Rewriter…", {
                    description: "Suggestions loaded into the rewriter context.",
                  });
                  setModule("resume-rewriter");
                }}
              >
                <Wand2 className="size-3.5" /> Rewrite Resume{" "}
                <ArrowRight className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  tone: PillTone;
  icon: LucideIcon;
}) {
  const toneMap: Record<PillTone, string> = {
    good: "bg-primary/12 text-primary",
    bad: "bg-red-500/12 text-red-600 dark:text-red-400",
    info: "bg-purple-500/12 text-purple-600 dark:text-purple-400",
    warn: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    default: "bg-muted text-muted-foreground",
  };
  const isNumber = typeof value === "number";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "grid size-7 place-items-center rounded-md",
              toneMap[tone]
            )}
          >
            <Icon className="size-3.5" />
          </div>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div
          className={cn(
            "mt-2 font-bold tracking-tight",
            isNumber ? "text-2xl" : "text-base"
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
