"use client";

import * as React from "react";
import {
  Mail,
  Copy,
  Check,
  Download,
  RefreshCw,
  FileText,
  PenLine,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ModuleHeader,
  AIButton,
  AIEmptyState,
  TypingDots,
} from "@/components/shared/blocks";
import { useAI } from "@/components/shared/utils";
import { useResumeStore } from "@/store/resume-store";

const TONES = [
  { value: "confident", label: "Confident" },
  { value: "warm", label: "Warm" },
  { value: "concise", label: "Concise" },
  { value: "story-driven", label: "Story-driven" },
  { value: "formal", label: "Formal" },
];

interface CoverLetterResult {
  letter: string;
}

export function CoverLetterModule() {
  const d = useResumeStore((s) => s.data);
  const [jd, setJd] = React.useState("");
  const [tone, setTone] = React.useState("confident");
  const [copied, setCopied] = React.useState(false);

  const { data, loading, error, run } = useAI<CoverLetterResult>();

  const resumeText = React.useMemo(() => {
    return `${d.name}\n${d.title}\n\nSUMMARY\n${d.summary}\n\nEXPERIENCE\n${d.experience
      .map(
        (e) =>
          `${e.role} @ ${e.company} (${e.start}-${e.end})\n${e.bullets
            .map((b) => "- " + b)
            .join("\n")}`
      )
      .join("\n\n")}\n\nSKILLS\n${d.skills.join(", ")}\n\nPROJECTS\n${d.projects
      .map((p) => `${p.name}: ${p.description} [${p.tech.join(", ")}]`)
      .join("\n")}`;
  }, [d]);

  const handleGenerate = React.useCallback(() => {
    if (!jd.trim()) {
      toast.error("Please paste a job description first.");
      return;
    }
    run("/api/ai/cover-letter", { resumeText, jd, tone });
  }, [jd, tone, resumeText, run]);

  const handleCopy = () => {
    if (!data?.letter) return;
    navigator.clipboard.writeText(data.letter).then(() => {
      setCopied(true);
      toast.success("Cover letter copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleDownload = () => {
    if (!data?.letter) return;
    const blob = new Blob([data.letter], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${d.name.split(" ")[0].toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded");
  };

  const toneLabel = TONES.find((t) => t.value === tone)?.label ?? "Confident";
  const wordCount = data?.letter
    ? data.letter.trim().split(/\s+/).length
    : 0;

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Mail}
        title="Cover Letter Generator"
        description="Tailored cover letters for every application"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Inputs */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Job Description</CardTitle>
            <CardDescription className="text-xs">
              Paste the JD you&apos;re applying to — the letter will be tailored
              to it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here…"
              className="min-h-[200px] resize-y"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Tone
              </label>
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

            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
              <div className="flex items-center gap-2">
                <FileText className="size-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">Using:</span>
              </div>
              <Badge variant="secondary" className="bg-primary/15 text-primary">
                {d.name}&apos;s resume
              </Badge>
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            )}

            <AIButton
              onClick={handleGenerate}
              loading={loading}
              disabled={!jd.trim()}
              className="w-full"
            >
              {data ? "Regenerate Letter" : "Generate Letter"}
            </AIButton>
          </CardContent>
        </Card>

        {/* Output */}
        <div className="space-y-3">
          {!data && !loading && (
            <AIEmptyState
              icon={Mail}
              title="Your cover letter will appear here"
              description="Paste a job description, choose a tone, and generate a tailored cover letter in seconds."
            />
          )}

          {loading && !data && (
            <Card>
              <CardContent className="flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
                <TypingDots /> Writing your cover letter…
              </CardContent>
            </Card>
          )}

          {data && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <PenLine className="size-3.5 text-primary" />
                  {wordCount} words · {toneLabel} tone
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="size-3.5 text-primary" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={handleDownload}
                  >
                    <Download className="size-3.5" /> .txt
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={
                        loading ? "size-3.5 animate-spin" : "size-3.5"
                      }
                    />{" "}
                    Regenerate
                  </Button>
                </div>
              </div>

              <Card className="mx-auto max-w-2xl bg-white text-slate-900 shadow-md">
                <CardContent className="px-8 py-10 font-serif text-[15px] leading-relaxed sm:px-12 sm:py-12">
                  <div className="whitespace-pre-wrap">{data.letter}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
