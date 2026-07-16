"use client";

import * as React from "react";
import {
  Globe,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Check,
  Layers,
  Rss,
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleHeader, AIButton } from "@/components/shared/blocks";
import { useResumeStore } from "@/store/resume-store";

const THEMES = {
  midnight: {
    name: "Midnight",
    bg: "linear-gradient(180deg, #0a0e1a 0%, #0f172a 60%, #0a0e1a 100%)",
    cardBg: "rgba(255,255,255,0.04)",
    cardBorder: "rgba(255,255,255,0.08)",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
  },
  aurora: {
    name: "Aurora",
    bg: "linear-gradient(135deg, #134e4a 0%, #4c1d95 50%, #831843 100%)",
    cardBg: "rgba(255,255,255,0.06)",
    cardBorder: "rgba(255,255,255,0.14)",
    text: "#f5f3ff",
    textMuted: "#d8b4fe",
  },
  minimal: {
    name: "Minimal",
    bg: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    cardBg: "#ffffff",
    cardBorder: "#e2e8f0",
    text: "#0f172a",
    textMuted: "#64748b",
  },
} as const;

const ACCENTS = [
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Purple", value: "#a855f7" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Fuchsia", value: "#d946ef" },
] as const;

type ThemeKey = keyof typeof THEMES;

const BLOG_POSTS = [
  "Designing for scale at Razorpay",
  "Why I moved from CRA to Next.js",
  "Building accessible design systems",
];

