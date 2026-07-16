"use client";

import * as React from "react";
import {
  Users,
  Search,
  Sparkles,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Building2,
  Clock,
  Calendar,
  ArrowRight,
  Plus,
  UserPlus,
  CheckCircle2,
  Star,
  ClipboardList,
  KanbanSquare,
  TrendingUp,
  X,
  LayoutGrid,
  ListChecks,
  Award,
  ThumbsUp,
  AlertTriangle,
  Target,
  RotateCcw,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  ModuleHeader,
  AIButton,
  Pill,
  ScoreRing,
  AIEmptyState,
} from "@/components/shared/blocks";
import { useAI } from "@/components/shared/utils";
import { cn } from "@/lib/utils";

// ---------------- Types ----------------

interface Candidate {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experienceYears: number;
  currentCompany: string;
  summary: string;
  avatarColor: string;
}

type StageId =
  | "sourced"
  | "screened"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

interface PipelineEntry {
  id: string;
  candidateId: string;
  role: string;
  stage: StageId;
  matchScore?: number;
}

interface EvaluationScores {
  technical: number;
  communication: number;
  cultureFit: number;
  problemSolving: number;
}

interface Evaluation {
  id: string;
  candidateId: string;
  candidateName: string;
  role: string;
  interviewer: string;
  date: string;
  overallRating: number;
  scores: EvaluationScores;
  notes: string;
}

interface Ranking {
  candidateId: string;
  matchScore: number;
  grade: string;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  concerns: string[];
  recommendation: string;
}

// ---------------- Seed data ----------------

const CANDIDATES: Candidate[] = [
  {
    id: "c1",
    name: "Aarav Mehta",
    title: "Senior Frontend Engineer",
    email: "aarav.mehta@gmail.com",
    phone: "+91 98200 11223",
    location: "Bengaluru, IN",
    skills: ["React", "TypeScript", "Next.js", "Redux", "GraphQL", "TailwindCSS", "Jest"],
    experienceYears: 7,
    currentCompany: "Razorpay",
    summary:
      "Frontend specialist with 7 years building production React apps. Led the redesign of Razorpay's merchant dashboard, cutting TTI by 38%. Strong on accessibility, design systems, and performance budgets.",
    avatarColor: "#10b981",
  },
  {
    id: "c2",
    name: "Diya Sharma",
    title: "Backend Engineer",
    email: "diya.sharma@gmail.com",
    phone: "+91 90040 55667",
    location: "Hyderabad, IN",
    skills: ["Node.js", "Express", "MongoDB", "AWS", "Docker", "Redis", "REST"],
    experienceYears: 5,
    currentCompany: "Swiggy",
    summary:
      "Backend engineer focused on Node.js microservices at scale. Built order-routing service handling 12k RPS during peak. Comfortable with AWS, Redis caching, and event-driven architectures.",
    avatarColor: "#a855f7",
  },
  {
    id: "c3",
    name: "Vivaan Iyer",
    title: "Full-stack Engineer",
    email: "vivaan.iyer@gmail.com",
    phone: "+91 99300 88990",
    location: "Pune, IN",
    skills: ["React", "Node.js", "PostgreSQL", "GraphQL", "AWS", "TypeScript"],
    experienceYears: 6,
    currentCompany: "Zomato",
    summary:
      "Full-stack generalist comfortable across the stack. Shipped a multi-tenant analytics product end-to-end. Strong on Postgres perf tuning and React architecture.",
    avatarColor: "#14b8a6",
  },
  {
    id: "c4",
    name: "Ananya Reddy",
    title: "Data Scientist",
    email: "ananya.reddy@gmail.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, IN",
    skills: ["Python", "TensorFlow", "PyTorch", "NLP", "Pandas", "SQL", "scikit-learn"],
    experienceYears: 4,
    currentCompany: "Flipkart",
    summary:
      "ML engineer with NLP focus. Shipped a product-recommendation model lifting CTR by 14%. Solid foundation in classical ML, deep learning, and production model serving.",
    avatarColor: "#f43f5e",
  },
  {
    id: "c5",
    name: "Arjun Nair",
    title: "DevOps Engineer",
    email: "arjun.nair@gmail.com",
    phone: "+91 90909 11122",
    location: "Chennai, IN",
    skills: ["Kubernetes", "AWS", "Terraform", "Docker", "Jenkins", "Linux", "Prometheus"],
    experienceYears: 8,
    currentCompany: "Freshworks",
    summary:
      "DevOps/SRE with deep Kubernetes experience. Migrated 40+ services to EKS, cut infra spend 22%. Strong on IaC, observability, and platform engineering.",
    avatarColor: "#f59e0b",
  },
  {
    id: "c6",
    name: "Ishita Gupta",
    title: "Product Manager",
    email: "ishita.gupta@gmail.com",
    phone: "+91 98111 22334",
    location: "Gurugram, IN",
    skills: ["Roadmapping", "SQL", "Mixpanel", "Figma", "Jira", "A/B Testing"],
    experienceYears: 9,
    currentCompany: "Paytm",
    summary:
      "Senior PM with 0→1 and scale experience. Led Paytm mini-apps growth from 0 to 8M MAU. Data-driven, strong stakeholder management, technical enough to spec APIs.",
    avatarColor: "#d946ef",
  },
  {
    id: "c7",
    name: "Kabir Singh",
    title: "Frontend Developer",
    email: "kabir.singh@gmail.com",
    phone: "+91 99876 54321",
    location: "Mumbai, IN",
    skills: ["React", "JavaScript", "HTML", "CSS", "TailwindCSS", "Figma"],
    experienceYears: 3,
    currentCompany: "CRED",
    summary:
      "Frontend dev with a sharp eye for design. Shipped CRED reward-store redesign. Strong on motion, micro-interactions, and pixel-perfect implementation.",
    avatarColor: "#06b6d4",
  },
  {
    id: "c8",
    name: "Meera Krishnan",
    title: "Senior Backend Engineer",
    email: "meera.krishnan@gmail.com",
    phone: "+91 91234 56780",
    location: "Bengaluru, IN",
    skills: ["Java", "Spring", "Kafka", "PostgreSQL", "AWS", "Microservices", "Redis"],
    experienceYears: 11,
    currentCompany: "PhonePe",
    summary:
      "Distributed systems engineer with 11 years. Designed PhonePe's ledger service handling 50k TPS. Deep expertise in Kafka, idempotency, and exactly-once semantics.",
    avatarColor: "#f97316",
  },
  {
    id: "c9",
    name: "Rohan Verma",
    title: "Full-stack Engineer",
    email: "rohan.verma@gmail.com",
    phone: "+91 90123 45678",
    location: "Hyderabad, IN",
    skills: ["Python", "Django", "React", "PostgreSQL", "Docker", "AWS"],
    experienceYears: 4,
    currentCompany: "Zerodha",
    summary:
      "Full-stack engineer from a Python/Django background. Built Zerodha's tax-pnl calculator used by 2M users. Solid on React, async workers, and SQL.",
    avatarColor: "#22c55e",
  },
  {
    id: "c10",
    name: "Sara Khan",
    title: "Data Engineer",
    email: "sara.khan@gmail.com",
    phone: "+91 98888 77766",
    location: "Pune, IN",
    skills: ["Python", "Spark", "Airflow", "AWS", "Snowflake", "SQL", "dbt"],
    experienceYears: 6,
    currentCompany: "Myntra",
    summary:
      "Data engineer specializing in batch + streaming pipelines. Migrated Myntra's reporting stack to Snowflake + dbt, cutting dashboard latency 4×.",
    avatarColor: "#ec4899",
  },
  {
    id: "c11",
    name: "Aryan Deshpande",
    title: "Site Reliability Engineer",
    email: "aryan.d@gmail.com",
    phone: "+91 99777 88899",
    location: "Bengaluru, IN",
    skills: ["Go", "Kubernetes", "Prometheus", "Grafana", "AWS", "Linux", "Terraform"],
    experienceYears: 7,
    currentCompany: "Udaan",
    summary:
      "SRE writing Go for platform tooling. Built Udaan's multi-cluster canary system. Strong on SLOs, error budgets, and incident response.",
    avatarColor: "#84cc16",
  },
  {
    id: "c12",
    name: "Tara Joshi",
    title: "Technical Product Manager",
    email: "tara.joshi@gmail.com",
    phone: "+91 98330 12345",
    location: "Mumbai, IN",
    skills: ["Roadmapping", "SQL", "APIs", "Figma", "A/B Testing", "React"],
    experienceYears: 5,
    currentCompany: "BookMyShow",
    summary:
      "Technical PM with an engineering background. Shipped BookMyShow's queue + seat-hold system. Comfortable writing SQL and reviewing API specs.",
    avatarColor: "#eab308",
  },
];

