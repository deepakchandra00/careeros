"use client";

import * as React from "react";
import {
  ScanSearch,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  SpellCheck,
  LayoutList,
  X,
  IndianRupee,
  TrendingUp,
  Hash,
  Lightbulb,
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
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

interface AtsReview {
  atsScore: number;
  atsGrade: string;
  missingKeywords: string[];
  weakBullets: { count: number; examples: string[] };
  grammarIssues: { count: number; examples: string[] };
  formattingIssues: { count: number; examples: string[] };
  suggestedSalaryINR: { low: number; high: number };
  interviewProbability: "High" | "Medium" | "Low";
  strengths: string[];
  topRecommendations: string[];
}

export function ResumeReviewModule() {
  const d = useResumeStore((s) => s.data);
  const resumeText = React.useMemo(
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

  const { data, loading, error, run } = useAI<AtsReview>();
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    setFileName(f.name);
    toast.success(`Loaded "${f.name}"`, {
      description: "Analyzing your current resume from the store…",
    });
  };

  const analyze = () => {
    run("/api/ai/ats-review", { resumeText });
  };

  const useCurrent = () => {
    setFileName(null);
    toast.info("Using your current resume", {
      description: `${d.name} · ${d.title}`,
    });
  };

  const interviewTone =
    data?.interviewProbability === "High"
      ? "good"
      : data?.interviewProbability === "Medium"
        ? "warn"
        : "bad";

  const gradeTone =
    data?.atsGrade === "A"
      ? "good"
      : data?.atsGrade === "B"
        ? "info"
        : data?.atsGrade === "C"
          ? "warn"
          : "bad";

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={ScanSearch}
        title="Resume Review"
        description="Upload your resume for an instant ATS scan"
      >
        <AIButton onClick={analyze} loading={loading} disabled={loading}>
          {loading ? "Analyzing…" : "Analyze"}
        </AIButton>
      </ModuleHeader>

      {/* Upload zone */}
      <Card>
        <CardContent className="p-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 text-center transition-colors",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-accent/40"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] || undefined)}
            />
            <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Upload className="size-5" />
            </div>
            <div>
              <p className="font-medium">
                Drop your resume here, or{" "}
                <span className="text-primary underline-offset-2 hover:underline">
                  browse
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, DOCX or TXT · up to 5MB
              </p>
            </div>
            {fileName && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFileName(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                <FileText className="size-3" /> {fileName}
                <X className="size-3" />
              </button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {fileName
                ? "Analyzing your current resume…"
                : "No file? We’ll analyze your current resume from the builder."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={useCurrent}
              disabled={loading}
            >
              <FileText className="mr-1 size-3.5" /> Use current resume
            </Button>
          </div>
        </CardContent>
      </Card>

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
            <TypingDots /> Scanning resume against 200+ ATS rules…
          </CardContent>
        </Card>
      )}

      {!data && !loading && !error && (
        <AIEmptyState
          icon={ScanSearch}
          title="No analysis yet"
          description="Upload your resume or use the current one, then hit Analyze to get your ATS score, missing keywords, and tailored recommendations."
        />
      )}

      {data && (
        <div className="space-y-6">
          {/* Top row: Score + stats */}
          <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
            <Card>
              <CardContent className="flex items-center gap-5 p-6">
                <ScoreRing value={data.atsScore} size={140} label="ATS" />
                <div className="hidden space-y-1 lg:block">
                  <p className="text-sm text-muted-foreground">ATS Score</p>
                  <p className="text-2xl font-bold">{data.atsScore}/100</p>
                  <p className="text-xs text-muted-foreground">
                    {data.atsScore >= 80
                      ? "Excellent — shortlist-worthy"
                      : data.atsScore >= 50
                        ? "Good — needs polish"
                        : "Needs work"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                icon={Hash}
                label="ATS Grade"
                value={<Pill tone={gradeTone}>Grade {data.atsGrade}</Pill>}
                hint="Letter grade"
              />
              <StatCard
                icon={IndianRupee}
                label="Suggested Salary"
                value={
                  <span className="text-lg font-bold">
                    ₹{data.suggestedSalaryINR.low}–{data.suggestedSalaryINR.high}
                    <span className="ml-0.5 text-xs font-medium text-muted-foreground">
                      LPA
                    </span>
                  </span>
                }
                hint="Market range (INR)"
              />
              <StatCard
                icon={TrendingUp}
                label="Interview Probability"
                value={<Pill tone={interviewTone}>{data.interviewProbability}</Pill>}
                hint="Recruiter callback odds"
              />
            </div>
          </div>

          {/* Missing keywords */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" /> Missing Keywords
              </CardTitle>
              <CardDescription className="text-xs">
                High-impact terms to add for senior engineering roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.missingKeywords.length ? (
                  data.missingKeywords.map((k) => (
                    <Pill key={k} tone="bad">
                      {k}
                    </Pill>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No missing keywords — great coverage!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Issues */}
          <div className="grid gap-4 md:grid-cols-3">
            <IssueCard
              icon={LayoutList}
              tone="amber"
              title="Weak Bullets"
              count={data.weakBullets.count}
              examples={data.weakBullets.examples}
            />
            <IssueCard
              icon={SpellCheck}
              tone="rose"
              title="Grammar Issues"
              count={data.grammarIssues.count}
              examples={data.grammarIssues.examples}
            />
            <IssueCard
              icon={LayoutList}
              tone="purple"
              title="Formatting Issues"
              count={data.formattingIssues.count}
              examples={data.formattingIssues.examples}
            />
          </div>

          {/* Strengths + Recommendations */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="size-4 text-primary" /> Strengths
                </CardTitle>
                <CardDescription className="text-xs">
                  What’s working well in your resume
                </CardDescription>
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

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="size-4 text-primary" /> Top Recommendations
                </CardTitle>
                <CardDescription className="text-xs">
                  Actionable steps to boost your ATS score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {data.topRecommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <div className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-3.5" />
          </div>
        </div>
        <div className="mt-3">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function IssueCard({
  icon: Icon,
  tone,
  title,
  count,
  examples,
}: {
  icon: LucideIcon;
  tone: "amber" | "rose" | "purple";
  title: string;
  count: number;
  examples: string[];
}) {
  const toneMap = {
    amber: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
    purple: "bg-purple-500/12 text-purple-600 dark:text-purple-400",
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "grid size-8 place-items-center rounded-md",
              toneMap[tone]
            )}
          >
            <Icon className="size-4" />
          </div>
          <span className="text-sm font-medium">{title}</span>
          <Badge variant="secondary" className="ml-auto">
            {count}
          </Badge>
        </div>
        <div className="mt-3 space-y-1.5">
          {examples.length ? (
            examples.map((e, i) => (
              <p key={i} className="text-xs text-muted-foreground">
                • {e}
              </p>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No issues detected.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
