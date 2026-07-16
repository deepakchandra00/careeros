"use client";

import * as React from "react";
import {
  Mic,
  FileText,
  Copy,
  Check,
  Play,
  Lightbulb,
  Tag,
  Video,
  RefreshCw,
  Sparkles,
  UserRound,
  Code2,
  MessagesSquare,
  Network,
  Braces,
  Building2,
  CircleDot,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AIButton,
  AIEmptyState,
  ModuleHeader,
  Pill,
  TypingDots,
} from "@/components/shared/blocks";
import { useAI } from "@/components/shared/utils";
import { useResumeStore } from "@/store/resume-store";

interface InterviewResult {
  hr: string[];
  technical: string[];
  behavioral: string[];
  systemDesign: string[];
  coding: string[];
  architecture: string[];
  tips: string[];
  likelyTopics: string[];
}

const TABS: {
  id: keyof Pick<
    InterviewResult,
    "hr" | "technical" | "behavioral" | "systemDesign" | "coding" | "architecture"
  >;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}[] = [
  { id: "hr", label: "HR", icon: UserRound, accent: "oklch(0.6 0.18 280)" },
  { id: "technical", label: "Technical", icon: Code2, accent: "oklch(0.62 0.15 162)" },
  { id: "behavioral", label: "Behavioral", icon: MessagesSquare, accent: "oklch(0.75 0.16 50)" },
  { id: "systemDesign", label: "System Design", icon: Network, accent: "oklch(0.65 0.2 340)" },
  { id: "coding", label: "Coding", icon: Braces, accent: "oklch(0.7 0.15 70)" },
  { id: "architecture", label: "Architecture", icon: Building2, accent: "oklch(0.58 0.18 200)" },
];