const SKILL_FILTERS = [
  "React",
  "TypeScript",
  "Python",
  "AWS",
  "Node.js",
  "GraphQL",
  "Kubernetes",
  "PostgreSQL",
];

const OPEN_ROLES = [
  "Senior Frontend Engineer",
  "Backend Engineer",
  "Data Scientist",
];

const SAMPLE_JD = `Senior Frontend Engineer — Commerce Platform

We're hiring a Senior Frontend Engineer to lead our React-based commerce web platform. You'll own complex features end-to-end and raise the bar on performance and accessibility.

Must-have:
• 5+ years building production React applications
• Strong TypeScript and modern JavaScript (ES2020+)
• Next.js or similar SSR frameworks
• State management (Redux, Zustand, or React Query)
• Component design systems & accessibility (WCAG AA)
• Testing with Jest / React Testing Library

Nice-to-have:
• GraphQL and Apollo
• TailwindCSS
• Performance optimization & Core Web Vitals
• AWS exposure

You'll partner with design, backend, and PM to ship customer-facing features used by millions.`;

const INITIAL_PIPELINE: PipelineEntry[] = [
  { id: "p1", candidateId: "c1", role: "Senior Frontend Engineer", stage: "offer", matchScore: 92 },
  { id: "p2", candidateId: "c3", role: "Full-stack Engineer", stage: "interview", matchScore: 88 },
  { id: "p3", candidateId: "c4", role: "Data Scientist", stage: "interview", matchScore: 84 },
  { id: "p4", candidateId: "c6", role: "Product Manager", stage: "screened", matchScore: 81 },
  { id: "p5", candidateId: "c5", role: "DevOps Engineer", stage: "screened", matchScore: 79 },
  { id: "p6", candidateId: "c10", role: "Data Engineer", stage: "sourced", matchScore: 76 },
  { id: "p7", candidateId: "c7", role: "Frontend Developer", stage: "sourced", matchScore: 72 },
  { id: "p8", candidateId: "c2", role: "Backend Engineer", stage: "rejected", matchScore: 58 },
];

