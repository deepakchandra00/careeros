"use client";

import * as React from "react";
import {
  Video,
  Camera,
  SkipForward,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  ListChecks,
  Trophy,
  Target,
  Square,
  CircleDot,
  GraduationCap,
  Layers,
  Gauge,
  ClipboardList,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AIButton,
  ModuleHeader,
  Pill,
  ScoreRing,
  TypingDots,
} from "@/components/shared/blocks";
import { cn } from "@/lib/utils";

type Phase = "setup" | "interview" | "results";

type Question = {
  id: string;
  question: string;
  type: string;
  difficulty: string;
  topic: string;
  modelAnswer: string;
  evaluationCriteria: string[];
};

type ScoreResult = {
  score: number;
  grade: string;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  feedback: string;
};

type AnswerRecord = {
  question: Question;
  answer: string;
  score: ScoreResult | null; // null = skipped
};

const INTERVIEW_TYPES = [
  { id: "HR", label: "HR", hint: "Culture fit, motivation, soft skills" },
  { id: "Technical", label: "Technical", hint: "Domain depth & problem solving" },
  { id: "Behavioral", label: "Behavioral", hint: "STAR stories & past behavior" },
  { id: "System Design", label: "System Design", hint: "Architecture & trade-offs" },
  { id: "Leadership", label: "Leadership", hint: "Vision, team & impact" },
];

const TOTAL_QUESTIONS = 5;

const GRADE_TONE: Record<string, "good" | "info" | "warn" | "bad"> = {
  Excellent: "good",
  Good: "good",
  Average: "info",
  Weak: "warn",
  Poor: "bad",
};

const DIFFICULTY_TONE: Record<string, "good" | "info" | "warn" | "bad"> = {
  Easy: "good",
  Medium: "info",
  Hard: "warn",
};

type Tone = "default" | "good" | "info" | "warn" | "bad";

function gradeTone(g: string): Tone {
  return (GRADE_TONE[g] as Tone) ?? "default";
}

function difficultyTone(d: string): Tone {
  return (DIFFICULTY_TONE[d] as Tone) ?? "default";
}

/* ------------------------------------------------------------------ */
/* Setup screen                                                        */
/* ------------------------------------------------------------------ */

