"use client";

import * as React from "react";
import {
  Linkedin,
  Upload,
  ClipboardPaste,
  FileText,
  Copy,
  Check,
  AlertCircle,
  Plus,
  Star,
  Award,
  Search,
  TrendingUp,
  UserPlus,
  Mail,
  Handshake,
  Heart,
  RotateCcw,
  Sparkles,
  Briefcase,
  BadgeCheck,
  Image as ImageIcon,
  Loader2,
  X,
  type LucideIcon,
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

/* ---------------- Types (mirror /api/ai/linkedin response) ---------------- */

interface LinkedinHeadline {
  current: string;
  optimized: string;
  score: number;
  issues?: string[];
  keywords?: string[];
}
interface LinkedinAbout {
  current: string;
  optimized: string;
  score: number;
  issues?: string[];
}
interface OptimizedExperience {
  company: string;
  role: string;
  bullets: string[];
}
interface LinkedinExperience {
  score: number;
  issues?: string[];
  optimizedBullets: OptimizedExperience[];
}
interface LinkedinSkills {
  current?: string[];
  suggested?: string[];
  missing?: string[];
  score: number;
}
interface LinkedinSEO {
  score: number;
  searchVisibility: number;
  recruiterKeywords?: string[];
  tips?: string[];
}
interface LinkedinNetworkingMessages {
  connectionRequest: string;
  recruiterOutreach: string;
  referralRequest: string;
  thankYou: string;
}
interface LinkedinProfileHealth {
  strength: number;
  activity: "Low" | "Medium" | "High";
  recommendationsNeeded: number;
  skillsMissing: number;
}
interface LinkedinResult {
  headline: LinkedinHeadline;
  about: LinkedinAbout;
  experience: LinkedinExperience;
  skills: LinkedinSkills;
  seo: LinkedinSEO;
  featured?: string[];
  bannerIdea: string;
  networkingMessages: LinkedinNetworkingMessages;
  profileHealth: LinkedinProfileHealth;
}

/* ---------------- Helpers ---------------- */

type Tone = "good" | "warn" | "bad" | "info";

function scoreTone(score: number): Tone {
  return score >= 80 ? "good" : score >= 50 ? "warn" : "bad";
}

function activityTone(activity: LinkedinProfileHealth["activity"]): Tone {
  return activity === "High" ? "good" : activity === "Medium" ? "warn" : "bad";
}

const FEATURED_ICONS: LucideIcon[] = [Star, FileText, Award];

function CopyButton({
  text,
  label = "Copy",
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
        if (!text) return;
        navigator.clipboard
          .writeText(text)
          .then(() => {
            setCopied(true);
            toast.success(`${label} copied!`);
            setTimeout(() => setCopied(false), 1500);
          })
          .catch(() => toast.error("Couldn't copy — try again"));
      }}
    >
      {copied ? (
        <Check className="size-3.5 text-primary" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? "Copied" : label}
    </Button>
  );
}

