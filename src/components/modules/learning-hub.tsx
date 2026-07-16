"use client";

import * as React from "react";
import {
  GraduationCap,
  BookOpen,
  Layers,
  Bookmark as BookmarkIcon,
  BarChart3,
  Search,
  Plus,
  Play,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Check,
  Shuffle,
  Trash2,
  ExternalLink,
  Flame,
  Clock,
  Award,
  ArrowRight,
  FileText,
  Video,
  Wrench,
  Globe,
  CircleCheck,
  Sparkles,
  RotateCcw,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import {
  ModuleHeader,
  ScoreRing,
  Pill,
  AIEmptyState,
} from "@/components/shared/blocks";
import { cn } from "@/lib/utils";

// ===========================================================================
// Types
// ===========================================================================

type Category =
  | "Frontend"
  | "Backend"
  | "DevOps"
  | "Data"
  | "Career"
  | "System Design";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface Lesson {
  id: string;
  title: string;
  duration: string;
}

interface Course {
  id: string;
  title: string;
  instructor: string;
  category: Category;
  difficulty: Difficulty;
  hours: number;
  description: string;
  lessons: Lesson[];
}

type Deck =
  | "All"
  | "JavaScript"
  | "React"
  | "System Design"
  | "SQL"
  | "DSA"
  | "Behavioral";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: Exclude<Deck, "All">;
}

type BookmarkCategory = "Article" | "Video" | "Docs" | "Course" | "Tool";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: BookmarkCategory;
  notes: string;
  date: string;
}

interface ActivityEntry {
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  category: Category;
  ts: number;
}

// ===========================================================================
// useLocalStorage hook
// ===========================================================================

function useLocalStorage<T>(
  key: string,
  initial: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(initial);
  const [hydrated, setHydrated] = React.useState(false);

  // Hydrate from localStorage on mount.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // ignore malformed JSON
    }
    setHydrated(true);
  }, [key]);

  // Persist whenever value changes (after initial hydration).
  React.useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full / unavailable — ignore
    }
  }, [key, value, hydrated]);

  return [value, setValue];
}

// ===========================================================================
// Static data
// ===========================================================================

const CATEGORIES: Category[] = [
  "Frontend",
  "Backend",
  "DevOps",
  "Data",
  "Career",
  "System Design",
];

const CATEGORY_GRADIENT: Record<Category, string> = {
  Frontend: "from-emerald-500 to-teal-600",
  Backend: "from-purple-500 to-fuchsia-600",
  DevOps: "from-amber-500 to-orange-600",
  Data: "from-lime-500 to-emerald-600",
  Career: "from-rose-500 to-pink-600",
  "System Design": "from-violet-500 to-purple-600",
};

const CATEGORY_ACCENT: Record<Category, string> = {
  Frontend: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Backend: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  DevOps: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Data: "bg-lime-500/15 text-lime-600 dark:text-lime-400",
  Career: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "System Design": "bg-violet-500/15 text-violet-600 dark:text-violet-400",
};

const CATEGORY_CHART_COLOR: Record<Category, string> = {
  Frontend: "oklch(0.62 0.15 162)",
  Backend: "oklch(0.6 0.18 300)",
  DevOps: "oklch(0.75 0.16 70)",
  Data: "oklch(0.72 0.17 140)",
  Career: "oklch(0.65 0.2 15)",
  "System Design": "oklch(0.62 0.18 290)",
};

const CATEGORY_DOT: Record<Category, string> = {
  Frontend: "bg-emerald-500",
  Backend: "bg-purple-500",
  DevOps: "bg-amber-500",
  Data: "bg-lime-500",
  Career: "bg-rose-500",
  "System Design": "bg-violet-500",
};

const DIFFICULTY_TONE: Record<Difficulty, "good" | "info" | "warn"> = {
  Beginner: "good",
  Intermediate: "info",
  Advanced: "warn",
};

const DECKS: Deck[] = [
  "All",
  "JavaScript",
  "React",
  "System Design",
  "SQL",
  "DSA",
  "Behavioral",
];

const BOOKMARK_CATEGORIES: BookmarkCategory[] = [
  "Article",
  "Video",
  "Docs",
  "Course",
  "Tool",
];