const INITIAL_EVALUATIONS: Evaluation[] = [
  {
    id: "e1",
    candidateId: "c1",
    candidateName: "Aarav Mehta",
    role: "Senior Frontend Engineer",
    interviewer: "Priya Menon",
    date: "2024-03-15",
    overallRating: 5,
    scores: { technical: 5, communication: 4, cultureFit: 5, problemSolving: 5 },
    notes:
      "Outstanding system-design round. Walked us through a clean component architecture for the checkout flow. Strong on accessibility and perf. Hire.",
  },
  {
    id: "e2",
    candidateId: "c4",
    candidateName: "Ananya Reddy",
    role: "Data Scientist",
    interviewer: "Rahul Bose",
    date: "2024-03-12",
    overallRating: 4,
    scores: { technical: 4, communication: 4, cultureFit: 4, problemSolving: 5 },
    notes:
      "Strong ML fundamentals and crisp problem-solving. Slightly light on production model-serving, but eager to learn. Move to final round.",
  },
  {
    id: "e3",
    candidateId: "c3",
    candidateName: "Vivaan Iyer",
    role: "Full-stack Engineer",
    interviewer: "Priya Menon",
    date: "2024-03-10",
    overallRating: 4,
    scores: { technical: 4, communication: 5, cultureFit: 4, problemSolving: 4 },
    notes:
      "Great communication and pragmatic trade-off thinking. Solid React + Postgres depth. Would pair well with the platform team.",
  },
  {
    id: "e4",
    candidateId: "c8",
    candidateName: "Meera Krishnan",
    role: "Senior Backend Engineer",
    interviewer: "Karan Shah",
    date: "2024-03-08",
    overallRating: 5,
    scores: { technical: 5, communication: 4, cultureFit: 5, problemSolving: 5 },
    notes:
      "Deep distributed-systems expertise. Walked through idempotency and exactly-once semantics with clarity. Strong hire for the ledger team.",
  },
];

const STAGES: {
  id: StageId;
  label: string;
  accent: string;
  dot: string;
  bar: string;
  headerBg: string;
}[] = [
  {
    id: "sourced",
    label: "Sourced",
    accent: "text-slate-600 dark:text-slate-300",
    dot: "bg-slate-400",
    bar: "bg-slate-400",
    headerBg: "bg-slate-500/10",
  },
  {
    id: "screened",
    label: "Screened",
    accent: "text-cyan-600 dark:text-cyan-400",
    dot: "bg-cyan-500",
    bar: "bg-cyan-500",
    headerBg: "bg-cyan-500/10",
  },
  {
    id: "interview",
    label: "Interview",
    accent: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    headerBg: "bg-amber-500/10",
  },
  {
    id: "offer",
    label: "Offer",
    accent: "text-purple-600 dark:text-purple-400",
    dot: "bg-purple-500",
    bar: "bg-purple-500",
    headerBg: "bg-purple-500/10",
  },
  {
    id: "hired",
    label: "Hired",
    accent: "text-primary",
    dot: "bg-primary",
    bar: "bg-primary",
    headerBg: "bg-primary/10",
  },
  {
    id: "rejected",
    label: "Rejected",
    accent: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    bar: "bg-red-500",
    headerBg: "bg-red-500/10",
  },
];

const STAGE_ORDER: StageId[] = [
  "sourced",
  "screened",
  "interview",
  "offer",
  "hired",
];

// ---------------- Helpers ----------------

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function scoreTone(score: number): "good" | "info" | "warn" | "bad" {
  if (score >= 80) return "good";
  if (score >= 60) return "info";
  if (score >= 40) return "warn";
  return "bad";
}

function recommendationTone(rec: string): "good" | "info" | "warn" | "bad" {
  const r = rec.toLowerCase();
  if (r.includes("strong")) return "good";
  if (r === "yes") return "good";
  if (r === "maybe") return "warn";
  return "bad";
}