function SetupScreen({
  role,
  setRole,
  type,
  setType,
  cameraOn,
  setCameraOn,
  starting,
  onStart,
}: {
  role: string;
  setRole: (v: string) => void;
  type: string;
  setType: (v: string) => void;
  cameraOn: boolean;
  setCameraOn: (v: boolean) => void;
  starting: boolean;
  onStart: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <ClipboardList className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Configure your interview</CardTitle>
              <CardDescription className="text-xs">
                Pick a role and the kind of questions you want to be asked.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="mi-role">Target role</Label>
            <Input
              id="mi-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
            />
            <p className="text-xs text-muted-foreground">
              The interviewer will tailor questions to this role.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Interview type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVIEW_TYPES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex flex-col">
                      <span>{t.label}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {t.hint}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Camera className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Record with camera</p>
                <p className="text-xs text-muted-foreground">
                  Capture your mic + webcam so you can review yourself afterwards.
                  Stored locally only.
                </p>
              </div>
            </div>
            <Switch checked={cameraOn} onCheckedChange={setCameraOn} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Pill tone="default">
                <ListChecks className="mr-1 size-3" />
                {TOTAL_QUESTIONS} questions
              </Pill>
              <Pill tone="info">
                <Sparkles className="mr-1 size-3" />
                AI interviewer
              </Pill>
              <span>~ 10–15 min</span>
            </div>
            <AIButton onClick={onStart} loading={starting} disabled={starting || !role.trim()}>
              Start Interview
            </AIButton>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/[0.04]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
              <GraduationCap className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">How it works</CardTitle>
              <CardDescription className="text-xs">
                Five rounds. Real answers. AI scored feedback.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            {
              icon: Layers,
              title: "5 curated questions",
              body: "Generated for your role and the chosen interview track.",
            },
            {
              icon: Gauge,
              title: "Scored on the spot",
              body: "Each answer is graded with strengths, gaps and a model answer.",
            },
            {
              icon: Target,
              title: "Actionable recap",
              body: "Average score, key strengths, and what to work on next.",
            },
            {
              icon: Video,
              title: "Optional self-recording",
              body: "Record your mic + camera to review tone and body language.",
            },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/60 p-3"
              >
                <div className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-3.5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.body}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Camera preview overlay                                              */
/* ------------------------------------------------------------------ */

function CameraPreview({
  videoRef,
  recording,
  ready,
  muted = true,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  recording: boolean;
  ready: boolean;
  muted?: boolean;
}) {
  return (
    <div className="absolute right-4 top-4 z-20 w-32 overflow-hidden rounded-lg border border-white/20 bg-black/80 shadow-xl backdrop-blur sm:w-40">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="aspect-video w-full object-cover"
      />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-black/85 px-2 text-center text-[10px] uppercase tracking-wide text-white/70">
          Requesting
          <br />
          camera…
        </div>
      )}
      {ready && recording && (
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5">
          <span className="size-2 animate-pulse rounded-full bg-red-500" />
          <span className="text-[10px] font-medium uppercase tracking-wide text-white">
            Rec
          </span>
        </div>
      )}
      <div className="absolute bottom-1 right-1 rounded bg-black/50 px-1 py-0.5 text-[9px] uppercase tracking-wide text-white/80">
        Self-view
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Interview screen                                                    */
/* ------------------------------------------------------------------ */

function FeedbackCard({ score }: { score: ScoreResult }) {
  const tone = gradeTone(score.grade);
  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">AI Feedback</CardTitle>
              <CardDescription className="text-xs">
                {score.feedback}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone={tone}>{score.grade}</Pill>
            <div className="flex items-baseline gap-0.5">
              <span
                className={cn(
                  "text-2xl font-bold",
                  score.score >= 80
                    ? "text-primary"
                    : score.score >= 50
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400",
                )}
              >
                {score.score}
              </span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <CheckCircle2 className="size-3.5" /> Strengths
            </p>
            <ul className="space-y-1.5">
              {score.strengths?.length ? (
                score.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/90">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-primary" />
                    <span>{s}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-muted-foreground">No notable strengths.</li>
              )}
            </ul>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-3.5" /> To improve
            </p>
            <ul className="space-y-1.5">
              {score.improvements?.length ? (
                score.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/90">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-amber-500" />
                    <span>{s}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-muted-foreground">Nothing critical.</li>
              )}
            </ul>
          </div>
        </div>
        <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Lightbulb className="size-3.5" /> Model answer
          </p>
          <p className="text-sm leading-relaxed text-foreground/90">
            {score.modelAnswer}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function InterviewScreen({
  role,
  type,
  questions,
  index,
  answer,
  setAnswer,
  submittedScore,
  scoring,
  generating,
  onSubmit,
  onSkip,
  onNext,
  onEnd,
  cameraWanted,
  cameraReady,
  videoRef,
  recording,
}: {
  role: string;
  type: string;
  questions: Question[];
  index: number;
  answer: string;
  setAnswer: (v: string) => void;
  submittedScore: ScoreResult | null;
  scoring: boolean;
  generating: boolean;
  onSubmit: () => void;
  onSkip: () => void;
  onNext: () => void;
  onEnd: () => void;
  cameraWanted: boolean;
  cameraReady: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  recording: boolean;
}) {
  const current = questions[index];
  const progress = ((index + (submittedScore ? 1 : 0)) / questions.length) * 100;

  if (generating) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-20">
          <TypingDots />
          <p className="text-sm text-muted-foreground">
            The AI interviewer is preparing your {type.toLowerCase()} questions…
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!current) {
    return null;
  }

  return (
    <div className="relative space-y-4">
      {cameraWanted && (
        <CameraPreview
          videoRef={videoRef}
          recording={recording}
          ready={cameraReady}
        />
      )}

      {/* Header bar */}
      <Card>
        <CardContent
          className={cn(
            "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
            cameraWanted && "sm:pr-44",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Video className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Question {index + 1}{" "}
                <span className="text-muted-foreground">of {questions.length}</span>
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                  {role}
                </Badge>
                <Pill tone="info">{type}</Pill>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onEnd}>
            <Square className="size-3.5" /> End Interview
          </Button>
        </CardContent>
      </Card>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Question card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="default">
              <CircleDot className="mr-1 size-2.5" /> {current.topic}
            </Pill>
            <Pill tone={difficultyTone(current.difficulty)}>
              {current.difficulty}
            </Pill>
            <Pill tone="info">{current.type}</Pill>
          </div>
          <CardTitle className="pt-2 text-lg leading-snug">
            {current.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {current.evaluationCriteria?.length > 0 && (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-3">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                What the interviewer is looking for
              </p>
              <div className="flex flex-wrap gap-1.5">
                {current.evaluationCriteria.map((c, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-background/80 px-2 py-0.5 text-xs text-foreground/80 ring-1 ring-border/60"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answer card */}
      {!submittedScore ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your answer</CardTitle>
            <CardDescription className="text-xs">
              Type your response. Aim for 3–6 sentences — be specific.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              rows={6}
              placeholder="Walk the interviewer through your thinking…"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="resize-y text-sm"
              disabled={scoring}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {answer.trim().split(/\s+/).filter(Boolean).length} words
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  onClick={onSkip}
                  disabled={scoring}
                >
                  <SkipForward className="size-3.5" /> Skip
                </Button>
                <AIButton
                  onClick={onSubmit}
                  loading={scoring}
                  disabled={scoring || answer.trim().length < 5}
                >
                  Submit Answer
                </AIButton>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your answer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/30 p-3 text-sm leading-relaxed text-foreground/90">
                {answer.trim() || (
                  <span className="italic text-muted-foreground">
                    (No answer provided)
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <FeedbackCard score={submittedScore} />

          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={onNext}>
              {index === questions.length - 1 ? "See Results" : "Next Question"}
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Results screen                                                      */
/* ------------------------------------------------------------------ */

function ResultsScreen({
  answers,
  recordedUrl,
  role,
  type,
  onRestart,
}: {
  answers: AnswerRecord[];
  recordedUrl: string | null;
  role: string;
  type: string;
  onRestart: () => void;
}) {
  const scored = answers.filter((a) => a.score !== null) as {
    question: Question;
    answer: string;
    score: ScoreResult;
  }[];
  const overall =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, a) => sum + (a.score?.score ?? 0), 0) / scored.length,
        )
      : 0;

  // Aggregate top strengths + improvements (deduped, in first-appearance order).
  const seenStrengths = new Set<string>();
  const strengthsAgg: string[] = [];
  scored.forEach((a) =>
    a.score.strengths.forEach((s) => {
      const k = s.trim();
      if (!seenStrengths.has(k)) {
        seenStrengths.add(k);
        strengthsAgg.push(s);
      }
    }),
  );
  const seenImps = new Set<string>();
  const improvementsAgg: string[] = [];
  scored.forEach((a) =>
    a.score.improvements.forEach((s) => {
      const k = s.trim();
      if (!seenImps.has(k)) {
        seenImps.add(k);
        improvementsAgg.push(s);
      }
    }),
  );

  const skippedCount = answers.length - scored.length;

  const grade =
    overall >= 85
      ? "Excellent"
      : overall >= 70
        ? "Good"
        : overall >= 50
          ? "Average"
          : overall >= 30
            ? "Needs Work"
            : "Practice More";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-600 via-primary to-teal-500 text-primary-foreground">
        <div className="absolute inset-0 opacity-30">
          <div className="animate-blob absolute -right-10 -top-10 size-56 rounded-full bg-white/30 blur-3xl" />
          <div className="animate-blob absolute -bottom-16 left-1/4 size-64 rounded-full bg-teal-200/30 blur-3xl [animation-delay:3s]" />
        </div>
        <CardContent className="relative grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto]">
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
            <ScoreRing
              value={overall}
              size={130}
              label="Overall"
              suffix=""
            />
          </div>
          <div>
            <Badge className="mb-2 border-0 bg-white/15 text-primary-foreground backdrop-blur">
              <Trophy className="mr-1 size-3" /> Interview complete
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight">{grade}</h2>
            <p className="mt-1 max-w-md text-sm text-primary-foreground/85">
              You answered {scored.length} of {answers.length}{" "}
              {answers.length === 1 ? "question" : "questions"} for the{" "}
              <span className="font-medium">{role}</span> · {type} round.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
                Avg score · {overall}/100
              </span>
              {skippedCount > 0 && (
                <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
                  Skipped · {skippedCount}
                </span>
              )}
              <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
                Best · {scored.length ? Math.max(...scored.map((a) => a.score.score)) : 0}
              </span>
            </div>
          </div>
          <Button
            onClick={onRestart}
            className="border-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <RotateCcw className="mr-1.5 size-3.5" /> Practice Again
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-primary/20 bg-primary/[0.04]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
                <CheckCircle2 className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base">Strengths to keep</CardTitle>
                <CardDescription className="text-xs">
                  Patterns that came up across your answers
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {strengthsAgg.length ? (
              <ul className="space-y-2">
                {strengthsAgg.slice(0, 6).map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-primary/15 bg-card/60 p-2.5 text-sm"
                  >
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No strengths recorded — try the interview again.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/[0.04]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Target className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base">Areas to improve</CardTitle>
                <CardDescription className="text-xs">
                  Focus your prep here before the next round
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {improvementsAgg.length ? (
              <ul className="space-y-2">
                {improvementsAgg.slice(0, 6).map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-amber-500/15 bg-card/60 p-2.5 text-sm"
                  >
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing flagged — solid job!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recording playback */}
      {recordedUrl && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Video className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base">Your recording</CardTitle>
                <CardDescription className="text-xs">
                  Review your tone, pacing and body language. Stored locally — refresh
                  clears it.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-border/70 bg-black">
              <video
                src={recordedUrl}
                controls
                playsInline
                className="aspect-video w-full bg-black object-contain"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-question breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <ListChecks className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Per-question breakdown</CardTitle>
              <CardDescription className="text-xs">
                Each question with your answer, score, and AI feedback
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {answers.map((a, i) => (
            <div
              key={a.question.id ?? i}
              className="rounded-xl border border-border/70 bg-card/50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">
                      {a.question.question}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Pill tone="default">{a.question.topic}</Pill>
                      <Pill tone={difficultyTone(a.question.difficulty)}>
                        {a.question.difficulty}
                      </Pill>
                    </div>
                  </div>
                </div>
                {a.score ? (
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        "text-xl font-bold",
                        a.score.score >= 80
                          ? "text-primary"
                          : a.score.score >= 50
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {a.score.score}
                    </span>
                    <Pill tone={gradeTone(a.score.grade)}>{a.score.grade}</Pill>
                  </div>
                ) : (
                  <Pill tone="warn">Skipped</Pill>
                )}
              </div>

              <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Your answer
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {a.answer.trim() || (
                    <span className="italic text-muted-foreground">
                      (No answer provided)
                    </span>
                  )}
                </p>
              </div>

              {a.score && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">{a.score.feedback}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-primary/15 bg-primary/[0.04] p-2.5">
                      <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        <CheckCircle2 className="size-3" /> Strengths
                      </p>
                      <ul className="space-y-1">
                        {a.score.strengths.map((s, j) => (
                          <li key={j} className="text-xs text-foreground/90">
                            • {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-amber-500/15 bg-amber-500/[0.04] p-2.5">
                      <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="size-3" /> Improve
                      </p>
                      <ul className="space-y-1">
                        {a.score.improvements.map((s, j) => (
                          <li key={j} className="text-xs text-foreground/90">
                            • {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                    <p className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <Lightbulb className="size-3" /> Model answer
                    </p>
                    <p className="text-xs leading-relaxed text-foreground/90">
                      {a.score.modelAnswer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onRestart} variant="outline" className="gap-1.5">
          <RotateCcw className="size-3.5" /> Practice Again
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main module                                                         */
/* ------------------------------------------------------------------ */

export function MockInterviewModule() {
  const [phase, setPhase] = React.useState<Phase>("setup");
  const [role, setRole] = React.useState("Senior Frontend Engineer");
  const [type, setType] = React.useState("Technical");
  const [cameraOn, setCameraOn] = React.useState(false);

  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [index, setIndex] = React.useState(0);
  const [answer, setAnswer] = React.useState("");
  const [answers, setAnswers] = React.useState<AnswerRecord[]>([]);
  const [submittedScore, setSubmittedScore] = React.useState<ScoreResult | null>(null);

  const [generating, setGenerating] = React.useState(false);
  const [scoring, setScoring] = React.useState(false);

  // Recording state
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const [recordedUrl, setRecordedUrl] = React.useState<string | null>(null);

  /* ---------- helpers ---------- */

  const cleanupRecording = React.useCallback(() => {
    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    } catch {
      /* noop */
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setRecording(false);
    setCameraActive(false);
  }, []);

  const startCamera = React.useCallback(async (): Promise<boolean> => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera API not available in this browser.");
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      // Wait a tick so the video element is mounted before we assign srcObject.
      setCameraActive(true);
      // Assign srcObject after the video element renders.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });

      // Set up the MediaRecorder
      if (typeof MediaRecorder !== "undefined") {
        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(stream);
        } catch {
          // Some browsers want a mimeType.
          recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
        }
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          if (blob.size > 0) {
            setRecordedUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return URL.createObjectURL(blob);
            });
          }
          chunksRef.current = [];
        };
        recorderRef.current = recorder;
        recorder.start();
        setRecording(true);
      } else {
        toast.warning("Recording not supported — live preview only.");
      }
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Permission denied";
      toast.error(`Couldn't access camera/mic: ${msg}. Continuing without recording.`);
      setCameraActive(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return false;
    }
  }, []);

  /* ---------- start interview ---------- */

  const handleStart = React.useCallback(async () => {
    if (!role.trim()) {
      toast.error("Please enter a target role.");
      return;
    }
    setGenerating(true);
    setPhase("interview");
    setIndex(0);
    setAnswer("");
    setAnswers([]);
    setSubmittedScore(null);

    // Revoke any previous recording URL.
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }

    try {
      const res = await fetch("/api/ai/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", role, type }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate questions");
      const qs: Question[] = json.questions ?? [];
      if (!qs.length) throw new Error("No questions returned.");
      // Pad/truncate to TOTAL_QUESTIONS just in case.
      setQuestions(qs.slice(0, TOTAL_QUESTIONS));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
      setPhase("setup");
    } finally {
      setGenerating(false);
    }
    // Camera start is handled by a useEffect that fires once the interview
    // screen has mounted and questions are ready (so the <video> element
    // is in the DOM before we attach the stream).
  }, [role, type, recordedUrl]);

  /* ---------- submit answer ---------- */

  const handleSubmit = React.useCallback(async () => {
    if (answer.trim().length < 5) {
      toast.error("Please write a more complete answer before submitting.");
      return;
    }
    const current = questions[index];
    if (!current) return;
    setScoring(true);
    try {
      const res = await fetch("/api/ai/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "score",
          question: current.question,
          answer,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to score answer");
      setSubmittedScore(json as ScoreResult);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setScoring(false);
    }
  }, [answer, questions, index]);

  /* ---------- skip / next ---------- */

  const recordCurrent = React.useCallback(
    (finalAnswer: string, finalScore: ScoreResult | null) => {
      const current = questions[index];
      if (!current) return;
      setAnswers((prev) => {
        // Replace any existing record for this index (e.g., user re-submitted).
        const next = prev.filter((_, i) => i !== index);
        // Re-insert at the right position.
        const newRec: AnswerRecord = {
          question: current,
          answer: finalAnswer,
          score: finalScore,
        };
        const result = [...next];
        result.splice(index, 0, newRec);
        return result;
      });
    },
    [questions, index],
  );

  const finishInterview = React.useCallback(() => {
    cleanupRecording();
    // recorder.onstop fires asynchronously and sets recordedUrl.
    setPhase("results");
  }, [cleanupRecording]);

  const handleSkip = React.useCallback(() => {
    recordCurrent(answer, null);
    toast.info("Question skipped — you can review it in the recap.");
    // If this was the last question, go to results; otherwise advance.
    if (index >= questions.length - 1) {
      finishInterview();
    } else {
      setIndex((i) => i + 1);
      setAnswer("");
      setSubmittedScore(null);
    }
  }, [answer, index, questions.length, recordCurrent, finishInterview]);

  const handleNext = React.useCallback(() => {
    // Persist current answer+score (already persisted on submit, but be safe).
    if (submittedScore) recordCurrent(answer, submittedScore);
    if (index >= questions.length - 1) {
      finishInterview();
    } else {
      setIndex((i) => i + 1);
      setAnswer("");
      setSubmittedScore(null);
    }
  }, [submittedScore, answer, index, questions.length, recordCurrent, finishInterview]);

  const handleEnd = React.useCallback(() => {
    // Persist whatever we have for the current question (if not already).
    if (submittedScore) recordCurrent(answer, submittedScore);
    cleanupRecording();
    setPhase("results");
  }, [submittedScore, answer, recordCurrent, cleanupRecording]);

  /* ---------- restart ---------- */

  const handleRestart = React.useCallback(() => {
    cleanupRecording();
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }
    setQuestions([]);
    setIndex(0);
    setAnswer("");
    setAnswers([]);
    setSubmittedScore(null);
    setPhase("setup");
  }, [cleanupRecording, recordedUrl]);

  /* ---------- camera: start when interview becomes ready ---------- */

  React.useEffect(() => {
    if (phase !== "interview" || generating || !cameraOn || cameraActive) return;
    let cancelled = false;
    void (async () => {
      const ok = await startCamera();
      if (cancelled || !ok) return;
      // startCamera already attached the stream to the <video> element via rAF.
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, generating, cameraOn, cameraActive, startCamera]);

  /* ---------- cleanup on unmount ---------- */

  React.useEffect(() => {
    return () => {
      cleanupRecording();
      setRecordedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [cleanupRecording]);

  /* ---------- render ---------- */

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Video}
        title="AI Mock Interview"
        description="Practice with an AI interviewer and review your performance."
      >
        {phase === "interview" && (
          <Badge variant="secondary" className="gap-1 bg-red-500/10 text-red-600 dark:text-red-400">
            <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
            Live session
          </Badge>
        )}
        {phase === "results" && (
          <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
            <Trophy className="size-3" />
            Recap
          </Badge>
        )}
      </ModuleHeader>

      {phase === "setup" && (
        <SetupScreen
          role={role}
          setRole={setRole}
          type={type}
          setType={setType}
          cameraOn={cameraOn}
          setCameraOn={setCameraOn}
          starting={generating}
          onStart={handleStart}
        />
      )}

      {phase === "interview" && (
        <InterviewScreen
          role={role}
          type={type}
          questions={questions}
          index={index}
          answer={answer}
          setAnswer={setAnswer}
          submittedScore={submittedScore}
          scoring={scoring}
          generating={generating}
          onSubmit={handleSubmit}
          onSkip={handleSkip}
          onNext={handleNext}
          onEnd={handleEnd}
          cameraWanted={cameraOn}
          cameraReady={cameraActive}
          videoRef={videoRef}
          recording={recording}
        />
      )}

      {phase === "results" && (
        <ResultsScreen
          answers={answers}
          recordedUrl={recordedUrl}
          role={role}
          type={type}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