const BOOKMARK_META: Record<
  BookmarkCategory,
  { icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  Article: {
    icon: FileText,
    classes: "bg-primary/15 text-primary",
  },
  Video: {
    icon: Video,
    classes: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  Docs: {
    icon: FileText,
    classes: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
  Course: {
    icon: GraduationCap,
    classes: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  Tool: {
    icon: Wrench,
    classes: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  },
};

const COURSES: Course[] = [
  {
    id: "c1",
    title: "React 19 Deep Dive",
    instructor: "Sarah Rizvi",
    category: "Frontend",
    difficulty: "Advanced",
    hours: 4,
    description:
      "Master React 19 — the new compiler, Actions, use(), suspense streaming, and concurrent rendering patterns used in production at scale.",
    lessons: [
      { id: "c1-l1", title: "React Compiler Internals", duration: "42 min" },
      { id: "c1-l2", title: "Actions & the use() Hook", duration: "38 min" },
      { id: "c1-l3", title: "Suspense Streaming Patterns", duration: "45 min" },
      { id: "c1-l4", title: "Concurrent Rendering", duration: "40 min" },
      { id: "c1-l5", title: "Server Components Deep Dive", duration: "50 min" },
      { id: "c1-l6", title: "Performance Profiling", duration: "35 min" },
    ],
  },
  {
    id: "c2",
    title: "System Design Fundamentals",
    instructor: "Arjun Mehta",
    category: "System Design",
    difficulty: "Intermediate",
    hours: 5,
    description:
      "From URL to planet-scale: load balancing, caching, databases, message queues, and the trade-offs that decide senior offers.",
    lessons: [
      { id: "c2-l1", title: "Scaling From 0 to 1M Users", duration: "55 min" },
      { id: "c2-l2", title: "Caching Strategies", duration: "48 min" },
      { id: "c2-l3", title: "Database Sharding & Replication", duration: "62 min" },
      { id: "c2-l4", title: "Message Queues & Async Processing", duration: "52 min" },
      { id: "c2-l5", title: "Designing Twitter — Capstone", duration: "70 min" },
    ],
  },
  {
    id: "c3",
    title: "Docker & Kubernetes",
    instructor: "Diego Ramirez",
    category: "DevOps",
    difficulty: "Intermediate",
    hours: 4,
    description:
      "Ship containers with confidence — image layering, multi-stage builds, pods, deployments, services, and Helm charts for real apps.",
    lessons: [
      { id: "c3-l1", title: "Docker Image Mastery", duration: "40 min" },
      { id: "c3-l2", title: "Multi-Stage Builds", duration: "32 min" },
      { id: "c3-l3", title: "Kubernetes Pods & Deployments", duration: "55 min" },
      { id: "c3-l4", title: "Services & Ingress", duration: "45 min" },
      { id: "c3-l5", title: "Helm Charts in Production", duration: "50 min" },
    ],
  },
  {
    id: "c4",
    title: "Python for Data Science",
    instructor: "Mei Lin",
    category: "Data",
    difficulty: "Beginner",
    hours: 6,
    description:
      "NumPy, Pandas, and Matplotlib from scratch — clean, transform, and visualize data like a senior analyst in six focused lessons.",
    lessons: [
      { id: "c4-l1", title: "NumPy Foundations", duration: "55 min" },
      { id: "c4-l2", title: "Pandas DataFrames", duration: "65 min" },
      { id: "c4-l3", title: "Data Cleaning Techniques", duration: "50 min" },
      { id: "c4-l4", title: "Groupby & Aggregation", duration: "48 min" },
      { id: "c4-l5", title: "Matplotlib & Seaborn", duration: "60 min" },
      { id: "c4-l6", title: "Mini Project: EDA on Titanic", duration: "75 min" },
    ],
  },
  {
    id: "c5",
    title: "DSA Mastery",
    instructor: "Vikram Patel",
    category: "Career",
    difficulty: "Advanced",
    hours: 8,
    description:
      "Patterns over problems — sliding window, two pointers, DP, graphs, and the templates that solve 80% of FAANG interview questions.",
    lessons: [
      { id: "c5-l1", title: "Arrays & Two Pointers", duration: "75 min" },
      { id: "c5-l2", title: "Sliding Window Patterns", duration: "80 min" },
      { id: "c5-l3", title: "Trees & BSTs", duration: "85 min" },
      { id: "c5-l4", title: "Graphs: BFS & DFS", duration: "90 min" },
      { id: "c5-l5", title: "Dynamic Programming", duration: "95 min" },
      { id: "c5-l6", title: "Mock Interview Circuit", duration: "100 min" },
    ],
  },
  {
    id: "c6",
    title: "SQL & Databases",
    instructor: "Nora Karlsson",
    category: "Backend",
    difficulty: "Beginner",
    hours: 3,
    description:
      "Write SQL that scales — joins, window functions, indexing, and the query planner knowledge that separates juniors from seniors.",
    lessons: [
      { id: "c6-l1", title: "Joins & Set Operations", duration: "40 min" },
      { id: "c6-l2", title: "Window Functions", duration: "45 min" },
      { id: "c6-l3", title: "Indexing Deep Dive", duration: "50 min" },
      { id: "c6-l4", title: "Query Optimization", duration: "45 min" },
    ],
  },
  {
    id: "c7",
    title: "Interview Behavioral Prep",
    instructor: "Jasmine Walker",
    category: "Career",
    difficulty: "Beginner",
    hours: 2,
    description:
      "Tell stories that get offers — the STAR method, leadership principles, and the 30 most-asked behavioral questions rehearsed.",
    lessons: [
      { id: "c7-l1", title: "STAR Method Framework", duration: "25 min" },
      { id: "c7-l2", title: "Amazon Leadership Principles", duration: "35 min" },
      { id: "c7-l3", title: "Conflict & Failure Stories", duration: "30 min" },
      { id: "c7-l4", title: "Mock Behavioral Round", duration: "30 min" },
    ],
  },
  {
    id: "c8",
    title: "AWS Cloud Practitioner",
    instructor: "Tom Becker",
    category: "DevOps",
    difficulty: "Beginner",
    hours: 5,
    description:
      "Certify-ready — EC2, S3, IAM, VPC, RDS, and the cloud billing mental model that pays for itself in your first week on the job.",
    lessons: [
      { id: "c8-l1", title: "Cloud Concepts & Pricing", duration: "50 min" },
      { id: "c8-l2", title: "EC2 & EBS", duration: "55 min" },
      { id: "c8-l3", title: "S3 & Storage Classes", duration: "50 min" },
      { id: "c8-l4", title: "IAM & Security", duration: "60 min" },
      { id: "c8-l5", title: "VPC & Networking", duration: "65 min" },
    ],
  },
];

const FLASHCARDS: Flashcard[] = [
  // JavaScript (4)
  {
    id: "f1",
    category: "JavaScript",
    front: "What is a closure in JavaScript?",
    back: "A function bundled with references to its surrounding lexical environment, allowing access to outer-scope variables even after the outer function returns.",
  },
  {
    id: "f2",
    category: "JavaScript",
    front: "Difference between == and ===?",
    back: "== performs type coercion before comparing; === checks both type and value without coercion. Always prefer === to avoid surprises.",
  },
  {
    id: "f3",
    category: "JavaScript",
    front: "What is the event loop?",
    back: "The mechanism that lets JS perform non-blocking async ops by continuously checking the call stack and processing the callback/microtask queues when the stack is empty.",
  },
  {
    id: "f4",
    category: "JavaScript",
    front: "What does hoisting mean?",
    back: "JS moves function and variable declarations to the top of their scope before execution. var is initialized as undefined; let/const are hoisted but sit in a temporal dead zone.",
  },
  // React (3)
  {
    id: "f5",
    category: "React",
    front: "Why use keys in React lists?",
    back: "Keys help React identify which items changed, were added, or removed — enabling efficient reconciliation. They must be stable and unique among siblings.",
  },
  {
    id: "f6",
    category: "React",
    front: "What is useMemo for?",
    back: "It memoizes a computed value so it's only recomputed when dependencies change — useful for expensive calculations or preserving referential equality in props.",
  },
  {
    id: "f7",
    category: "React",
    front: "useState vs useReducer?",
    back: "useState is best for independent primitive state. useReducer shines for state with multiple sub-values, transitions, or when next state depends on previous via well-defined actions.",
  },
  // System Design (3)
  {
    id: "f8",
    category: "System Design",
    front: "What is the CAP theorem?",
    back: "A distributed system can provide at most 2 of 3 guarantees: Consistency, Availability, Partition tolerance. Since partitions are unavoidable, the real trade-off is C vs A.",
  },
  {
    id: "f9",
    category: "System Design",
    front: "When would you use a message queue?",
    back: "To decouple producers from consumers, smooth traffic spikes, retry failures, and enable async processing — e.g. Kafka for event streams, SQS for task fan-out.",
  },
  {
    id: "f10",
    category: "System Design",
    front: "What is sharding?",
    back: "Horizontally partitioning a database so each shard holds a subset of rows (by shard key). Enables horizontal scaling but complicates joins and cross-shard transactions.",
  },
  // SQL (3)
  {
    id: "f11",
    category: "SQL",
    front: "INNER JOIN vs LEFT JOIN?",
    back: "INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table plus matching rows from the right (NULLs where no match exists).",
  },
  {
    id: "f12",
    category: "SQL",
    front: "What does a window function do?",
    back: "Performs a calculation across a set of rows related to the current row (via OVER()), without collapsing them like GROUP BY. Useful for running totals, ranks, lead/lag.",
  },
  {
    id: "f13",
    category: "SQL",
    front: "What is a covering index?",
    back: "An index that contains all columns referenced in a query's SELECT, WHERE, and ORDER BY, letting the DB answer from the index alone without touching the table.",
  },
  // DSA (4)
  {
    id: "f14",
    category: "DSA",
    front: "Time complexity of binary search?",
    back: "O(log n) — each comparison halves the search space. Requires sorted input. Space: O(1) iterative, O(log n) recursive.",
  },
  {
    id: "f15",
    category: "DSA",
    front: "When to use a heap vs a sorted array?",
    back: "Use a heap when you need repeated min/max extraction or top-k with frequent insertions (O(log n) insert/extract). Sorted arrays are better for static data with binary search (O(log n) lookup).",
  },
  {
    id: "f16",
    category: "DSA",
    front: "What's the two-pointer technique?",
    back: "Use two indices moving through the array (same direction or opposite) to solve in-place problems like pair sums, dedup, or sorted-merge in O(n) time, O(1) space.",
  },
  {
    id: "f17",
    category: "DSA",
    front: "Define dynamic programming.",
    back: "Solving problems by breaking them into overlapping subproblems, solving each once, and storing results (memoization or tabulation). Useful with optimal substructure + overlapping subproblems.",
  },
  // Behavioral (3)
  {
    id: "f18",
    category: "Behavioral",
    front: "Walk me through the STAR method.",
    back: "Situation: set context. Task: your responsibility. Action: what YOU did (use 'I'). Result: measurable outcome. Aim for ~10% S, 10% T, 60% A, 20% R.",
  },
  {
    id: "f19",
    category: "Behavioral",
    front: "How to answer 'Tell me about a conflict'?",
    back: "Pick a real disagreement, focus on empathy + data-driven approach, never blame teammates, end with the resolution and what you learned about collaboration.",
  },
  {
    id: "f20",
    category: "Behavioral",
    front: "Strong answer to 'Why this company'?",
    back: "Tie a specific product/strategy/culture observation to your skills and trajectory. Avoid generic praise. Bonus: reference a recent launch or engineering blog post.",
  },
];

const SEED_BOOKMARKS: Bookmark[] = [
  {
    id: "b1",
    title: "React Server Components — the full guide",
    url: "https://overreacted.io/before-you-memo/",
    category: "Article",
    notes:
      "Dan Abramov's deep dive on RSC mental model. Re-read before system design rounds.",
    date: new Date(Date.now() - 86_400_000 * 3).toISOString(),
  },
  {
    id: "b2",
    title: "System Design Interview — Alex Xu (Vol 1)",
    url: "https://www.amazon.com/dp/B08CMF2CQG",
    category: "Course",
    notes:
      "Chapter 4 (Design a Rate Limiter) — revisit sliding window vs token bucket trade-offs.",
    date: new Date(Date.now() - 86_400_000 * 7).toISOString(),
  },
  {
    id: "b3",
    title: "Big-O Cheatsheet for Common Algorithms",
    url: "https://www.bigocheatsheet.com/",
    category: "Tool",
    notes:
      "Pin this during DSA practice — sorting, graph, and data structure complexity at a glance.",
    date: new Date(Date.now() - 86_400_000 * 1).toISOString(),
  },
  {
    id: "b4",
    title: "PostgreSQL Docs: Window Functions",
    url: "https://www.postgresql.org/docs/current/tutorial-window.html",
    category: "Docs",
    notes: "Best reference for LAG, LEAD, ROW_NUMBER, and partition framing clauses.",
    date: new Date(Date.now() - 86_400_000 * 14).toISOString(),
  },
];

// ===========================================================================
// Helpers
// ===========================================================================

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function courseProgress(course: Course, progress: Record<string, boolean>) {
  const total = course.lessons.length;
  const done = course.lessons.filter((l) => progress[l.id]).length;
  return { done, total, pct: total === 0 ? 0 : (done / total) * 100 };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(new Date(ts).toISOString());
}

// ===========================================================================
// Main module
// ===========================================================================

export function LearningHubModule() {
  const [tab, setTab] = React.useState("courses");
  const [progress, setProgress] = useLocalStorage<Record<string, boolean>>(
    "learning-hub:progress",
    {}
  );
  const [activity, setActivity] = useLocalStorage<ActivityEntry[]>(
    "learning-hub:activity",
    []
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={GraduationCap}
        title="Learning Hub"
        description="Courses, flashcards, and bookmarks — your upskilling command center"
      >
        <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
          <Sparkles className="size-3" /> {COURSES.length} courses
        </Badge>
      </ModuleHeader>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-4 sm:w-auto sm:grid-flow-col">
          <TabsTrigger value="courses" className="gap-1.5">
            <BookOpen className="size-3.5" /> <span className="hidden sm:inline">Courses</span>
            <span className="sm:hidden">Courses</span>
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="gap-1.5">
            <Layers className="size-3.5" /> Flashcards
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="gap-1.5">
            <BookmarkIcon className="size-3.5" /> Bookmarks
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-1.5">
            <BarChart3 className="size-3.5" /> Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6 outline-none">
          <CoursesTab
            progress={progress}
            setProgress={setProgress}
            setActivity={setActivity}
          />
        </TabsContent>
        <TabsContent value="flashcards" className="mt-6 outline-none">
          <FlashcardsTab />
        </TabsContent>
        <TabsContent value="bookmarks" className="mt-6 outline-none">
          <BookmarksTab />
        </TabsContent>
        <TabsContent value="progress" className="mt-6 outline-none">
          <ProgressTab
            progress={progress}
            activity={activity}
            onJumpToCourses={() => setTab("courses")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===========================================================================
// Small shared UI helpers
// ===========================================================================

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  accent: "emerald" | "amber" | "purple" | "rose";
}) {
  const accentMap: Record<typeof accent, string> = {
    emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    rose: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  };
  return (
    <Card className="py-0">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg",
            accentMap[accent]
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

// ===========================================================================
// Tab 1 — Courses
// ===========================================================================

function CoursesTab({
  progress,
  setProgress,
  setActivity,
}: {
  progress: Record<string, boolean>;
  setProgress: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setActivity: React.Dispatch<React.SetStateAction<ActivityEntry[]>>;
}) {
  const [query, setQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<"All" | Category>(
    "All"
  );
  const [selected, setSelected] = React.useState<Course | null>(null);

  const stats = React.useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let totalHours = 0;
    for (const c of COURSES) {
      const { done, total } = courseProgress(c, progress);
      if (done > 0) totalHours += (done / total) * c.hours;
      if (done === total && total > 0) completed++;
      else if (done > 0) inProgress++;
    }
    return {
      total: COURSES.length,
      completed,
      inProgress,
      totalHours: Math.round(totalHours),
    };
  }, [progress]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return COURSES.filter((c) => {
      if (activeCategory !== "All" && c.category !== activeCategory)
        return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory]);

  const toggleLesson = (course: Course, lesson: Lesson) => {
    const willBeDone = !progress[lesson.id];
    setProgress((p) => ({ ...p, [lesson.id]: willBeDone }));
    setActivity((a) => {
      if (willBeDone) {
        const entry: ActivityEntry = {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          courseTitle: course.title,
          category: course.category,
          ts: Date.now(),
        };
        return [entry, ...a.filter((e) => e.lessonId !== lesson.id)].slice(
          0,
          100
        );
      }
      return a.filter((e) => e.lessonId !== lesson.id);
    });
  };

  const markCourseComplete = (course: Course) => {
    const newlyDone = course.lessons.filter((l) => !progress[l.id]);
    if (newlyDone.length === 0) {
      toast.info("All lessons are already complete");
      return;
    }
    const patch: Record<string, boolean> = {};
    for (const l of newlyDone) patch[l.id] = true;
    setProgress((p) => ({ ...p, ...patch }));
    setActivity((a) => {
      const additions: ActivityEntry[] = newlyDone.map((l) => ({
        lessonId: l.id,
        lessonTitle: l.title,
        courseTitle: course.title,
        category: course.category,
        ts: Date.now(),
      }));
      const merged = [...additions, ...a];
      const seen = new Set<string>();
      return merged
        .filter((e) => {
          if (seen.has(e.lessonId)) return false;
          seen.add(e.lessonId);
          return true;
        })
        .slice(0, 100);
    });
    toast.success(
      `Marked all ${course.lessons.length} lessons complete in "${course.title}"`
    );
  };

  return (
    <div className="space-y-5">
      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Courses"
          value={stats.total}
          accent="emerald"
        />
        <StatCard
          icon={CircleCheck}
          label="Completed"
          value={stats.completed}
          accent="emerald"
        />
        <StatCard
          icon={Play}
          label="In Progress"
          value={stats.inProgress}
          accent="amber"
        />
        <StatCard
          icon={Clock}
          label="Hours Learned"
          value={stats.totalHours}
          accent="purple"
        />
      </div>

      {/* Search + filter chips */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, instructors, categories…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <CategoryChip
            active={activeCategory === "All"}
            onClick={() => setActiveCategory("All")}
          >
            All
          </CategoryChip>
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              active={activeCategory === c}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </CategoryChip>
          ))}
        </div>
      </div>

      {/* Course grid */}
      {filtered.length === 0 ? (
        <AIEmptyState
          icon={BookOpen}
          title="No courses match your filters"
          description="Try a different category or clear your search to see all 8 courses."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => {
            const { done, total, pct } = courseProgress(course, progress);
            const started = done > 0;
            const complete = done === total && total > 0;
            return (
              <Card
                key={course.id}
                className="group cursor-pointer gap-0 overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => setSelected(course)}
              >
                <div
                  className={cn(
                    "relative h-20 bg-gradient-to-br p-4",
                    CATEGORY_GRADIENT[course.category]
                  )}
                >
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                      {course.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-medium text-white/90">
                    <Clock className="size-3" /> {course.hours}h
                  </div>
                </div>
                <CardContent className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h3 className="line-clamp-2 font-semibold leading-tight">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      by {course.instructor}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone={DIFFICULTY_TONE[course.difficulty]}>
                      {course.difficulty}
                    </Pill>
                    <span className="text-xs text-muted-foreground">
                      {course.lessons.length} lessons
                    </span>
                  </div>
                  {started && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                        <span>
                          {complete ? "Completed" : "In progress"}
                        </span>
                        <span>
                          {done}/{total}
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  )}
                  <div className="mt-auto pt-1">
                    <Button
                      size="sm"
                      variant={complete ? "outline" : "default"}
                      className="w-full gap-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(course);
                      }}
                    >
                      {complete ? (
                        <>
                          <Eye className="size-3.5" /> Review
                        </>
                      ) : started ? (
                        <>
                          <Play className="size-3.5" /> Continue
                        </>
                      ) : (
                        <>
                          <Play className="size-3.5" /> Start
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CourseDialog
        course={selected}
        progress={progress}
        onClose={() => setSelected(null)}
        onToggleLesson={toggleLesson}
        onMarkComplete={markCourseComplete}
      />
    </div>
  );
}

function CourseDialog({
  course,
  progress,
  onClose,
  onToggleLesson,
  onMarkComplete,
}: {
  course: Course | null;
  progress: Record<string, boolean>;
  onClose: () => void;
  onToggleLesson: (course: Course, lesson: Lesson) => void;
  onMarkComplete: (course: Course) => void;
}) {
  const { done, total, pct } = course
    ? courseProgress(course, progress)
    : { done: 0, total: 0, pct: 0 };
  const complete = course ? done === total && total > 0 : false;

  return (
    <Dialog open={!!course} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="gap-0 p-0 sm:max-w-2xl">
        {course && (
          <>
            <div
              className={cn(
                "rounded-t-lg bg-gradient-to-br p-5 text-white",
                CATEGORY_GRADIENT[course.category]
              )}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur">
                  {course.category}
                </span>
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur">
                  {course.difficulty}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-bold">{course.title}</h2>
              <p className="mt-0.5 text-sm text-white/85">
                by {course.instructor}
              </p>
              <div className="mt-3 flex items-center gap-3 text-xs text-white/85">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" /> {course.hours}h
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="size-3" /> {course.lessons.length} lessons
                </span>
                {done > 0 && (
                  <span className="flex items-center gap-1">
                    <CircleCheck className="size-3" /> {done}/{total} done
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4 p-5">
              <DialogDescription className="text-sm leading-relaxed">
                {course.description}
              </DialogDescription>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Lessons</h4>
                  <span className="text-xs text-muted-foreground">
                    {done}/{total} complete
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
                <div className="max-h-[300px] space-y-1 overflow-y-auto pr-1">
                  {course.lessons.map((lesson, i) => {
                    const isDone = !!progress[lesson.id];
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => onToggleLesson(course, lesson)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                          isDone
                            ? "border-primary/30 bg-primary/5"
                            : "border-border hover:border-primary/40 hover:bg-accent/50"
                        )}
                      >
                        <Checkbox
                          checked={isDone}
                          className="pointer-events-none"
                          tabIndex={-1}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              isDone && "text-muted-foreground line-through"
                            )}
                          >
                            <span className="mr-1 text-muted-foreground">
                              {i + 1}.
                            </span>
                            {lesson.title}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {lesson.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="border-t px-5 py-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                disabled={complete}
                onClick={() => onMarkComplete(course)}
                className="gap-1.5"
              >
                <CircleCheck className="size-3.5" />
                {complete ? "All Complete" : "Mark All Complete"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ===========================================================================
// Tab 2 — Flashcards
// ===========================================================================

function FlashcardsTab() {
  const [deck, setDeck] = React.useState<Deck>("All");
  const [known, setKnown] = useLocalStorage<string[]>(
    "learning-hub:known",
    []
  );
  const [flipped, setFlipped] = React.useState(false);
  const [cursor, setCursor] = React.useState(0);
  const [displayIds, setDisplayIds] = React.useState<string[]>(() =>
    FLASHCARDS.map((c) => c.id)
  );

  const deckCards = React.useMemo(
    () =>
      deck === "All"
        ? FLASHCARDS
        : FLASHCARDS.filter((c) => c.category === deck),
    [deck]
  );

  const byId = React.useMemo(() => {
    const m = new Map<string, Flashcard>();
    FLASHCARDS.forEach((c) => m.set(c.id, c));
    return m;
  }, []);

  const knownSet = React.useMemo(() => new Set(known), [known]);

  // Active = current deck minus known, preserving the user's shuffle order.
  const activeIds = React.useMemo(
    () =>
      displayIds.filter((id) => {
        const card = byId.get(id);
        if (!card) return false;
        if (knownSet.has(id)) return false;
        if (deck !== "All" && card.category !== deck) return false;
        return true;
      }),
    [displayIds, byId, knownSet, deck]
  );

  const total = activeIds.length;
  const safeCursor = total === 0 ? 0 : Math.min(cursor, total - 1);
  const currentId = activeIds[safeCursor];
  const card = currentId ? byId.get(currentId) : undefined;

  // Reset cursor/flip when deck changes.
  const prevDeck = React.useRef(deck);
  React.useEffect(() => {
    if (prevDeck.current !== deck) {
      prevDeck.current = deck;
      setCursor(0);
      setFlipped(false);
    }
  }, [deck]);

  // Clamp cursor if it falls outside the active range (e.g. after Mark Known).
  React.useEffect(() => {
    if (total > 0 && cursor >= total) {
      setCursor(total - 1);
      setFlipped(false);
    }
  }, [cursor, total]);

  const goNext = () => {
    setFlipped(false);
    setCursor((c) => (total <= 1 ? 0 : (c + 1) % total));
  };
  const goPrev = () => {
    setFlipped(false);
    setCursor((c) => (total <= 1 ? 0 : (c - 1 + total) % total));
  };
  const flip = () => setFlipped((f) => !f);
  const markKnown = () => {
    if (!currentId) return;
    setKnown((k) => (k.includes(currentId) ? k : [...k, currentId]));
    setFlipped(false);
    toast.success("Marked known — removed from this session's rotation");
  };
  const shuffle = () => {
    setDisplayIds((ids) => shuffleArray([...ids]));
    setCursor(0);
    setFlipped(false);
    toast.info("Shuffled deck");
  };
  const resetKnown = () => {
    setKnown([]);
    setFlipped(false);
    setCursor(0);
    toast.info("Reset known cards — all back in rotation");
  };

  const knownInDeck = React.useMemo(
    () =>
      deckCards.filter((c) => knownSet.has(c.id)).length,
    [deckCards, knownSet]
  );

  return (
    <div className="space-y-5">
      {/* Deck selector */}
      <div className="flex flex-wrap items-center gap-2">
        {DECKS.map((d) => {
          const count =
            d === "All"
              ? FLASHCARDS.length
              : FLASHCARDS.filter((c) => c.category === d).length;
          return (
            <CategoryChip
              key={d}
              active={deck === d}
              onClick={() => setDeck(d)}
            >
              {d} <span className="opacity-60">({count})</span>
            </CategoryChip>
          );
        })}
      </div>

      {/* Card + progress */}
      {total === 0 ? (
        <div className="space-y-4">
          <AIEmptyState
            icon={Layers}
            title="All cards marked known!"
            description={`You've cleared this deck. Reset to bring all ${deckCards.length} cards back into rotation.`}
          />
          <div className="flex justify-center">
            <Button onClick={resetKnown} variant="outline" className="gap-1.5">
              <RotateCcw className="size-3.5" /> Reset Known Cards
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Progress row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                Card {safeCursor + 1} of {total}
              </span>
              <Badge
                variant="secondary"
                className="gap-1 bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
              >
                <Check className="size-3" /> Known: {knownInDeck}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress
                value={total === 0 ? 0 : ((safeCursor + 1) / total) * 100}
                className="h-1.5 sm:w-48"
              />
              <span className="text-xs text-muted-foreground">
                {Math.round(
                  total === 0 ? 0 : ((safeCursor + 1) / total) * 100
                )}
                %
              </span>
            </div>
          </div>

          {/* Flashcard */}
          <div className="mx-auto max-w-2xl" style={{ perspective: 1500 }}>
            <div
              onClick={flip}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  flip();
                }
              }}
              className="relative h-[340px] w-full cursor-pointer select-none"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                transition: "transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
              }}
            >
              {/* Front — Question */}
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <Card className="h-full gap-0 overflow-hidden border-2 border-primary/20 py-0">
                  <div className="flex items-center justify-between bg-gradient-to-br from-primary/10 to-transparent px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        CATEGORY_ACCENT[card!.category]
                      )}
                    >
                      {card!.category}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      Question
                    </span>
                  </div>
                  <CardContent className="flex flex-1 items-center justify-center p-6 text-center">
                    <p className="text-lg font-semibold leading-relaxed">
                      {card!.front}
                    </p>
                  </CardContent>
                  <div className="border-t bg-muted/30 px-6 py-2 text-center text-xs text-muted-foreground">
                    Click to flip and reveal the answer
                  </div>
                </Card>
              </div>

              {/* Back — Answer */}
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <Card className="h-full gap-0 overflow-hidden border-2 border-purple-500/20 py-0">
                  <div className="flex items-center justify-between bg-gradient-to-br from-purple-500/10 to-transparent px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        CATEGORY_ACCENT[card!.category]
                      )}
                    >
                      {card!.category}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      Answer
                    </span>
                  </div>
                  <CardContent className="flex flex-1 items-center justify-center p-6 text-center">
                    <p className="text-base leading-relaxed text-foreground">
                      {card!.back}
                    </p>
                  </CardContent>
                  <div className="border-t bg-muted/30 px-6 py-2 text-center text-xs text-muted-foreground">
                    Click to flip back
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={goPrev} className="gap-1.5">
              <ChevronLeft className="size-4" /> Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={flip}
              className="gap-1.5"
            >
              <RotateCw className="size-3.5" /> Flip
            </Button>
            <Button variant="outline" size="sm" onClick={goNext} className="gap-1.5">
              Next <ChevronRight className="size-4" />
            </Button>
            <Button
              size="sm"
              onClick={markKnown}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="size-3.5" /> Mark Known
            </Button>
            <Button variant="ghost" size="sm" onClick={shuffle} className="gap-1.5">
              <Shuffle className="size-3.5" /> Shuffle
            </Button>
          </div>

          {/* Reset link */}
          {knownInDeck > 0 && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetKnown}
                className="gap-1.5 text-xs text-muted-foreground"
              >
                <RotateCcw className="size-3" /> Reset {knownInDeck} known card
                {knownInDeck === 1 ? "" : "s"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ===========================================================================
// Tab 3 — Bookmarks
// ===========================================================================

function BookmarksTab() {
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>(
    "learning-hub:bookmarks",
    SEED_BOOKMARKS
  );
  const [filter, setFilter] = React.useState<"All" | BookmarkCategory>("All");
  const [formOpen, setFormOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    url: "",
    category: "Article" as BookmarkCategory,
    notes: "",
  });

  const filtered = React.useMemo(
    () =>
      filter === "All"
        ? bookmarks
        : bookmarks.filter((b) => b.category === filter),
    [bookmarks, filter]
  );

  const counts = React.useMemo(() => {
    const map: Record<BookmarkCategory, number> = {
      Article: 0,
      Video: 0,
      Docs: 0,
      Course: 0,
      Tool: 0,
    };
    for (const b of bookmarks) map[b.category]++;
    return map;
  }, [bookmarks]);

  const submit = () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast.error("Title and URL are required");
      return;
    }
    let url = form.url.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    const newBookmark: Bookmark = {
      id: `b${Date.now()}`,
      title: form.title.trim(),
      url,
      category: form.category,
      notes: form.notes.trim(),
      date: new Date().toISOString(),
    };
    setBookmarks((b) => [newBookmark, ...b]);
    setForm({ title: "", url: "", category: "Article", notes: "" });
    setFormOpen(false);
    toast.success("Bookmark saved");
  };

  const remove = (id: string) => {
    setBookmarks((b) => b.filter((x) => x.id !== id));
    toast.info("Bookmark removed");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <CategoryChip
            active={filter === "All"}
            onClick={() => setFilter("All")}
          >
            All ({bookmarks.length})
          </CategoryChip>
          {BOOKMARK_CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              active={filter === c}
              onClick={() => setFilter(c)}
            >
              {c} ({counts[c]})
            </CategoryChip>
          ))}
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-1.5">
          <Plus className="size-4" /> Add Bookmark
        </Button>
      </div>

      {filtered.length === 0 ? (
        <AIEmptyState
          icon={BookmarkIcon}
          title="No bookmarks here yet"
          description="Save articles, videos, docs, courses, and tools you want to revisit. Click 'Add Bookmark' to get started."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => {
            const meta = BOOKMARK_META[b.category];
            const Icon = meta.icon;
            return (
              <Card
                key={b.id}
                className="group gap-0 py-0 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardContent className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-lg",
                        meta.classes
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {b.category}
                    </Badge>
                  </div>
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-2 font-semibold leading-tight hover:text-primary hover:underline"
                  >
                    {b.title}
                  </a>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Globe className="size-3 shrink-0" />
                    {b.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    <ExternalLink className="size-3 shrink-0 opacity-50" />
                  </p>
                  {b.notes && (
                    <p className="line-clamp-3 text-xs text-muted-foreground">
                      {b.notes}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      Saved {formatDate(b.date)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                      onClick={() => remove(b.id)}
                      aria-label="Delete bookmark"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add bookmark dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a bookmark</DialogTitle>
            <DialogDescription>
              Save an article, video, doc, course, or tool to revisit later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="bm-title" className="text-xs">
                Title
              </Label>
              <Input
                id="bm-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. The definitive guide to caching"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bm-url" className="text-xs">
                URL
              </Label>
              <Input
                id="bm-url"
                value={form.url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, url: e.target.value }))
                }
                placeholder="https://example.com/article"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as BookmarkCategory }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOKMARK_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bm-notes" className="text-xs">
                Notes
              </Label>
              <Textarea
                id="bm-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Why is this useful? What should you revisit?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Save Bookmark</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===========================================================================
// Tab 4 — Progress
// ===========================================================================

function ProgressTab({
  progress,
  activity,
  onJumpToCourses,
}: {
  progress: Record<string, boolean>;
  activity: ActivityEntry[];
  onJumpToCourses: () => void;
}) {
  const totalLessons = React.useMemo(
    () => COURSES.reduce((sum, c) => sum + c.lessons.length, 0),
    []
  );
  const completedLessons = React.useMemo(
    () =>
      COURSES.reduce(
        (sum, c) => sum + c.lessons.filter((l) => progress[l.id]).length,
        0
      ),
    [progress]
  );
  const overallPct =
    totalLessons === 0 ? 0 : (completedLessons / totalLessons) * 100;

  const hoursLearned = React.useMemo(
    () =>
      COURSES.reduce((sum, c) => {
        const { done, total } = courseProgress(c, progress);
        return sum + (total > 0 ? (done / total) * c.hours : 0);
      }, 0),
    [progress]
  );

  const streak = 7; // mock

  const inProgress = React.useMemo(
    () =>
      COURSES.map((c) => ({ course: c, ...courseProgress(c, progress) }))
        .filter((x) => x.done > 0 && x.done < x.total)
        .slice(0, 3),
    [progress]
  );

  const skills = React.useMemo(() => {
    const set = new Set<Category>();
    for (const c of COURSES) {
      if (courseProgress(c, progress).done > 0) set.add(c.category);
    }
    return Array.from(set);
  }, [progress]);

  const chartData = React.useMemo(() => {
    const map: Record<Category, number> = {
      Frontend: 0,
      Backend: 0,
      DevOps: 0,
      Data: 0,
      Career: 0,
      "System Design": 0,
    };
    for (const c of COURSES) {
      map[c.category] += c.lessons.filter((l) => progress[l.id]).length;
    }
    return CATEGORIES.map((cat) => ({ category: cat, lessons: map[cat] }));
  }, [progress]);

  const recent = activity.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top row: ring + key stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
          <CardContent className="flex flex-col items-center gap-2 p-6">
            <ScoreRing
              value={overallPct}
              size={140}
              label="Overall"
              suffix="%"
            />
            <p className="text-center text-sm font-semibold">
              Learning Progress
            </p>
            <p className="text-center text-xs text-muted-foreground">
              {completedLessons} of {totalLessons} lessons complete
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <Card className="py-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4" />
                <span className="text-xs font-medium">Hours Learned</span>
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight">
                {hoursLearned.toFixed(1)}
                <span className="ml-1 text-base font-medium text-muted-foreground">
                  h
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                across {COURSES.length} courses
              </p>
            </CardContent>
          </Card>
          <Card className="py-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Flame className="size-4 text-amber-500" />
                <span className="text-xs font-medium">Day Streak</span>
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight">
                {streak}
                <span className="ml-1 text-base font-medium text-muted-foreground">
                  days
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Keep the momentum going!
              </p>
            </CardContent>
          </Card>
          <Card className="col-span-2 py-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="size-4 text-primary" />
                <span className="text-xs font-medium">Skills Being Learned</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Start a course to track skills here.
                  </p>
                ) : (
                  skills.map((s) => (
                    <span
                      key={s}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium",
                        CATEGORY_ACCENT[s]
                      )}
                    >
                      {s}
                    </span>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Continue learning */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Continue Learning</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onJumpToCourses}
          >
            Browse all <ArrowRight className="ml-1 size-3" />
          </Button>
        </div>
        {inProgress.length === 0 ? (
          <AIEmptyState
            icon={Play}
            title="Nothing in progress yet"
            description="Start a course to see it here for quick resume access."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map(({ course, done, total, pct }) => (
              <Card key={course.id} className="py-0">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white",
                        CATEGORY_GRADIENT[course.category]
                      )}
                    >
                      <BookOpen className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold">
                        {course.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.category}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                      <span>
                        {done}/{total} lessons
                      </span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                  <Button
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={onJumpToCourses}
                  >
                    <Play className="size-3.5" /> Resume
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Chart + recent activity */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Lessons Completed by Category
            </CardTitle>
            <CardDescription className="text-xs">
              Where your learning time is going
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.7 0.02 200 / 0.15)"
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
                  stroke="oklch(0.55 0.02 200)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  stroke="oklch(0.55 0.02 200)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.7 0.02 200 / 0.2)",
                    background: "oklch(0.2 0.018 200)",
                    color: "white",
                    fontSize: 12,
                  }}
                  cursor={{ fill: "oklch(0.7 0.02 200 / 0.08)" }}
                />
                <Bar dataKey="lessons" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={CATEGORY_CHART_COLOR[entry.category]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription className="text-xs">
              Your last 5 lesson completions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <div className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
                  <CircleCheck className="size-5" />
                </div>
                <p className="text-sm font-medium">No completions yet</p>
                <p className="max-w-xs text-xs text-muted-foreground">
                  Complete your first lesson and it&apos;ll show up here.
                </p>
              </div>
            ) : (
              <ol className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border before:content-['']">
                {recent.map((a, i) => (
                  <li
                    key={`${a.lessonId}-${i}`}
                    className="relative pl-7"
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-1 size-3.5 rounded-full ring-4 ring-background",
                        CATEGORY_DOT[a.category]
                      )}
                    />
                    <p className="text-sm font-medium leading-tight">
                      {a.lessonTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {a.courseTitle}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatRelative(a.ts)} ·{" "}
                      <span
                        className={cn(
                          "font-medium",
                          CATEGORY_ACCENT[a.category]
                        )}
                      >
                        {a.category}
                      </span>
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