function SectionCard({
  title,
  icon: Icon,
  score,
  description,
  action,
  children,
}: {
  title: string;
  icon: LucideIcon;
  score?: number;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && (
                <CardDescription className="text-xs">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {action}
            {typeof score === "number" && (
              <Pill tone={scoreTone(score)}>{score}/100</Pill>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function IssuesList({ issues }: { issues?: string[] }) {
  if (!issues || issues.length === 0)
    return (
      <p className="text-xs text-muted-foreground">No issues detected.</p>
    );
  return (
    <ul className="space-y-1.5">
      {issues.map((issue, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-red-500" />
          <span className="leading-relaxed text-muted-foreground">{issue}</span>
        </li>
      ))}
    </ul>
  );
}

function CurrentBlock({
  label,
  children,
  issues,
}: {
  label: string;
  children: React.ReactNode;
  issues?: string[];
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
      <div className="border-t border-border/60 pt-2">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-red-500">
          Issues
        </p>
        <IssuesList issues={issues} />
      </div>
    </div>
  );
}

function OptimizedBlock({
  label,
  copyText,
  copyLabel,
  children,
}: {
  label: string;
  copyText: string;
  copyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
          {label}
        </span>
        <CopyButton text={copyText} label={copyLabel} />
      </div>
      {children}
    </div>
  );
}

function NetworkingCard({
  icon: Icon,
  label,
  text,
}: {
  icon: LucideIcon;
  label: string;
  text: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <CopyButton text={text} label="Copy" />
      </div>
      <blockquote className="border-l-2 border-primary/30 pl-3 text-sm italic leading-relaxed text-muted-foreground">
        {text || "—"}
      </blockquote>
    </div>
  );
}

/* ---------------- Module ---------------- */

export function LinkedinModule() {
  const d = useResumeStore((s) => s.data);
  const { data, loading, error, run } = useAI<LinkedinResult>();

  const [tab, setTab] = React.useState("upload");
  const [profileText, setProfileText] = React.useState("");
  const [sourceLabel, setSourceLabel] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [extracting, setExtracting] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const serializedResume = React.useMemo(() => {
    return [
      `${d.name}`,
      `${d.title}`,
      `${d.location} · ${d.email} · ${d.linkedin}`,
      ``,
      `SUMMARY`,
      d.summary,
      ``,
      `EXPERIENCE`,
      d.experience
        .map(
          (e) =>
            `${e.role} @ ${e.company} (${e.start}–${e.end})\n${e.bullets
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
      d.education
        .map((ed) => `${ed.degree}, ${ed.school} (${ed.start}–${ed.end})`)
        .join("\n"),
      ``,
      `CERTIFICATIONS`,
      d.certifications
        .map((c) => `${c.title} — ${c.subtitle} (${c.date})`)
        .join("\n"),
    ].join("\n");
  }, [d]);

  const handleFile = React.useCallback(async (file: File) => {
    setFileName(file.name);
    setExtracting(true);
    try {
      toast.info(`Extracting text from ${file.name}…`);
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length < 30) {
        throw new Error(
          "Couldn't read enough text from this file. Try pasting the profile text manually."
        );
      }
      setProfileText(text);
      setSourceLabel(file.name);
      toast.success(`Extracted ${text.length.toLocaleString()} characters`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Extraction failed", {
        description: "Tip: switch to 'Paste profile text' to enter manually.",
        duration: 8000,
      });
      setFileName(null);
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  const useCurrentResume = React.useCallback(() => {
    setProfileText(serializedResume);
    setSourceLabel(`${d.name}'s resume`);
    setFileName(null);
    toast.success(`Loaded ${d.name}'s resume`, {
      description: `${serializedResume.length.toLocaleString()} characters ready`,
    });
  }, [serializedResume, d.name]);

  const analyze = React.useCallback(() => {
    if (profileText.trim().length < 30) {
      toast.error("Add more profile text before analyzing.");
      return;
    }
    run("/api/ai/linkedin", { profileText });
  }, [run, profileText]);

  const ready = profileText.trim().length >= 30;
  const usingResume = sourceLabel?.endsWith("resume");

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Linkedin}
        title="LinkedIn Optimizer"
        description="AI-powered profile analysis & optimization"
      />

      {/* ---------- Phase 1: Import ---------- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Import your profile</CardTitle>
          <CardDescription className="text-xs">
            Upload your LinkedIn PDF, paste profile text, or reuse your current resume
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full max-w-xl grid-cols-3">
              <TabsTrigger value="upload" className="gap-1.5">
                <Upload className="size-3.5" /> Upload PDF
              </TabsTrigger>
              <TabsTrigger value="paste" className="gap-1.5">
                <ClipboardPaste className="size-3.5" /> Paste text
              </TabsTrigger>
              <TabsTrigger value="resume" className="gap-1.5">
                <FileText className="size-3.5" /> Use resume
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Upload */}
            <TabsContent value="upload" className="mt-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 text-center transition-colors",
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-accent/40"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                  {extracting ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Upload className="size-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {extracting
                      ? "Extracting text…"
                      : "Drop your LinkedIn PDF here, or "}
                    {!extracting && (
                      <span className="text-primary underline-offset-2 hover:underline">
                        browse
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF, DOCX or TXT · up to 5MB
                  </p>
                </div>
                {fileName && !extracting && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileName(null);
                      setProfileText("");
                      setSourceLabel(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    <FileText className="size-3" /> {fileName}
                    <X className="size-3" />
                  </button>
                )}
              </div>
            </TabsContent>

            {/* Tab 2: Paste */}
            <TabsContent value="paste" className="mt-4 space-y-2">
              <Textarea
                value={profileText}
                onChange={(e) => {
                  setProfileText(e.target.value);
                  setSourceLabel(null);
                  setFileName(null);
                }}
                placeholder="Paste your LinkedIn profile text here — headline, about, experience, skills, etc."
                className="min-h-[220px] text-sm"
              />
              <p className="text-right text-xs text-muted-foreground">
                {profileText.length.toLocaleString()} characters
              </p>
            </TabsContent>

            {/* Tab 3: Use resume */}
            <TabsContent value="resume" className="mt-4">
              <div className="flex flex-col items-start gap-4 rounded-xl border border-border/60 bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Use my current resume</p>
                    <p className="text-xs text-muted-foreground">
                      We&apos;ll serialize your resume from the builder into profile text.
                    </p>
                    {usingResume && (
                      <Badge className="mt-2 gap-1 bg-primary/10 text-primary">
                        <Check className="size-3" /> Using: {sourceLabel}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  onClick={useCurrentResume}
                  variant="outline"
                  className="gap-1.5"
                >
                  <Sparkles className="size-3.5 text-primary" /> Use my current resume
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer: status + Analyze */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card/50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {ready ? (
                <>
                  <Check className="size-3.5 text-primary" />
                  <span>
                    {sourceLabel ? `Source: ${sourceLabel} · ` : ""}
                    {profileText.length.toLocaleString()} chars ready
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-3.5" />
                  <span>Add your profile to begin analysis</span>
                </>
              )}
            </div>
            <AIButton
              onClick={analyze}
              loading={loading}
              disabled={!ready || loading}
            >
              {data ? "Re-analyze" : "Analyze Profile"}
            </AIButton>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Loading (first run) */}
      {loading && !data && (
        <Card className="border-primary/30">
          <CardContent className="flex items-center justify-center gap-3 py-14">
            <TypingDots />
            <p className="text-sm text-muted-foreground">
              Analyzing your profile &amp; crafting LinkedIn copy…
            </p>
          </CardContent>
        </Card>
      )}

      {/* Re-analyzing banner */}
      {loading && data && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-center gap-3 py-3">
            <TypingDots />
            <p className="text-sm text-primary">Re-analyzing your profile…</p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!data && !loading && !error && (
        <AIEmptyState
          icon={Linkedin}
          title="Optimize your LinkedIn profile"
          description="Import your profile above to get an AI-crafted headline, About section, experience bullets, skills analysis, SEO score, featured ideas, banner concept, and 4 ready-to-send networking messages."
        />
      )}

      {/* ---------- Phase 2: Results ---------- */}
      {data && (
        <div className="space-y-6">
          {/* A. Profile Health (gradient hero) */}
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/15 via-emerald-500/10 to-teal-500/15 py-0 gap-0">
            <CardContent className="p-6">
              <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr_auto]">
                <div className="flex justify-center">
                  <ScoreRing
                    value={data.profileHealth.strength}
                    size={140}
                    label="Strength"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Profile Health
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {data.profileHealth.strength >= 80
                        ? "Strong profile"
                        : data.profileHealth.strength >= 50
                          ? "Needs polish"
                          : "Needs work"}
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border/60 bg-card/60 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Activity
                      </p>
                      <div className="mt-1">
                        <Pill tone={activityTone(data.profileHealth.activity)}>
                          {data.profileHealth.activity}
                        </Pill>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-card/60 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Recommendations
                      </p>
                      <p className="mt-1 text-lg font-bold">
                        {data.profileHealth.recommendationsNeeded}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-card/60 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Skills Missing
                      </p>
                      <p className="mt-1 text-lg font-bold">
                        {data.profileHealth.skillsMissing}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center lg:justify-end">
                  <Button
                    onClick={analyze}
                    disabled={loading}
                    className="gap-1.5"
                  >
                    <RotateCcw className="size-3.5" /> Re-analyze
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* B. Headline */}
          <SectionCard
            title="Headline"
            icon={Sparkles}
            score={data.headline.score}
            description="Your 220-character first impression"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <CurrentBlock label="Current" issues={data.headline.issues}>
                {data.headline.current || "Not provided"}
              </CurrentBlock>
              <OptimizedBlock
                label="Optimized"
                copyText={data.headline.optimized}
                copyLabel="Headline"
              >
                <p className="text-sm font-medium leading-relaxed">
                  {data.headline.optimized}
                </p>
                {(data.headline.keywords ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 border-t border-primary/15 pt-2">
                    {(data.headline.keywords ?? []).map((k) => (
                      <span
                        key={k}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </OptimizedBlock>
            </div>
          </SectionCard>

          {/* C. About */}
          <SectionCard
            title="About Section"
            icon={FileText}
            score={data.about.score}
            description="Your first-person story"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <CurrentBlock label="Current summary" issues={data.about.issues}>
                <p className="whitespace-pre-wrap">
                  {data.about.current || "Not provided"}
                </p>
              </CurrentBlock>
              <OptimizedBlock
                label="Optimized"
                copyText={data.about.optimized}
                copyLabel="About"
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {data.about.optimized}
                </p>
              </OptimizedBlock>
            </div>
          </SectionCard>

          {/* D. Experience */}
          <SectionCard
            title="Experience Bullets"
            icon={Briefcase}
            score={data.experience.score}
            description="Impact-led rewrites per role"
            action={
              <CopyButton
                text={(data.experience.optimizedBullets ?? [])
                  .flatMap((e) => e.bullets)
                  .join("\n")}
                label="Copy all"
              />
            }
          >
            <div className="space-y-3">
              {(data.experience.issues ?? []).length > 0 && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-red-500">
                    Issues
                  </p>
                  <IssuesList issues={data.experience.issues} />
                </div>
              )}
              {(data.experience.optimizedBullets ?? []).map((exp, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/60 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{exp.role}</p>
                      <p className="text-xs text-muted-foreground">{exp.company}</p>
                    </div>
                    <CopyButton
                      text={exp.bullets.map((b) => "• " + b).join("\n")}
                      label="Copy bullets"
                    />
                  </div>
                  <ul className="space-y-1.5">
                    {(exp.bullets ?? []).map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* E. Skills */}
          <SectionCard
            title="Skills"
            icon={BadgeCheck}
            score={data.skills.score}
            description="Current vs suggested vs missing"
            action={
              <CopyButton
                text={(data.skills.suggested ?? []).join(", ")}
                label="Copy suggested"
              />
            }
          >
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Current skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {(data.skills.current ?? []).length > 0 ? (
                    (data.skills.current ?? []).map((s) => (
                      <Badge key={s} variant="secondary" className="bg-muted">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">None detected.</p>
                  )}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Suggested skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {(data.skills.suggested ?? []).length > 0 ? (
                    (data.skills.suggested ?? []).map((s) => (
                      <Badge key={s} className="gap-1 bg-primary/12 text-primary">
                        <Plus className="size-3" /> {s}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No suggestions.</p>
                  )}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-red-500">
                  Missing skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {(data.skills.missing ?? []).length > 0 ? (
                    (data.skills.missing ?? []).map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="gap-1 bg-red-500/10 text-red-600 dark:text-red-400"
                      >
                        <X className="size-3" /> {s}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      None — you&apos;re covered!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* F. SEO */}
          <SectionCard
            title="LinkedIn SEO"
            icon={Search}
            description="How discoverable you are to recruiters"
          >
            <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
              <div className="flex justify-center">
                <ScoreRing
                  value={data.seo.searchVisibility}
                  size={130}
                  label="Visibility"
                />
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Overall SEO score:
                  </span>
                  <Pill tone={scoreTone(data.seo.score)}>
                    {data.seo.score}/100
                  </Pill>
                  <TrendingUp className="size-3.5 text-primary" />
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Recruiter keywords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(data.seo.recruiterKeywords ?? []).length > 0 ? (
                      (data.seo.recruiterKeywords ?? []).map((k) => (
                        <Pill key={k} tone="info">
                          {k}
                        </Pill>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No keywords returned.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    SEO tips
                  </p>
                  <ol className="space-y-1.5">
                    {(data.seo.tips ?? []).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/12 text-[10px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* G. Featured */}
          <SectionCard
            title="Featured Section"
            icon={Star}
            description="Pin these to your Featured section"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {(data.featured ?? []).map((f, i) => {
                const Icon = FEATURED_ICONS[i % FEATURED_ICONS.length];
                return (
                  <div
                    key={i}
                    className="flex flex-col gap-2 rounded-xl border border-border/60 p-4"
                  >
                    <div className="grid size-9 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      <Icon className="size-4" />
                    </div>
                    <p className="text-sm leading-relaxed">{f}</p>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* H. Banner Idea */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <ImageIcon className="size-4" />
                  </span>
                  Banner Idea
                </CardTitle>
                <CopyButton text={data.bannerIdea} label="Banner idea" />
              </div>
              <CardDescription className="text-xs">
                Creative concept for your cover photo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 text-sm italic leading-relaxed">
                &ldquo;{data.bannerIdea}&rdquo;
              </div>
            </CardContent>
          </Card>

          {/* I. Networking Messages */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="size-4" />
                </span>
                Networking Messages
              </CardTitle>
              <CardDescription className="text-xs">
                Ready-to-send outreach templates — copy & personalize
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <NetworkingCard
                  icon={UserPlus}
                  label="Connection Request"
                  text={data.networkingMessages.connectionRequest}
                />
                <NetworkingCard
                  icon={Mail}
                  label="Recruiter Outreach"
                  text={data.networkingMessages.recruiterOutreach}
                />
                <NetworkingCard
                  icon={Handshake}
                  label="Referral Request"
                  text={data.networkingMessages.referralRequest}
                />
                <NetworkingCard
                  icon={Heart}
                  label="Thank-You Note"
                  text={data.networkingMessages.thankYou}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
