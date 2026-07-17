"use client";

import * as React from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Trash2,
  AlertTriangle,
  CornerDownLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ModuleHeader, TypingDots } from "@/components/shared/blocks";
import { useResumeStore } from "@/store/resume-store";
import { fetchWithFallback } from "@/components/shared/utils";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "Why am I not getting calls?",
  "Review my resume",
  "Optimize my LinkedIn",
  "Negotiate my salary",
  "Write a resignation letter",
  "Interview questions for manager role",
];

const WELCOME: Message = {
  role: "assistant",
  content:
    "Hi, I'm your AI Career Coach. I've reviewed your resume context and I'm ready to help with anything — interviews, salary, resumes, LinkedIn, transitions. What's on your mind?",
};

export function CoachModule() {
  const d = useResumeStore((s) => s.data);
  const resumeContext = React.useMemo(
    () =>
      `${d.name}\n${d.title}\n\nSUMMARY\n${d.summary}\n\nEXPERIENCE\n${d.experience
        .map(
          (e) =>
            `${e.role} @ ${e.company}\n${e.bullets.map((b) => "- " + b).join("\n")}`,
        )
        .join("\n\n")}\n\nSKILLS\n${d.skills.join(", ")}`,
    [d],
  );

  const [messages, setMessages] = React.useState<Message[]>([WELCOME]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages / loading change
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;

    setError(null);
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const json = await fetchWithFallback<{ reply: string }>(
        "/api/ai/coach",
        { messages: nextMessages, resumeContext },
      );
      setMessages((cur) => [
        ...cur,
        { role: "assistant", content: json.reply },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME]);
    setError(null);
  };

  const isEmpty = messages.length <= 1;

  return (
    <div className="space-y-4">
      <ModuleHeader
        icon={Bot}
        title="AI Career Coach"
        description="ChatGPT for your career. Ask anything, 24/7"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={clearChat}
          className="gap-1.5"
          disabled={loading || isEmpty}
        >
          <Trash2 className="size-3.5" /> Clear
        </Button>
      </ModuleHeader>

      <Card className="flex h-[calc(100vh-13rem)] min-h-[28rem] flex-col overflow-hidden border-primary/20">
        {/* Messages */}
        <div
          ref={scrollRef}
          className="scroll-thin flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-primary/[0.03] to-transparent p-4 sm:p-6"
        >
          {messages.map((m, i) => (
            <Bubble key={i} message={m} />
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <Avatar role="assistant" />
              <div className="rounded-2xl rounded-tl-sm bg-primary/10 px-4 py-3 text-primary">
                <TypingDots />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">Coach couldn&apos;t respond.</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-1" />
        </div>

        {/* Starter prompts (only when conversation is empty) */}
        {isEmpty && !loading && (
          <div className="border-t border-border/60 bg-card/50 p-3 sm:p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <Sparkles className="size-3 text-primary" /> Try one of these
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="sticky bottom-0 border-t border-border/60 bg-card p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask anything about your career…"
                rows={1}
                className="max-h-40 min-h-11 resize-none pr-24"
                disabled={loading}
              />
              <span className="pointer-events-none absolute bottom-2 right-3 hidden items-center gap-1 text-[10px] text-muted-foreground sm:flex">
                <CornerDownLeft className="size-3" /> to send
                <span className="mx-1 opacity-50">·</span>
                Shift+Enter for newline
              </span>
            </div>
            <Button
              size="icon"
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="size-11 shrink-0 rounded-xl"
              aria-label="Send message"
            >
              {loading ? (
                <Sparkles className="size-4 animate-pulse" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "user") {
    return (
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        <User className="size-4" />
      </div>
    );
  }
  return (
    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/20">
      <Bot className="size-4" />
    </div>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isUser && "flex-row-reverse",
      )}
    >
      <Avatar role={message.role} />
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[75%]",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-tl-sm bg-primary/10 text-foreground ring-1 ring-primary/10",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