function QuestionCard({
  index,
  text,
  accent,
}: {
  index: number;
  text: string;
  accent: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Question copied to clipboard");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy — try again");
    }
  };
  return (
    <div className="group flex items-start gap-3 rounded-xl border border-border/70 bg-card/60 p-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
      <div
        className="grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold text-white"
        style={{ backgroundColor: accent }}
      >
        {index + 1}
      </div>
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground/90">
        {text}
      </p>
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          onClick={copy}
          aria-label="Copy question"
        >
          {copied ? (
            <Check className="size-3.5 text-primary" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-primary"
          onClick={() => toast.info("Practice mode opening…")}
        >
          <Play className="size-3" />
          Practice
        </Button>
      </div>
    </div>
  );
}

function Waveform() {
  // A faux equalizer used in the mock interview card.
  const bars = React.useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        // pseudo-random but stable
        const seed = Math.sin(i * 1.7) * 0.5 + 0.5;
        return 18 + Math.round(seed * 70);
      }),
    [],
  );
  return (
    <>
      <style>{`
        @keyframes interview-wave {
          0%, 100% { transform: scaleY(0.28); }
          50% { transform: scaleY(1); }
        }
      `}</style>
      <div className="flex h-16 items-center justify-center gap-[3px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-primary/70"
            style={{
              height: `${h}%`,
              transformOrigin: "center",
              animation: "interview-wave 1.1s ease-in-out infinite",
              animationDelay: `${(i % 12) * 0.07}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

export function InterviewModule() {
  const d = useResumeStore((s) => s.data);
  const resumeText = React.useMemo(
    () =>
      `${d.name}\n${d.title}\n\nSUMMARY\n${d.summary}\n\nEXPERIENCE\n${d.experience
        .map(
          (e) =>
            `${e.role} @ ${e.company} (${e.start}-${e.end})\n${e.bullets
              .map((b) => "- " + b)
              .join("\n")}`,
        )
        .join("\n\n")}\n\nSKILLS\n${d.skills.join(", ")}\n\nPROJECTS\n${d.projects
        .map((p) => `${p.name}: ${p.description} [${p.tech.join(", ")}]`)
        .join("\n")}`,
    [d],
  );

  const [jd, setJd] = React.useState("");
  const { data, loading, error, run } = useAI<InterviewResult>();

  const generate = () => {
    run("/api/ai/interview", { resumeText, jd: jd.trim() || undefined });
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Mic}
        title="Interview Coach"
        description="AI-generated questions & mock interview feedback"
      >
        {data && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={generate}
            disabled={loading}
          >
            <RefreshCw className="size-3.5" /> Regenerate
          </Button>
        )}
      </ModuleHeader>

      {/* Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tailor your prep</CardTitle>
          <CardDescription className="text-xs">
            Resume is used automatically. Add a JD for role-specific questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="gap-1.5 bg-primary/10 text-primary"
            >
              <FileText className="size-3" />
              Using resume · {d.name}
            </Badge>
            <Pill tone="info">{d.title}</Pill>
            <Pill tone="default">{d.experience.length} roles</Pill>
            <Pill tone="good">{d.skills.length} skills</Pill>
          </div>
          <Textarea
            placeholder="Paste target JD for tailored questions…"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            className="min-h-28 text-sm"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {jd.trim()
                ? "JD attached — questions will be tuned to this role."
                : "No JD added — questions use your resume only."}
            </p>
            <AIButton onClick={generate} loading={loading} disabled={loading}>
              {data ? "Regenerate Questions" : "Generate Questions"}
            </AIButton>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-500/40 bg-red-500/5">
          <CardContent className="py-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton */}
      {loading && !data && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
            <TypingDots />
            <p className="text-sm text-muted-foreground">
              Crafting questions across 6 interview tracks…
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !data && !error && (
        <AIEmptyState
          icon={Mic}
          title="No questions yet"
          description="Hit Generate and we'll produce HR, technical, behavioral, system design, coding, and architecture questions tuned to your resume."
        />
      )}

      {/* Results */}
      {data && (
        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* Tabs */}
          <Card className="lg:order-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Question Bank</CardTitle>
                  <CardDescription className="text-xs">
                    {TABS.reduce(
                      (n, t) => n + (data[t.id]?.length ?? 0),
                      0,
                    )}{" "}
                    curated questions across 6 rounds
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="size-3 text-primary" /> AI-tailored
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="hr" className="w-full">
                <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-muted/60 p-1">
                  {TABS.map((t) => {
                    const Icon = t.icon;
                    return (
                      <TabsTrigger
                        key={t.id}
                        value={t.id}
                        className="gap-1.5 rounded-md px-3 py-1.5 text-xs"
                      >
                        <Icon className="size-3.5" />
                        {t.label}
                        <span className="ml-1 rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {data[t.id]?.length ?? 0}
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                {TABS.map((t) => (
                  <TabsContent key={t.id} value={t.id} className="mt-4">
                    <div className="space-y-3">
                      {data[t.id]?.length ? (
                        data[t.id].map((q, i) => (
                          <QuestionCard
                            key={i}
                            index={i}
                            text={q}
                            accent={t.accent}
                          />
                        ))
                      ) : (
                        <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                          No questions in this track.
                        </p>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Sidebar: Likely topics + Tips */}
          <div className="space-y-6 lg:order-2">
            <Card className="border-purple-500/20 bg-purple-500/[0.04]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
                    <Tag className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Likely Topics</CardTitle>
                    <CardDescription className="text-xs">
                      Almost certain to come up
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {data.likelyTopics?.length ? (
                  data.likelyTopics.map((t, i) => (
                    <Pill key={i} tone="info">
                      <CircleDot className="mr-1 size-2.5" />
                      {t}
                    </Pill>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No topics.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-amber-500/20 bg-amber-500/[0.04]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Lightbulb className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Prep Tips</CardTitle>
                    <CardDescription className="text-xs">
                      Specific to your profile
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {data.tips?.length ? (
                    data.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 rounded-lg border border-amber-500/15 bg-amber-500/[0.06] p-3 text-sm"
                      >
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                          {i + 1}
                        </span>
                        <span className="text-foreground/90">{tip}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tips.</p>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Mock Interview */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-600 via-primary to-teal-500 text-primary-foreground">
        <div className="absolute inset-0 opacity-25">
          <div className="animate-blob absolute -right-10 -top-10 size-56 rounded-full bg-white/30 blur-3xl" />
          <div className="animate-blob absolute -bottom-16 left-1/4 size-64 rounded-full bg-teal-200/30 blur-3xl [animation-delay:3s]" />
        </div>
        <CardContent className="relative grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <Badge className="mb-3 border-0 bg-white/15 text-primary-foreground backdrop-blur">
              <Video className="mr-1 size-3" /> Mock Studio · Beta
            </Badge>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Practice a live mock interview
            </h2>
            <p className="mt-2 max-w-md text-sm text-primary-foreground/85">
              Voice + camera simulation with real-time feedback on tone, pacing,
              and clarity. We&apos;ll throw one question per round and score your
              answer.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                className="border-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={() => toast.info("Mock interview studio is coming soon 🎙️")}
              >
                <Mic className="mr-1 size-3.5" /> Start Mock Interview
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/30 bg-white/10 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
                onClick={() => toast.info("Settings coming soon")}
              >
                <Video className="mr-1 size-3.5" /> Enable Camera
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-primary-foreground/80">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 animate-pulse rounded-full bg-white" />
                Live mic
              </span>
              <span>·</span>
              <span>~8 min / round</span>
              <span>·</span>
              <span>Auto-transcribed</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-primary-foreground/85">
                <Mic className="size-3.5" />
                Listening…
              </div>
              <span className="text-[10px] uppercase tracking-wider text-primary-foreground/70">
                Waveform
              </span>
            </div>
            <Waveform />
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-primary-foreground/80">
              <span className="rounded-full bg-white/15 px-2 py-0.5">⏱ 00:42</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5">
                Clarity 92%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
