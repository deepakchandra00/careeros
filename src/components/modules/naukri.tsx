"use client";

import * as React from "react";
import {
  Briefcase,
  Upload,
  FileText,
  ClipboardPaste,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  Search,
  AlertTriangle,
  CheckCircle2,
  Target,
  Wallet,
  Plus,
  FileUp,
  Lightbulb,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import { extractTextFromFile } from "@/lib/resume/extract";
import { cn } from "@/lib/utils";

/* ---------------------------------- Types --------------------------------- */

interface ResumeHeadline {
  current: string;
  optimized: string;
  score: number;
  issues: string[];
}
interface ProfileSummary {
  current: string;
  optimized: string;
  score: number;
  issues: string[];
}
interface KeySkills {
  current: string[];
  suggested: string[];
  missing: string[];
  score: number;
}
interface EmploymentEntry {
  company: string;
  role: string;
  description: string;
}
interface EmploymentSection {
  score: number;
  issues: string[];
  optimizedEntries: EmploymentEntry[];
}
interface OptimizedProject {
  name: string;
  description: string;
}
interface ProjectsSection {
  score: number;
  issues: string[];
  optimizedProjects: OptimizedProject[];
}
interface CareerPreference {
  industry: string;
  role: string;
  location: string;
  employmentType: string;
}
interface CareerProfile {
  optimized: string;
  recommended: CareerPreference[];
}
interface SectionScores {
  headline: number;
  summary: number;
  skills: number;
  projects: number;
  employment: number;
}
interface RecruiterVisibility {
  currentScore: number;
  improvedScore: number;
  topPercentileComparison: string;
  sectionScores: SectionScores;
}
interface JdMatchResult {
  matchScore: number;
  missingKeywords: string[];
  recommendations: string[];
}
interface SalarySuggestion {
  current: string;
  marketRange: string;
  negotiationTip: string;
}
interface WeeklySuggestion {
  skill: string;
  reason: string;
  action: string;
}

interface NaukriResult {
  resumeHeadline: ResumeHeadline;
  profileSummary: ProfileSummary;
  keySkills: KeySkills;
  employment: EmploymentSection;
  projects: ProjectsSection;
  careerProfile: CareerProfile;
  recruiterVisibility: RecruiterVisibility;
  jdMatch: JdMatchResult | null;
  salarySuggestion: SalarySuggestion;
  weeklySuggestions: WeeklySuggestion[];
}

/* --------------------------------- Helpers -------------------------------- */

function scoreTone(score: number): "good" | "warn" | "bad" {
  return score >= 80 ? "good" : score >= 50 ? "warn" : "bad";
}

function scoreColor(score: number): string {
  return score >= 80
    ? "oklch(0.62 0.15 162)"
    : score >= 50
      ? "oklch(0.75 0.16 70)"
      : "oklch(0.58 0.22 25)";
}

function CopyButton({
  text,
  label = "Copied!",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-7 gap-1 px-2 text-xs", className)}
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          toast.success(label);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
    >
      {copied ? (
        <Check className="size-3.5 text-primary" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <Pill tone={scoreTone(score)}>
      <span className="font-bold">{Math.round(score)}</span>
      <span className="opacity-60">/100</span>
    </Pill>
  );
}

function IssuesList({ issues }: { issues: string[] }) {
  if (!issues?.length)
    return <p className="text-xs text-muted-foreground">No issues detected.</p>;
  return (
    <ul className="space-y-1.5">
      {issues.map((issue, i) => (
        <li key={i} className="flex items-start gap-2 text-xs">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
          <span className="text-muted-foreground">{issue}</span>
        </li>
      ))}
    </ul>
  );
}

function MiniSectionBar({ label, score }: { label: string; score: number }) {
  const safe = Math.min(100, Math.max(0, score ?? 0));
  const color = scoreColor(safe);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="font-bold" style={{ color }}>
          {Math.round(safe)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${safe}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  score,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  score?: number;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="size-4 text-primary" /> {title}
          </CardTitle>
          {typeof score === "number" && <ScoreBadge score={score} />}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SkillRow({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "default" | "good" | "bad";
  children: React.ReactNode;
}) {
  const toneClasses = {
    default: "text-muted-foreground",
    good: "text-primary",
    bad: "text-red-600 dark:text-red-400",
  };
  return (
    <div>
      <p
        className={cn(
          "mb-2 text-[10px] font-semibold uppercase tracking-wide",
          toneClasses[tone]
        )}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function PrefChip({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

/* --------------------------------- Module --------------------------------- */

export function NaukriModule() {
  const resumeData = useResumeStore((s) => s.data);
  const { data, loading, error, run } = useAI<NaukriResult>();

  const [tab, setTab] = React.useState<"upload" | "paste" | "store">("upload");
  const [profileText, setProfileText] = React.useState("");
  const [jd, setJd] = React.useState("");
  const [extracting, setExtracting] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resumeStoreText = React.useMemo(() => {
    const d = resumeData;
    return [
      d.name,
      d.title,
      "",
      "SUMMARY",
      d.summary,
      "",
      "EXPERIENCE",
      d.experience
        .map(
          (e) =>
            `${e.role} @ ${e.company} (${e.start}-${e.end})\n${e.bullets
              .map((b) => "- " + b)
              .join("\n")}`
        )
        .join("\n\n"),
      "",
      "SKILLS",
      d.skills.join(", "),
      "",
      "PROJECTS",
      d.projects
        .map((p) => `${p.name}: ${p.description} [${p.tech.join(", ")}]`)
        .join("\n"),
    ].join("\n");
  }, [resumeData]);

  const handleFile = React.useCallback(async (file: File) => {
    setExtracting(true);
    setFileName(file.name);
    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        toast.error("Could not extract text from this file.");
        setProfileText("");
        return;
      }
      setProfileText(text);
      toast.success(`Extracted ${text.length.toLocaleString()} characters`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to read file";
      toast.error(msg);
      setFileName(null);
    } finally {
      setExtracting(false);
    }
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  };

  const useStoreResume = () => {
    setProfileText(resumeStoreText);
    setFileName(null);
    toast.success("Loaded your current resume");
  };

  const analyze = () => {
    if (profileText.trim().length < 30) {
      toast.error("Please provide more profile text.");
      return;
    }
    run("/api/ai/naukri", {
      profileText,
      jd: jd.trim() || undefined,
    });
  };

  const uplift = data
    ? Math.max(
        0,
        data.recruiterVisibility.improvedScore -
          data.recruiterVisibility.currentScore
      )
    : 0;

  const sectionScores = data?.recruiterVisibility?.sectionScores;
  const hasJd = Boolean(data?.jdMatch);

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Briefcase}
        title="Naukri Optimizer"
        description="Boost your Naukri search visibility"
      >
        <Badge className="gap-1 border-0 bg-teal-500/15 text-teal-600 dark:text-teal-300">
          <Sparkles className="size-3" /> Unique
        </Badge>
      </ModuleHeader>

      {/* Phase 1: Import */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4 text-primary" /> Import your profile
          </CardTitle>
          <CardDescription className="text-xs">
            Upload, paste, or use your stored resume to begin optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as typeof tab)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="gap-1.5">
                <Upload className="size-3.5" /> Upload
              </TabsTrigger>
              <TabsTrigger value="paste" className="gap-1.5">
                <ClipboardPaste className="size-3.5" /> Paste
              </TabsTrigger>
              <TabsTrigger value="store" className="gap-1.5">
                <Briefcase className="size-3.5" /> My resume
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Upload */}
            <TabsContent value="upload" className="mt-3">
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-accent/40"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={onInputChange}
                />
                {extracting ? (
                  <>
                    <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                      <FileUp className="size-5 animate-pulse" />
                    </div>
                    <p className="text-sm font-medium">Extracting text…</p>
                    <p className="text-xs text-muted-foreground">{fileName}</p>
                  </>
                ) : fileName && profileText ? (
                  <>
                    <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-5" />
                    </div>
                    <p className="text-sm font-medium">{fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {profileText.length.toLocaleString()} chars extracted
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-7 gap-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Replace file
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
                      <Upload className="size-5" />
                    </div>
                    <p className="text-sm font-medium">
                      Drop your resume here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOCX, or TXT
                    </p>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Tab 2: Paste */}
            <TabsContent value="paste" className="mt-3">
              <Textarea
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                placeholder="Paste your resume or Naukri profile text here…"
                className="min-h-[200px] resize-y font-mono text-xs"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {profileText.length.toLocaleString()} chars
              </p>
            </TabsContent>

            {/* Tab 3: Use my resume */}
            <TabsContent value="store" className="mt-3">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
                <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <Briefcase className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{resumeData.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {resumeData.title} · {resumeData.experience.length} roles ·{" "}
                    {resumeData.skills.length} skills
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={useStoreResume}
                >
                  <Sparkles className="size-3.5" /> Use my current resume
                </Button>
                {profileText && profileText === resumeStoreText && (
                  <p className="flex items-center gap-1 text-xs text-primary">
                    <Check className="size-3" /> Resume loaded
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Optional JD */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Paste a Job Description (optional) — for JD match analysis
              </label>
              {jd && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setJd("")}
                >
                  Clear
                </button>
              )}
            </div>
            <Textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the job description you're targeting…"
              className="min-h-[100px] resize-y text-sm"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {profileText
                ? `${profileText.length.toLocaleString()} chars ready`
                : "Import a profile to begin"}
            </p>
            <AIButton onClick={analyze} loading={loading} disabled={loading}>
              {data ? "Re-analyze Profile" : "Analyze Profile"}
            </AIButton>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="flex items-center gap-2 py-4 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="size-4" /> {error}
          </CardContent>
        </Card>
      )}

      {loading && !data && (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
            <TypingDots /> Analyzing your Naukri profile visibility…
          </CardContent>
        </Card>
      )}

      {!data && !loading && !error && (
        <AIEmptyState
          icon={Briefcase}
          title="Analyze your Naukri profile"
          description="Import your profile above to get a visibility score, optimized headline, polished employment entries, JD match, salary insights, and concrete fixes."
        />
      )}

      {/* Phase 2: Results */}
      {data && (
        <div className="space-y-6">
          {/* A. Recruiter Visibility Dashboard */}
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-transparent to-teal-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="size-4 text-primary" /> Recruiter
                Visibility Dashboard
              </CardTitle>
              <CardDescription className="text-xs">
                Your current vs. achievable Naukri search ranking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.recruiterVisibility.topPercentileComparison && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
                  <TrendingUp className="size-3.5" />
                  {data.recruiterVisibility.topPercentileComparison}
                </div>
              )}

              <div className="grid items-center gap-4 sm:grid-cols-[auto_auto_auto] sm:justify-center">
                <div className="flex flex-col items-center">
                  <ScoreRing
                    value={data.recruiterVisibility.currentScore}
                    size={130}
                    label="Now"
                  />
                  <span className="mt-2 text-xs font-medium text-muted-foreground">
                    Current
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 px-2">
                  <ArrowRight className="size-7 text-muted-foreground" />
                  <Badge className="border-0 bg-primary px-3 py-1 text-base font-bold text-primary-foreground">
                    +{uplift}%
                  </Badge>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    uplift
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <ScoreRing
                    value={data.recruiterVisibility.improvedScore}
                    size={130}
                    label="Target"
                  />
                  <span className="mt-2 text-xs font-medium text-muted-foreground">
                    After fixes
                  </span>
                </div>
              </div>

              {sectionScores && (
                <div className="grid gap-4 rounded-xl border bg-card/60 p-4 sm:grid-cols-2 lg:grid-cols-5">
                  <MiniSectionBar
                    label="Headline"
                    score={sectionScores.headline}
                  />
                  <MiniSectionBar
                    label="Summary"
                    score={sectionScores.summary}
                  />
                  <MiniSectionBar label="Skills" score={sectionScores.skills} />
                  <MiniSectionBar
                    label="Projects"
                    score={sectionScores.projects}
                  />
                  <MiniSectionBar
                    label="Employment"
                    score={sectionScores.employment}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* B. Resume Headline */}
          <SectionCard
            title="Resume Headline"
            icon={FileText}
            score={data.resumeHeadline.score}
          >
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Current
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.resumeHeadline.current || "Not provided"}
                </p>
                {data.resumeHeadline.issues?.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <IssuesList issues={data.resumeHeadline.issues} />
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Optimized
                  </p>
                  <CopyButton
                    text={data.resumeHeadline.optimized}
                    label="Headline copied!"
                  />
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {data.resumeHeadline.optimized}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* C. Profile Summary */}
          <SectionCard
            title="Profile Summary"
            icon={FileText}
            score={data.profileSummary.score}
          >
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Current
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.profileSummary.current || "Not provided"}
                </p>
                {data.profileSummary.issues?.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <IssuesList issues={data.profileSummary.issues} />
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Optimized
                  </p>
                  <CopyButton
                    text={data.profileSummary.optimized}
                    label="Summary copied!"
                  />
                </div>
                <p className="text-sm leading-relaxed">
                  {data.profileSummary.optimized}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* D. Key Skills */}
          <SectionCard
            title="Key Skills"
            icon={Search}
            score={data.keySkills.score}
          >
            <div className="space-y-4">
              <SkillRow label="Current skills" tone="default">
                {data.keySkills.current?.length ? (
                  data.keySkills.current.map((s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="bg-muted text-muted-foreground"
                    >
                      {s}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    None detected
                  </span>
                )}
              </SkillRow>
              <SkillRow label="Suggested" tone="good">
                {data.keySkills.suggested?.length ? (
                  data.keySkills.suggested.map((s) => (
                    <Badge
                      key={s}
                      className="border-0 bg-primary/15 text-primary hover:bg-primary/20"
                    >
                      {s}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
              </SkillRow>
              <SkillRow label="Missing" tone="bad">
                {data.keySkills.missing?.length ? (
                  data.keySkills.missing.map((s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="border-0 bg-red-500/12 text-red-600 dark:text-red-400"
                    >
                      {s}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No missing skills — great coverage!
                  </span>
                )}
              </SkillRow>
            </div>
          </SectionCard>

          {/* E. Employment */}
          <SectionCard
            title="Employment"
            icon={Briefcase}
            score={data.employment.score}
          >
            {data.employment.issues?.length > 0 && (
              <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <IssuesList issues={data.employment.issues} />
              </div>
            )}
            <div className="space-y-3">
              {(data.employment.optimizedEntries ?? []).map((emp, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/60 p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold">{emp.role}</h4>
                      <p className="text-xs text-muted-foreground">
                        {emp.company}
                      </p>
                    </div>
                    <CopyButton
                      text={`${emp.role} @ ${emp.company}\n${emp.description}`}
                      label={`${emp.company} entry copied!`}
                    />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {emp.description}
                  </p>
                </div>
              ))}
              {(!data.employment.optimizedEntries ||
                data.employment.optimizedEntries.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No optimized employment entries generated.
                </p>
              )}
            </div>
          </SectionCard>

          {/* F. Projects */}
          <SectionCard
            title="Projects"
            icon={Lightbulb}
            score={data.projects.score}
          >
            {data.projects.issues?.length > 0 && (
              <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <IssuesList issues={data.projects.issues} />
              </div>
            )}
            <div className="grid gap-3 lg:grid-cols-2">
              {(data.projects.optimizedProjects ?? []).map((p, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/60 p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold">{p.name}</h4>
                    <CopyButton
                      text={`${p.name}\n${p.description}`}
                      label={`${p.name} copied!`}
                    />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                </div>
              ))}
              {(!data.projects.optimizedProjects ||
                data.projects.optimizedProjects.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No optimized project descriptions generated.
                </p>
              )}
            </div>
          </SectionCard>

          {/* G. Career Profile */}
          <SectionCard title="Career Profile" icon={Target}>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Optimized Career Profile
                </p>
                <CopyButton
                  text={data.careerProfile.optimized}
                  label="Career profile copied!"
                />
              </div>
              <p className="text-sm leading-relaxed">
                {data.careerProfile.optimized}
              </p>
            </div>

            {data.careerProfile.recommended?.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Recommended Career Preferences
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.careerProfile.recommended.map((r, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border bg-muted/30 px-3 py-1.5"
                    >
                      <PrefChip label="Industry" value={r.industry} />
                      <PrefChip label="Role" value={r.role} />
                      <PrefChip label="Location" value={r.location} />
                      <PrefChip label="Type" value={r.employmentType} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          {/* H. JD Match (only if JD was provided) */}
          {hasJd && data.jdMatch && (
            <Card className="border-teal-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="size-4 text-teal-500" /> JD Match
                </CardTitle>
                <CardDescription className="text-xs">
                  How well your profile aligns with the target role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
                  <div className="flex justify-center">
                    <ScoreRing
                      value={data.jdMatch.matchScore}
                      size={140}
                      label="Match"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Missing Keywords
                      </p>
                      {data.jdMatch.missingKeywords?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {data.jdMatch.missingKeywords.map((k) => (
                            <Badge
                              key={k}
                              variant="secondary"
                              className="border-0 bg-red-500/12 text-red-600 dark:text-red-400"
                            >
                              {k}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No missing keywords — strong alignment!
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Recommendations
                      </p>
                      <ul className="space-y-1.5">
                        {data.jdMatch.recommendations?.map((r, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* I. Salary Suggestion */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="size-4 text-primary" /> Salary Suggestion
              </CardTitle>
              <CardDescription className="text-xs">
                Market-aligned compensation expectations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Current CTC
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">
                    {data.salarySuggestion.current || "Not provided"}
                  </p>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Market Range
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-primary">
                    {data.salarySuggestion.marketRange}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <p className="text-sm">{data.salarySuggestion.negotiationTip}</p>
              </div>
            </CardContent>
          </Card>

          {/* J. Weekly AI Suggestions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" /> Weekly AI
                Suggestions
              </CardTitle>
              <CardDescription className="text-xs">
                Trending skills to add this week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data.weeklySuggestions ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No trending suggestions available this week.
                </p>
              ) : (
                (data.weeklySuggestions ?? []).map((s, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-2 rounded-xl border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Plus className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{s.skill}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.reason}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0 gap-1.5 text-xs"
                      onClick={() =>
                        toast.success(`"${s.skill}" added`, {
                          description: s.action,
                        })
                      }
                    >
                      <Plus className="size-3.5" /> Add?
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
