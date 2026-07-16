"use client";

import * as React from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Wallet,
  Clock,
  ExternalLink,
  Bookmark,
  TrendingUp,
  Building2,
  Sparkles,
  Filter,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ModuleHeader,
  AIButton,
  Pill,
  AIEmptyState,
} from "@/components/shared/blocks";
import { useAI } from "@/components/shared/utils";
import { useResumeStore } from "@/store/resume-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Source = "LinkedIn" | "Naukri" | "Indeed" | "Wellfound" | "Glassdoor";

interface JobResult {
  title: string;
  company: string;
  location: string;
  experience: string;
  salary: string;
  source: Source;
  posted: string;
  matchScore: number;
  tags: string[];
  remote: boolean;
  url: string;
}

interface SearchResponse {
  results: JobResult[];
  totalFound: number;
  marketInsight: string;
  topHiringCompanies: string[];
}

const SOURCES: Source[] = [
  "LinkedIn",
  "Naukri",
  "Indeed",
  "Wellfound",
  "Glassdoor",
];

const SOURCE_STYLES: Record<Source, string> = {
  LinkedIn: "bg-[#0a66c2]/12 text-[#0a66c2] dark:text-[#5fa8f5]",
  Naukri: "bg-red-500/12 text-red-600 dark:text-red-400",
  Indeed: "bg-purple-500/12 text-purple-600 dark:text-purple-400",
  Wellfound: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  Glassdoor: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
};

const TRENDING_SEARCHES = [
  "Senior Frontend Engineer Bengaluru",
  "React Developer Remote",
  "Staff Engineer India",
  "Next.js Engineer Remote",
  "UI Engineer Bengaluru",
];

const ROLE_SUGGESTIONS = [
  "Senior Frontend Engineer",
  "Staff Engineer",
  "Full Stack Engineer",
  "UI Engineer",
  "React Developer",
  "Lead Frontend Engineer",
  "SDE III",
];

function scoreTone(score: number): "good" | "info" | "warn" | "bad" {
  if (score >= 85) return "good";
  if (score >= 70) return "info";
  if (score >= 50) return "warn";
  return "bad";
}

function companyInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function avatarColor(name: string): string {
  const palette = [
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    "bg-red-500/15 text-red-600 dark:text-red-400",
    "bg-slate-500/15 text-slate-600 dark:text-slate-300",
    "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export function JobSearchModule() {
  const resumeRole = useResumeStore((s) => s.data.title);
  const resumeLocation = useResumeStore((s) => s.data.location);

  const [query, setQuery] = React.useState("");
  const [role, setRole] = React.useState(resumeRole);
  const [location, setLocation] = React.useState(
    resumeLocation.split(",")[0] || "Bengaluru"
  );
  const [activeSources, setActiveSources] = React.useState<Set<Source>>(
    new Set(SOURCES)
  );

  const { data, loading, error, run } = useAI<SearchResponse>();

  function toggleSource(s: Source) {
    setActiveSources((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  function doSearch(q?: string) {
    const finalQuery = (q ?? query).trim();
    if (!finalQuery) {
      toast.error("Enter a search query first");
      return;
    }
    run("/api/ai/job-search", {
      query: finalQuery,
      role: role || undefined,
      location: location || undefined,
    });
  }

  function applyTrending(text: string) {
    setQuery(text);
    doSearch(text);
  }

  const filteredResults = React.useMemo(() => {
    if (!data?.results) return [];
    return data.results.filter((r) => activeSources.has(r.source));
  }, [data, activeSources]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Search}
        title="Job Search"
        description="AI searches LinkedIn, Naukri, Indeed, Wellfound & Glassdoor"
      />

      {/* Search panel */}
      <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_auto]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs — title, skill, company…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                className="h-10 pl-8"
                autoFocus
              />
            </div>
            <div className="relative">
              <Briefcase className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                list="role-suggestions"
                placeholder="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 pl-8"
              />
              <datalist id="role-suggestions">
                {ROLE_SUGGESTIONS.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 pl-8"
              />
            </div>
            <AIButton
              onClick={() => doSearch()}
              loading={loading}
              className="h-10 px-5"
            >
              {loading ? "Searching…" : "Search"}
            </AIButton>
          </div>

          {/* Source filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Filter className="size-3" /> Sources:
            </span>
            {SOURCES.map((s) => {
              const active = activeSources.has(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSource(s)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all",
                    active
                      ? cn("border-transparent", SOURCE_STYLES[s])
                      : "border-border bg-muted/40 text-muted-foreground opacity-60 hover:opacity-100"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      active ? "bg-current" : "bg-muted-foreground/50"
                    )}
                  />
                  {s}
                </button>
              );
            })}
            {activeSources.size !== SOURCES.length && (
              <button
                onClick={() => setActiveSources(new Set(SOURCES))}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" /> Reset
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-destructive">
            <X className="size-4 shrink-0" />
            <span>Search failed: {error}</span>
          </CardContent>
        </Card>
      )}

      {/* Body */}
      {!data && !loading && !error && (
        <div className="space-y-6">
          <AIEmptyState
            icon={Search}
            title="Find your next role"
            description="Enter a query above to let AI aggregate fresh listings across 5 major job boards — with match scores tuned to your resume."
          />
          <Card>
            <CardContent className="p-5">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <TrendingUp className="size-4 text-primary" /> Trending searches
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((t) => (
                  <button
                    key={t}
                    onClick={() => applyTrending(t)}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-50"
                  >
                    <Sparkles className="size-3 text-primary" />
                    {t}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="size-12 shrink-0 animate-pulse rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                    <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
                  </div>
                </div>
                <div className="hidden h-9 w-24 animate-pulse rounded-md bg-muted sm:block" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-5">
          {/* Stat strip */}
          <Card className="border-primary/20">
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-lg bg-primary/12 text-primary">
                    <Briefcase className="size-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold leading-none">
                      {data.totalFound}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      jobs found
                    </p>
                  </div>
                </div>
                <div className="hidden h-10 w-px bg-border sm:block" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <TrendingUp className="size-3" /> Market insight
                  </p>
                  <p className="mt-0.5 text-sm">{data.marketInsight}</p>
                </div>
              </div>
              {data.topHiringCompanies.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Building2 className="size-3" /> Top hiring:
                  </span>
                  {data.topHiringCompanies.map((c) => (
                    <Badge
                      key={c}
                      variant="outline"
                      className="gap-1 font-normal"
                    >
                      <span className="size-1.5 rounded-full bg-primary" />
                      {c}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Result count + filtered note */}
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filteredResults.length}
              </span>{" "}
              of {data.results.length} results
              {activeSources.size !== SOURCES.length && (
                <span className="text-muted-foreground">
                  {" "}
                  · filtered by {activeSources.size} sources
                </span>
              )}
            </p>
          </div>

          {/* Job list */}
          {filteredResults.length === 0 ? (
            <AIEmptyState
              icon={Filter}
              title="No matches for active filters"
              description="Toggle more sources on to see additional listings."
            />
          ) : (
            <div className="space-y-3">
              {filteredResults.map((job, i) => (
                <JobResultCard key={`${job.company}-${i}`} job={job} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JobResultCard({ job }: { job: JobResult }) {
  return (
    <Card className="group transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
        <div
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-xl text-base font-bold",
            avatarColor(job.company)
          )}
        >
          {companyInitial(job.company)}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold leading-tight">
                {job.title}
              </h3>
              <p className="truncate text-sm font-medium text-foreground/80">
                {job.company}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone={scoreTone(job.matchScore)}>
                {job.matchScore}% match
              </Pill>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="size-3" />
              {job.experience}
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="size-3" />
              {job.salary}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {job.posted}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                SOURCE_STYLES[job.source]
              )}
            >
              {job.source}
            </span>
            {job.remote && <Pill tone="good">Remote</Pill>}
            {job.tags.slice(0, 4).map((t) => (
              <Badge
                key={t}
                variant="outline"
                className="font-normal text-muted-foreground"
              >
                {t}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 gap-2 sm:flex-col">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() =>
              toast.success(`Redirecting to ${job.source}…`, {
                description: `${job.title} · ${job.company}`,
              })
            }
          >
            <ExternalLink className="size-3.5" /> Apply
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              toast.success("Added to tracker", {
                description: `${job.title} · ${job.company}`,
              })
            }
          >
            <Bookmark className="size-3.5" /> Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