export function PortfolioModule() {
  const d = useResumeStore((s) => s.data);
  const [theme, setTheme] = React.useState<ThemeKey>("midnight");
  const [accent, setAccent] = React.useState<string>(ACCENTS[0].value);
  const [includeProjects, setIncludeProjects] = React.useState(true);
  const [includeBlog, setIncludeBlog] = React.useState(false);

  const t = THEMES[theme];
  const initials = d.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // compute section index for skills label
  let sectionIdx = 2;
  if (includeProjects) sectionIdx++;
  if (includeBlog) sectionIdx++;
  const skillsIdx = sectionIdx;

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Globe}
        title="Portfolio Builder"
        description="Turn your resume into a portfolio website in one click"
      >
        <AIButton
          onClick={() =>
            toast.success("Portfolio published to deepaksharma.careeros.app", {
              description: "Your site is now live.",
            })
          }
        >
          Publish Portfolio
        </AIButton>
      </ModuleHeader>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* LEFT: preview */}
        <Card className="overflow-hidden p-0 gap-0">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-red-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="ml-3 flex flex-1 items-center gap-2 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
              <span className="size-3 rounded-full bg-primary/40" />
              deepaksharma.dev
            </div>
            <ExternalLink className="size-3.5 text-muted-foreground" />
          </div>

          {/* The actual site preview */}
          <div
            className="scroll-thin max-h-[680px] overflow-y-auto px-6 py-8 sm:px-8"
            style={{ background: t.bg, color: t.text }}
          >
            {/* Hero */}
            <div className="mx-auto max-w-2xl">
              <div className="flex items-center gap-4">
                <div
                  className="grid size-16 place-items-center rounded-2xl text-xl font-bold text-white shadow-lg"
                  style={{ background: accent }}
                >
                  {initials}
                </div>
                <div>
                  <div
                    className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: accent }}
                  >
                    {d.title}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {d.name}
                  </h1>
                </div>
              </div>
              <p
                className="mt-5 text-sm leading-relaxed"
                style={{ color: t.textMuted }}
              >
                {d.summary}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white"
                  style={{ background: accent }}
                >
                  <Mail className="size-3" /> Get in touch
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    color: t.text,
                  }}
                >
                  <Github className="size-3" /> GitHub
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    color: t.text,
                  }}
                >
                  <Linkedin className="size-3" /> LinkedIn
                </span>
              </div>
            </div>

            {/* About */}
            <div className="mx-auto mt-10 max-w-2xl">
              <div
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: accent }}
              >
                01 · About
              </div>
              <h2 className="mt-1 text-lg font-semibold">A bit about me</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div
                  className="rounded-xl p-3 text-center"
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                  }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: accent }}
                  >
                    6+
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-wide"
                    style={{ color: t.textMuted }}
                  >
                    Years
                  </div>
                </div>
                <div
                  className="rounded-xl p-3 text-center"
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                  }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: accent }}
                  >
                    10M+
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-wide"
                    style={{ color: t.textMuted }}
                  >
                    Users
                  </div>
                </div>
                <div
                  className="rounded-xl p-3 text-center"
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                  }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: accent }}
                  >
                    8
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-wide"
                    style={{ color: t.textMuted }}
                  >
                    Teams
                  </div>
                </div>
              </div>
            </div>

            {/* Projects */}
            {includeProjects && (
              <div className="mx-auto mt-10 max-w-2xl">
                <div
                  className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: accent }}
                >
                  02 · Projects
                </div>
                <h2 className="mt-1 text-lg font-semibold">Selected work</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {d.projects.map((p) => (
                    <div
                      key={p.id}
                      className="group rounded-xl p-4 transition-transform hover:-translate-y-0.5"
                      style={{
                        background: t.cardBg,
                        border: `1px solid ${t.cardBorder}`,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="grid size-8 place-items-center rounded-lg text-white"
                          style={{ background: accent }}
                        >
                          <Layers className="size-4" />
                        </div>
                        <ArrowUpRight
                          className="size-4 opacity-50 transition-opacity group-hover:opacity-100"
                          style={{ color: t.textMuted }}
                        />
                      </div>
                      <h3 className="mt-3 text-sm font-semibold">{p.name}</h3>
                      <p
                        className="mt-1 text-xs leading-relaxed"
                        style={{ color: t.textMuted }}
                      >
                        {p.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {p.tech.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                            style={{
                              background: `${accent}1a`,
                              color: accent,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blog (visual only) */}
            {includeBlog && (
              <div className="mx-auto mt-10 max-w-2xl">
                <div
                  className="text-[10px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: accent }}
                >
                  {includeProjects ? "03" : "02"} · Writing
                </div>
                <h2 className="mt-1 text-lg font-semibold">Latest posts</h2>
                <div className="mt-3 space-y-2">
                  {BLOG_POSTS.map((post, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5"
                      style={{
                        background: t.cardBg,
                        border: `1px solid ${t.cardBorder}`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Rss className="size-3.5" style={{ color: accent }} />
                        <span className="text-xs font-medium">{post}</span>
                      </div>
                      <ArrowUpRight
                        className="size-3.5"
                        style={{ color: t.textMuted }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            <div className="mx-auto mt-10 max-w-2xl">
              <div
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: accent }}
              >
                {String(skillsIdx).padStart(2, "0")} · Skills
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {d.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium"
                    style={{
                      background: t.cardBg,
                      border: `1px solid ${t.cardBorder}`,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer / contact */}
            <div
              className="mx-auto mt-12 max-w-2xl rounded-2xl p-5 text-center"
              style={{
                background: `${accent}14`,
                border: `1px solid ${accent}33`,
              }}
            >
              <h3 className="text-sm font-semibold">
                Let&apos;s build something great.
              </h3>
              <p className="mt-1 text-xs" style={{ color: t.textMuted }}>
                {d.email} · {d.phone}
              </p>
              <div
                className="mt-3 flex items-center justify-center gap-3 text-xs"
                style={{ color: t.textMuted }}
              >
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" /> {d.location}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Github className="size-3" /> {d.github}
                </span>
              </div>
            </div>

            <div
              className="mx-auto mt-6 max-w-2xl text-center text-[10px]"
              style={{ color: t.textMuted }}
            >
              © {new Date().getFullYear()} {d.name} · Built with CareerOS
            </div>
          </div>
        </Card>

        {/* RIGHT: controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Theme</CardTitle>
              <CardDescription className="text-xs">
                Switch the visual style of your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={theme}
                onValueChange={(v) => setTheme(v as ThemeKey)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="midnight">Midnight</TabsTrigger>
                  <TabsTrigger value="aurora">Aurora</TabsTrigger>
                  <TabsTrigger value="minimal">Minimal</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className="size-3 rounded-full"
                  style={{
                    background:
                      theme === "minimal"
                        ? "#ffffff"
                        : theme === "aurora"
                          ? "linear-gradient(135deg,#134e4a,#831843)"
                          : "#0f172a",
                  }}
                />
                {THEMES[theme].name} theme
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Accent Color</CardTitle>
              <CardDescription className="text-xs">
                Used for highlights, buttons & links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2.5">
                {ACCENTS.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setAccent(a.value)}
                    title={a.name}
                    aria-label={a.name}
                    className="grid size-9 place-items-center rounded-full transition-transform hover:scale-110"
                    style={{
                      background: a.value,
                      boxShadow:
                        accent === a.value
                          ? `0 0 0 2px var(--background), 0 0 0 4px ${a.value}`
                          : undefined,
                    }}
                  >
                    {accent === a.value && (
                      <Check className="size-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sections</CardTitle>
              <CardDescription className="text-xs">
                Toggle what to include in your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Include projects</p>
                  <p className="text-xs text-muted-foreground">
                    Showcase your work
                  </p>
                </div>
                <Switch
                  checked={includeProjects}
                  onCheckedChange={setIncludeProjects}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Include blog</p>
                  <p className="text-xs text-muted-foreground">
                    Visual only · sample posts
                  </p>
                </div>
                <Switch
                  checked={includeBlog}
                  onCheckedChange={setIncludeBlog}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <p className="text-sm font-semibold">Ready to publish?</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Your portfolio will be live at{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                  deepaksharma.careeros.app
                </code>{" "}
                with your selected theme &amp; accent.
              </p>
              <Button
                className="w-full gap-1.5"
                onClick={() =>
                  toast.success("Portfolio published to deepaksharma.careeros.app", {
                    description: "Your site is now live.",
                  })
                }
              >
                <Globe className="size-3.5" /> Publish Portfolio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