function gradeTone(grade: string): "good" | "info" | "warn" | "bad" {
  const g = grade.toLowerCase();
  if (g.includes("excellent")) return "good";
  if (g === "good") return "info";
  if (g === "fair") return "warn";
  return "bad";
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={cn(
            n <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
}

function Avatar({
  name,
  color,
  size = 40,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white shadow-sm"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  );
}

// ---------------- Stat card ----------------

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: "default" | "primary" | "amber" | "purple";
}) {
  const toneCls =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "amber"
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : tone === "purple"
          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
          : "bg-muted text-muted-foreground";
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn("grid size-11 shrink-0 place-items-center rounded-xl", toneCls)}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold leading-tight">{value}</p>
          {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------- Candidate card ----------------

function CandidateCard({
  candidate,
  ranking,
  onAddToPipeline,
  onView,
  inPipeline,
}: {
  candidate: Candidate;
  ranking?: Ranking;
  onAddToPipeline: () => void;
  onView: () => void;
  inPipeline: boolean;
}) {
  return (
    <Card className="group relative flex flex-col overflow-hidden transition hover:border-primary/40 hover:shadow-md">
      {ranking && (
        <div
          className={cn(
            "absolute right-0 top-0 flex items-center gap-1.5 rounded-bl-xl px-2.5 py-1 text-xs font-bold",
            ranking.matchScore >= 80
              ? "bg-primary/15 text-primary"
              : ranking.matchScore >= 60
                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                : ranking.matchScore >= 40
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-red-500/15 text-red-600 dark:text-red-400"
          )}
        >
          <Target className="size-3" />
          {ranking.matchScore}%
        </div>
      )}
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <Avatar name={candidate.name} color={candidate.avatarColor} size={44} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold leading-tight">{candidate.name}</h3>
            <p className="truncate text-sm text-muted-foreground">{candidate.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Briefcase className="size-3" /> {candidate.experienceYears}y
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" /> {candidate.location}
              </span>
            </div>
          </div>
        </div>

        {ranking && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill tone={recommendationTone(ranking.recommendation)}>
              <ThumbsUp className="mr-1 size-3" />
              {ranking.recommendation}
            </Pill>
            <Pill tone={gradeTone(ranking.grade)}>{ranking.grade}</Pill>
          </div>
        )}

        <p className="line-clamp-2 text-sm text-muted-foreground">{candidate.summary}</p>

        <div className="flex flex-wrap gap-1.5">
          {candidate.skills.slice(0, 5).map((s) => (
            <Badge key={s} variant="secondary" className="bg-muted text-xs font-normal">
              {s}
            </Badge>
          ))}
          {candidate.skills.length > 5 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{candidate.skills.length - 5}
            </Badge>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={onView}
          >
            <Search className="size-3.5" /> View Profile
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={onAddToPipeline}
            disabled={inPipeline}
          >
            {inPipeline ? (
              <>
                <CheckCircle2 className="size-3.5" /> In Pipeline
              </>
            ) : (
              <>
                <UserPlus className="size-3.5" /> Add
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------- Mini evaluation form (inside profile dialog) ----------------

function ScoreSliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        <span className="text-xs font-bold tabular-nums text-primary">{value}/5</span>
      </div>
      <Slider
        value={[value]}
        min={1}
        max={5}
        step={1}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}

function MiniEvaluationForm({
  candidate,
  onSubmit,
}: {
  candidate: Candidate;
  onSubmit: (e: Omit<Evaluation, "id" | "date">) => void;
}) {
  const [technical, setTechnical] = React.useState(3);
  const [communication, setCommunication] = React.useState(3);
  const [cultureFit, setCultureFit] = React.useState(3);
  const [problemSolving, setProblemSolving] = React.useState(3);
  const [interviewer, setInterviewer] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const overall = Math.round(
    (technical + communication + cultureFit + problemSolving) / 4
  );

  function handleSubmit() {
    if (!interviewer.trim()) {
      toast.error("Please enter the interviewer's name");
      return;
    }
    onSubmit({
      candidateId: candidate.id,
      candidateName: candidate.name,
      role: candidate.title,
      interviewer: interviewer.trim(),
      overallRating: overall,
      scores: { technical, communication, cultureFit, problemSolving },
      notes: notes.trim(),
    });
    setTechnical(3);
    setCommunication(3);
    setCultureFit(3);
    setProblemSolving(3);
    setInterviewer("");
    setNotes("");
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <ClipboardList className="size-4 text-primary" /> Add Evaluation
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Overall</span>
          <Stars value={overall} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ScoreSliderRow label="Technical" value={technical} onChange={setTechnical} />
        <ScoreSliderRow
          label="Communication"
          value={communication}
          onChange={setCommunication}
        />
        <ScoreSliderRow
          label="Culture Fit"
          value={cultureFit}
          onChange={setCultureFit}
        />
        <ScoreSliderRow
          label="Problem Solving"
          value={problemSolving}
          onChange={setProblemSolving}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Interviewer</Label>
        <Input
          placeholder="e.g. Priya Menon"
          value={interviewer}
          onChange={(e) => setInterviewer(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Notes</Label>
        <Textarea
          rows={3}
          placeholder="Strengths, concerns, hire / no-hire rationale…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <Button size="sm" className="w-full gap-1.5" onClick={handleSubmit}>
        <Plus className="size-3.5" /> Submit Evaluation
      </Button>
    </div>
  );
}

// ---------------- Candidate profile dialog ----------------

function CandidateProfileDialog({
  candidate,
  ranking,
  onClose,
  onAddToPipeline,
  inPipeline,
  onSubmitEvaluation,
}: {
  candidate: Candidate | null;
  ranking?: Ranking;
  onClose: () => void;
  onAddToPipeline: () => void;
  inPipeline: boolean;
  onSubmitEvaluation: (e: Omit<Evaluation, "id" | "date">) => void;
}) {
  return (
    <Dialog open={!!candidate} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto scroll-thin">
        {candidate && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-4">
                <Avatar name={candidate.name} color={candidate.avatarColor} size={56} />
                <div className="min-w-0 flex-1">
                  <DialogTitle className="truncate">{candidate.name}</DialogTitle>
                  <DialogDescription className="truncate">
                    {candidate.title} · {candidate.experienceYears} years · {candidate.currentCompany}
                  </DialogDescription>
                </div>
                {ranking && (
                  <div className="flex flex-col items-center">
                    <ScoreRing value={ranking.matchScore} size={72} label="Match" />
                  </div>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Contact */}
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="truncate">{candidate.email}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="truncate">{candidate.phone}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="truncate">{candidate.location}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm">
                  <Building2 className="size-4 text-muted-foreground" />
                  <span className="truncate">{candidate.currentCompany}</span>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Summary
                </h4>
                <p className="text-sm leading-relaxed">{candidate.summary}</p>
              </div>

              {/* Skills */}
              <div>
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className={cn(
                        "text-xs font-normal",
                        ranking?.matchedSkills.includes(s)
                          ? "border-0 bg-primary/15 text-primary"
                          : "bg-muted"
                      )}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* AI ranking detail */}
              {ranking && (
                <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Pill tone={recommendationTone(ranking.recommendation)}>
                      <ThumbsUp className="mr-1 size-3" />
                      {ranking.recommendation}
                    </Pill>
                    <Pill tone={gradeTone(ranking.grade)}>{ranking.grade}</Pill>
                    {ranking.matchedSkills.length > 0 && (
                      <Pill tone="good">
                        {ranking.matchedSkills.length} matched
                      </Pill>
                    )}
                    {ranking.missingSkills.length > 0 && (
                      <Pill tone="warn">
                        {ranking.missingSkills.length} missing
                      </Pill>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-primary">
                        <Award className="size-3.5" /> Strengths
                      </p>
                      <ul className="space-y-1">
                        {ranking.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-primary" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="size-3.5" /> Concerns
                      </p>
                      <ul className="space-y-1">
                        {ranking.concerns.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-500" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {ranking.missingSkills.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Missing skills:</span>{" "}
                      {ranking.missingSkills.join(", ")}
                    </div>
                  )}
                </div>
              )}

              {/* Action: add to pipeline */}
              <Button
                variant={inPipeline ? "secondary" : "default"}
                className="w-full gap-1.5"
                onClick={onAddToPipeline}
                disabled={inPipeline}
              >
                {inPipeline ? (
                  <>
                    <CheckCircle2 className="size-4" /> Already in Pipeline
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4" /> Add to Pipeline (Sourced)
                  </>
                )}
              </Button>

              {/* Inline evaluation form */}
              <MiniEvaluationForm
                candidate={candidate}
                onSubmit={(e) => {
                  onSubmitEvaluation(e);
                  onClose();
                }}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Pipeline card ----------------

function PipelineCardView({
  entry,
  candidate,
  onAdvance,
  onReject,
  onClick,
}: {
  entry: PipelineEntry;
  candidate?: Candidate;
  onAdvance: () => void;
  onReject: () => void;
  onClick: () => void;
}) {
  const isRejected = entry.stage === "rejected";
  const isHired = entry.stage === "hired";
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className="group cursor-pointer rounded-xl border border-border/70 bg-card p-3 shadow-sm transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start gap-2.5">
        <Avatar
          name={candidate?.name ?? "?"}
          color={candidate?.avatarColor ?? "#64748b"}
          size={34}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">
            {candidate?.name ?? "Unknown"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {entry.role}
          </p>
        </div>
        {typeof entry.matchScore === "number" && (
          <Pill tone={scoreTone(entry.matchScore)}>{entry.matchScore}%</Pill>
        )}
      </div>
      {candidate && (
        <p className="mt-2 truncate text-[11px] text-muted-foreground">
          {candidate.title} · {candidate.experienceYears}y
        </p>
      )}
      <div className="mt-2 flex items-center gap-1.5">
        {!isHired && !isRejected && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 flex-1 gap-1 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onAdvance();
            }}
          >
            Advance <ArrowRight className="size-3" />
          </Button>
        )}
        {!isRejected && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 px-2 text-xs text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onReject();
            }}
            disabled={isHired}
          >
            <Ban className="size-3" /> Reject
          </Button>
        )}
        {isRejected && (
          <span className="flex w-full items-center justify-center gap-1 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
            <Ban className="size-3" /> Rejected
          </span>
        )}
        {isHired && (
          <span className="flex w-full items-center justify-center gap-1 py-0.5 text-xs font-medium text-primary">
            <CheckCircle2 className="size-3" /> Hired
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------- Pipeline detail dialog ----------------

function PipelineDetailDialog({
  entry,
  candidate,
  onClose,
  onAdvance,
  onReject,
}: {
  entry: PipelineEntry | null;
  candidate?: Candidate;
  onClose: () => void;
  onAdvance: () => void;
  onReject: () => void;
}) {
  if (!entry) return null;
  const isHired = entry.stage === "hired";
  const isRejected = entry.stage === "rejected";
  return (
    <Dialog open={!!entry} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar
              name={candidate?.name ?? "?"}
              color={candidate?.avatarColor ?? "#64748b"}
              size={52}
            />
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate">{candidate?.name ?? "Unknown"}</DialogTitle>
              <DialogDescription className="truncate">
                {entry.role}
              </DialogDescription>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Pill
                  tone={
                    isRejected
                      ? "bad"
                      : isHired
                        ? "good"
                        : "info"
                  }
                >
                  {STAGES.find((s) => s.id === entry.stage)?.label}
                </Pill>
                {typeof entry.matchScore === "number" && (
                  <Pill tone={scoreTone(entry.matchScore)}>{entry.matchScore}% match</Pill>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {candidate && (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-muted-foreground" />
                {candidate.title}
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" />
                {candidate.currentCompany}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                {candidate.experienceYears} years exp
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                {candidate.location}
              </div>
            </div>
            <p className="rounded-lg bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
              {candidate.summary}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs font-normal">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {!isRejected ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400"
              onClick={() => {
                onReject();
                onClose();
              }}
              disabled={isHired}
            >
              <Ban className="size-4" /> Move to Rejected
            </Button>
          ) : (
            <span />
          )}
          {!isHired && !isRejected && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                onAdvance();
                onClose();
              }}
            >
              Advance to{" "}
              {STAGES.find((s) => s.id === STAGE_ORDER[STAGE_ORDER.indexOf(entry.stage) + 1])
                ?.label}{" "}
              <ArrowRight className="size-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Evaluation card ----------------

function EvaluationCardView({ evaluation }: { evaluation: Evaluation }) {
  const scoreEntries = Object.entries(evaluation.scores) as [
    keyof EvaluationScores,
    number
  ][];
  return (
    <Card className="overflow-hidden transition hover:border-primary/30 hover:shadow-md">
      <CardHeader className="gap-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar
              name={evaluation.candidateName}
              color={CANDIDATES.find((c) => c.id === evaluation.candidateId)?.avatarColor ?? "#10b981"}
              size={40}
            />
            <div>
              <CardTitle className="text-base leading-tight">
                {evaluation.candidateName}
              </CardTitle>
              <CardDescription className="text-xs">
                {evaluation.role}
              </CardDescription>
            </div>
          </div>
          <Stars value={evaluation.overallRating} size={14} />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" /> {evaluation.interviewer}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3" /> {evaluation.date}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {scoreEntries.map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5"
            >
              <span className="text-xs capitalize text-muted-foreground">
                {k.replace(/([A-Z])/g, " $1")}
              </span>
              <span className="text-xs font-bold tabular-nums">{v}/5</span>
            </div>
          ))}
        </div>
        {evaluation.notes && (
          <p className="rounded-lg bg-muted/30 p-2.5 text-xs leading-relaxed text-muted-foreground">
            {evaluation.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------- New evaluation dialog ----------------

function NewEvaluationDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (e: Omit<Evaluation, "id">) => void;
}) {
  const [candidateId, setCandidateId] = React.useState<string>("");
  const [role, setRole] = React.useState("");
  const [interviewer, setInterviewer] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [technical, setTechnical] = React.useState(3);
  const [communication, setCommunication] = React.useState(3);
  const [cultureFit, setCultureFit] = React.useState(3);
  const [problemSolving, setProblemSolving] = React.useState(3);
  const [notes, setNotes] = React.useState("");

  const selected = CANDIDATES.find((c) => c.id === candidateId);
  const overall = Math.round(
    (technical + communication + cultureFit + problemSolving) / 4
  );

  function reset() {
    setCandidateId("");
    setRole("");
    setInterviewer("");
    setDate(new Date().toISOString().slice(0, 10));
    setTechnical(3);
    setCommunication(3);
    setCultureFit(3);
    setProblemSolving(3);
    setNotes("");
  }

  function handleSubmit() {
    if (!candidateId || !selected) {
      toast.error("Please select a candidate");
      return;
    }
    if (!role.trim()) {
      toast.error("Please enter the role");
      return;
    }
    if (!interviewer.trim()) {
      toast.error("Please enter the interviewer's name");
      return;
    }
    onSubmit({
      candidateId,
      candidateName: selected.name,
      role: role.trim(),
      interviewer: interviewer.trim(),
      date,
      overallRating: overall,
      scores: { technical, communication, cultureFit, problemSolving },
      notes: notes.trim(),
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto scroll-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="size-5 text-primary" /> New Evaluation
          </DialogTitle>
          <DialogDescription>
            Record structured interview feedback for a candidate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Candidate</Label>
              <Select
                value={candidateId}
                onValueChange={(v) => {
                  setCandidateId(v);
                  const c = CANDIDATES.find((x) => x.id === v);
                  if (c && !role) setRole(c.title);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent>
                  {CANDIDATES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} — {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Role</Label>
              <Input
                placeholder="e.g. Senior Frontend Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Interviewer</Label>
              <Input
                placeholder="e.g. Priya Menon"
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/[0.04] p-3">
            <span className="text-sm font-medium">Overall rating</span>
            <div className="flex items-center gap-2">
              <Stars value={overall} size={16} />
              <span className="text-sm font-bold tabular-nums text-primary">{overall}/5</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ScoreSliderRow label="Technical" value={technical} onChange={setTechnical} />
            <ScoreSliderRow
              label="Communication"
              value={communication}
              onChange={setCommunication}
            />
            <ScoreSliderRow
              label="Culture Fit"
              value={cultureFit}
              onChange={setCultureFit}
            />
            <ScoreSliderRow
              label="Problem Solving"
              value={problemSolving}
              onChange={setProblemSolving}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Notes</Label>
            <Textarea
              rows={4}
              placeholder="Strengths, concerns, hire / no-hire rationale…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="gap-1.5" onClick={handleSubmit}>
            <Plus className="size-4" /> Add Evaluation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Main module ----------------

export function RecruiterModule() {
  const [tab, setTab] = React.useState("candidates");

  // Candidates tab state
  const [search, setSearch] = React.useState("");
  const [skillFilter, setSkillFilter] = React.useState<string[]>([]);
  const [jd, setJd] = React.useState(SAMPLE_JD);
  const [rankings, setRankings] = React.useState<Record<string, Ranking>>({});
  const [profileCandidateId, setProfileCandidateId] = React.useState<string | null>(null);

  // Pipeline tab state
  const [pipeline, setPipeline] = React.useState<PipelineEntry[]>(INITIAL_PIPELINE);
  const [pipelineSearch, setPipelineSearch] = React.useState("");
  const [pipelineDetailId, setPipelineDetailId] = React.useState<string | null>(null);

  // Evaluations tab state
  const [evaluations, setEvaluations] = React.useState<Evaluation[]>(INITIAL_EVALUATIONS);
  const [newEvalOpen, setNewEvalOpen] = React.useState(false);

  const { loading: rankingLoading, error: rankingError, run: runRank } = useAI<{
    rankings: Ranking[];
  }>();

  // ----- Derived: filtered candidates -----
  const filteredCandidates = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return CANDIDATES.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q));
      const matchesSkills =
        skillFilter.length === 0 ||
        skillFilter.every((s) => c.skills.includes(s));
      return matchesQuery && matchesSkills;
    });
  }, [search, skillFilter]);

  // ----- Derived: ranked + sorted candidates -----
  const rankedSortedCandidates = React.useMemo(() => {
    const list = [...filteredCandidates];
    const hasRankings = Object.keys(rankings).length > 0;
    if (hasRankings) {
      list.sort((a, b) => {
        const ra = rankings[a.id]?.matchScore ?? -1;
        const rb = rankings[b.id]?.matchScore ?? -1;
        return rb - ra;
      });
    }
    return list;
  }, [filteredCandidates, rankings]);

  // ----- Derived: stats -----
  const rankedCount = Object.keys(rankings).length;
  const avgMatch =
    rankedCount > 0
      ? Math.round(
          Object.values(rankings).reduce((s, r) => s + r.matchScore, 0) /
            rankedCount
        )
      : 78;
  const shortlisted =
    rankedCount > 0
      ? Object.values(rankings).filter(
          (r) =>
            r.matchScore >= 70 ||
            ["strong yes", "yes"].includes(r.recommendation.toLowerCase())
        ).length
      : pipeline.filter((p) => ["interview", "offer"].includes(p.stage)).length;

  // ----- Helpers -----
  const candidateById = React.useCallback(
    (id: string) => CANDIDATES.find((c) => c.id === id),
    []
  );

  function toggleSkill(skill: string) {
    setSkillFilter((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  // ----- Handlers: ranking -----
  async function handleRank() {
    if (!jd.trim()) {
      toast.error("Paste a job description to rank against");
      return;
    }
    if (filteredCandidates.length === 0) {
      toast.error("No candidates match the current filters");
      return;
    }
    const result = await runRank("/api/ai/candidate-rank", {
      jd,
      candidates: filteredCandidates.map((c) => ({
        id: c.id,
        name: c.name,
        title: c.title,
        skills: c.skills,
        experienceYears: c.experienceYears,
        summary: c.summary,
      })),
    });
    if (result?.rankings) {
      const map: Record<string, Ranking> = {};
      result.rankings.forEach((r) => {
        map[r.candidateId] = r;
      });
      setRankings(map);
      toast.success(`Ranked ${result.rankings.length} candidates against JD`);
    }
  }

  function clearRankings() {
    setRankings({});
    toast.info("Rankings cleared");
  }

  // ----- Handlers: pipeline -----
  function addToPipeline(candidate: Candidate) {
    if (pipeline.some((p) => p.candidateId === candidate.id)) {
      toast.error(`${candidate.name} is already in the pipeline`);
      return;
    }
    const entry: PipelineEntry = {
      id: `p${Date.now()}`,
      candidateId: candidate.id,
      role: candidate.title,
      stage: "sourced",
      matchScore: rankings[candidate.id]?.matchScore,
    };
    setPipeline((prev) => [entry, ...prev]);
    toast.success(`${candidate.name} added to Pipeline (Sourced)`);
  }

  function advanceStage(entryId: string) {
    setPipeline((prev) =>
      prev.map((p) => {
        if (p.id !== entryId) return p;
        const idx = STAGE_ORDER.indexOf(p.stage);
        if (idx === -1 || idx >= STAGE_ORDER.length - 1) return p;
        const next = STAGE_ORDER[idx + 1];
        const candidate = candidateById(p.candidateId);
        toast.success(
          `${candidate?.name ?? "Candidate"} moved to ${
            STAGES.find((s) => s.id === next)?.label
          }`
        );
        return { ...p, stage: next };
      })
    );
  }

  function rejectEntry(entryId: string) {
    setPipeline((prev) =>
      prev.map((p) => {
        if (p.id !== entryId) return p;
        const candidate = candidateById(p.candidateId);
        toast.success(`${candidate?.name ?? "Candidate"} moved to Rejected`);
        return { ...p, stage: "rejected" };
      })
    );
  }

  // ----- Handlers: evaluations -----
  function addEvaluation(e: Omit<Evaluation, "id">) {
    const newEval: Evaluation = { ...e, id: `e${Date.now()}` };
    setEvaluations((prev) => [newEval, ...prev]);
    toast.success(`Evaluation recorded for ${e.candidateName}`);
  }

  function addInlineEvaluation(candidate: Candidate, e: Omit<Evaluation, "id" | "date">) {
    addEvaluation({ ...e, date: new Date().toISOString().slice(0, 10) });
  }

  // ----- Pipeline derived -----
  const pipelineDetailEntry = pipelineDetailId
    ? pipeline.find((p) => p.id === pipelineDetailId) ?? null
    : null;
  const pipelineDetailCandidate = pipelineDetailEntry
    ? candidateById(pipelineDetailEntry.candidateId)
    : undefined;

  const profileCandidate = profileCandidateId
    ? candidateById(profileCandidateId) ?? null
    : null;

  const filteredPipeline = React.useMemo(() => {
    const q = pipelineSearch.trim().toLowerCase();
    if (!q) return pipeline;
    return pipeline.filter((p) => {
      const c = candidateById(p.candidateId);
      return (
        c?.name.toLowerCase().includes(q) ||
        c?.title.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q)
      );
    });
  }, [pipeline, pipelineSearch, candidateById]);

  function stageEntries(stage: StageId) {
    return filteredPipeline.filter((p) => p.stage === stage);
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Users}
        title="Recruiter Platform"
        description="Source, AI-rank & track candidates through your hiring pipeline"
      >
        <Badge className="gap-1 border-0 bg-primary/15 text-primary">
          <Sparkles className="size-3" /> Pro
        </Badge>
      </ModuleHeader>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full justify-start sm:w-auto">
          <TabsTrigger value="candidates" className="gap-1.5">
            <Search className="size-4" /> Candidates
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-1.5">
            <KanbanSquare className="size-4" /> Pipeline
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="gap-1.5">
            <ClipboardList className="size-4" /> Evaluations
          </TabsTrigger>
        </TabsList>

        {/* ============ TAB 1: CANDIDATES ============ */}
        <TabsContent value="candidates" className="space-y-5">
          {/* Stat strip */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={Users}
              label="Total Candidates"
              value={CANDIDATES.length}
              sub="In talent pool"
              tone="primary"
            />
            <StatCard
              icon={ThumbsUp}
              label="Shortlisted"
              value={shortlisted}
              sub={rankedCount > 0 ? `${rankedCount} ranked` : "By pipeline stage"}
              tone="purple"
            />
            <StatCard
              icon={TrendingUp}
              label="Avg Match"
              value={`${avgMatch}%`}
              sub={rankedCount > 0 ? "Across ranked" : "Default benchmark"}
              tone="amber"
            />
            <StatCard
              icon={Briefcase}
              label="Open Roles"
              value={OPEN_ROLES.length}
              sub={OPEN_ROLES.join(" · ")}
            />
          </div>

          {/* Search + skill chips */}
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, title or skill…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {skillFilter.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground"
                    onClick={() => setSkillFilter([])}
                  >
                    <X className="size-3.5" /> Clear filters ({skillFilter.length})
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Skills:
                </span>
                {SKILL_FILTERS.map((s) => {
                  const active = skillFilter.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSkill(s)}
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs font-medium transition",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* JD → AI Rank */}
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.06] via-transparent to-purple-500/[0.05]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" /> Paste JD to Rank
              </CardTitle>
              <CardDescription className="text-xs">
                AI ranks the {filteredCandidates.length} filtered candidates against this
                job description — sorted by match score.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={6}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste a job description here…"
                className="resize-y bg-background/60"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill tone="info">{filteredCandidates.length} candidates</Pill>
                  {rankedCount > 0 && <Pill tone="good">{rankedCount} ranked</Pill>}
                  {rankingError && <Pill tone="bad">{rankingError}</Pill>}
                </div>
                <div className="flex items-center gap-2">
                  {rankedCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground"
                      onClick={clearRankings}
                      disabled={rankingLoading}
                    >
                      <RotateCcw className="size-3.5" /> Reset
                    </Button>
                  )}
                  <AIButton
                    onClick={handleRank}
                    loading={rankingLoading}
                    disabled={filteredCandidates.length === 0}
                  >
                    {rankedCount > 0 ? "Re-rank Candidates" : "AI Rank Candidates"}
                  </AIButton>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidate grid */}
          {rankedSortedCandidates.length === 0 ? (
            <AIEmptyState
              icon={Search}
              title="No candidates match"
              description="Adjust your search query or skill filters to see candidates."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rankedSortedCandidates.map((c) => {
                const inPipeline = pipeline.some((p) => p.candidateId === c.id);
                return (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    ranking={rankings[c.id]}
                    inPipeline={inPipeline}
                    onAddToPipeline={() => addToPipeline(c)}
                    onView={() => setProfileCandidateId(c.id)}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ============ TAB 2: PIPELINE ============ */}
        <TabsContent value="pipeline" className="space-y-4">
          {/* Toolbar */}
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative max-w-sm flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search pipeline by name, title or role…"
                    value={pipelineSearch}
                    onChange={(e) => setPipelineSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Pill tone="info">
                  <LayoutGrid className="mr-1 size-3" />
                  {pipeline.length} in pipeline
                </Pill>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setTab("candidates")}
                >
                  <UserPlus className="size-3.5" /> Add from Candidates
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Kanban */}
          <div className="flex gap-4 overflow-x-auto pb-2 scroll-thin">
            {STAGES.map((stage) => {
              const entries = stageEntries(stage.id);
              return (
                <div
                  key={stage.id}
                  className="flex min-w-[260px] max-w-[300px] flex-1 flex-col rounded-xl border border-border/60 bg-muted/20"
                >
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-t-xl px-3 py-2.5",
                      stage.headerBg
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("size-2 rounded-full", stage.dot)} />
                      <h3 className={cn("text-sm font-semibold", stage.accent)}>
                        {stage.label}
                      </h3>
                    </div>
                    <Badge variant="secondary" className="bg-background/80 text-xs">
                      {entries.length}
                    </Badge>
                  </div>
                  <div className={cn("h-0.5 w-full", stage.bar)} />
                  <div className="flex-1 space-y-2 p-2 max-h-[70vh] overflow-y-auto scroll-thin">
                    {entries.length === 0 ? (
                      <div className="flex flex-col items-center gap-1 py-8 text-center text-xs text-muted-foreground">
                        <Users className="size-5 opacity-40" />
                        No candidates
                      </div>
                    ) : (
                      entries.map((entry) => {
                        const candidate = candidateById(entry.candidateId);
                        return (
                          <PipelineCardView
                            key={entry.id}
                            entry={entry}
                            candidate={candidate}
                            onAdvance={() => advanceStage(entry.id)}
                            onReject={() => rejectEntry(entry.id)}
                            onClick={() => setPipelineDetailId(entry.id)}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ============ TAB 3: EVALUATIONS ============ */}
        <TabsContent value="evaluations" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <ListChecks className="size-4 text-primary" /> Interview Evaluations
              </h2>
              <p className="text-sm text-muted-foreground">
                {evaluations.length} recorded · structured scores &amp; interviewer notes
              </p>
            </div>
            <Button className="gap-1.5" onClick={() => setNewEvalOpen(true)}>
              <Plus className="size-4" /> New Evaluation
            </Button>
          </div>

          {evaluations.length === 0 ? (
            <AIEmptyState
              icon={ClipboardList}
              title="No evaluations yet"
              description="Record structured interview feedback to keep your hiring decisions data-driven."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {evaluations.map((e) => (
                <EvaluationCardView key={e.id} evaluation={e} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Profile dialog (from Candidates tab) */}
      <CandidateProfileDialog
        candidate={profileCandidate}
        ranking={profileCandidate ? rankings[profileCandidate.id] : undefined}
        inPipeline={
          profileCandidate
            ? pipeline.some((p) => p.candidateId === profileCandidate.id)
            : false
        }
        onClose={() => setProfileCandidateId(null)}
        onAddToPipeline={() => {
          if (profileCandidate) addToPipeline(profileCandidate);
        }}
        onSubmitEvaluation={(e) => {
          if (profileCandidate) addInlineEvaluation(profileCandidate, e);
        }}
      />

      {/* Pipeline detail dialog */}
      <PipelineDetailDialog
        entry={pipelineDetailEntry}
        candidate={pipelineDetailCandidate}
        onClose={() => setPipelineDetailId(null)}
        onAdvance={() => {
          if (pipelineDetailEntry) advanceStage(pipelineDetailEntry.id);
        }}
        onReject={() => {
          if (pipelineDetailEntry) rejectEntry(pipelineDetailEntry.id);
        }}
      />

      {/* New evaluation dialog */}
      <NewEvaluationDialog
        open={newEvalOpen}
        onOpenChange={setNewEvalOpen}
        onSubmit={addEvaluation}
      />
    </div>
  );
}
