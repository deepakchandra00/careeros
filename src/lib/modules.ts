import {
  LayoutDashboard,
  FileText,
  ScanSearch,
  Target,
  Sparkles,
  Layers,
  Linkedin,
  Briefcase,
  Mic,
  IndianRupee,
  Globe,
  Mail,
  KanbanSquare,
  Search,
  GitCompareArrows,
  Map,
  Bot,
  ShieldCheck,
  Code2,
  Video,
  Users,
  GraduationCap,
  CreditCard,
  BarChart3,
  Brain,
  type LucideIcon,
} from "lucide-react";

export type ModuleId =
  | "dashboard"
  | "resume-builder"
  | "resume-review"
  | "jd-optimizer"
  | "resume-rewriter"
  | "versions"
  | "linkedin"
  | "naukri"
  | "interview"
  | "salary"
  | "portfolio"
  | "cover-letter"
  | "job-tracker"
  | "job-search"
  | "skill-gap"
  | "roadmap"
  | "coach"
  | "coding-practice"
  | "mock-interview"
  | "recruiter"
  | "learning-hub"
  | "pricing"
  | "analytics"
  | "career-intelligence"
  | "admin";

export interface ModuleDef {
  id: ModuleId;
  label: string;
  short: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

export const MODULES: ModuleDef[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    short: "Home",
    description: "Your career command center",
    icon: LayoutDashboard,
  },
  {
    id: "resume-builder",
    label: "Resume Builder",
    short: "Builder",
    description: "Craft ATS-ready resumes with AI",
    icon: FileText,
    badge: "Core",
  },
  {
    id: "resume-review",
    label: "Resume Review",
    short: "ATS Scan",
    description: "Upload & get instant ATS score",
    icon: ScanSearch,
  },
  {
    id: "jd-optimizer",
    label: "JD Optimizer",
    short: "JD Match",
    description: "Match your resume to any job",
    icon: Target,
  },
  {
    id: "resume-rewriter",
    label: "AI Resume Rewriter",
    short: "Rewriter",
    description: "Transform tone & seniority",
    icon: Sparkles,
  },
  {
    id: "versions",
    label: "Version Manager",
    short: "Versions",
    description: "Manage tailored resume variants",
    icon: Layers,
  },
  {
    id: "linkedin",
    label: "LinkedIn Optimizer",
    short: "LinkedIn",
    description: "AI-powered profile & SEO",
    icon: Linkedin,
  },
  {
    id: "naukri",
    label: "Naukri Optimizer",
    short: "Naukri",
    description: "Boost search visibility",
    icon: Briefcase,
    badge: "Unique",
  },
  {
    id: "interview",
    label: "Interview Coach",
    short: "Interview",
    description: "Mock interviews & feedback",
    icon: Mic,
  },
  {
    id: "salary",
    label: "Salary Predictor",
    short: "Salary",
    description: "Know your market worth",
    icon: IndianRupee,
  },
  {
    id: "portfolio",
    label: "Portfolio Builder",
    short: "Portfolio",
    description: "Resume → website in one click",
    icon: Globe,
  },
  {
    id: "cover-letter",
    label: "Cover Letter",
    short: "Cover",
    description: "Tailored letters per job",
    icon: Mail,
  },
  {
    id: "job-tracker",
    label: "Job Tracker",
    short: "Tracker",
    description: "Kanban for applications",
    icon: KanbanSquare,
  },
  {
    id: "job-search",
    label: "Job Search",
    short: "Search",
    description: "AI searches all boards",
    icon: Search,
  },
  {
    id: "skill-gap",
    label: "Skill Gap Analysis",
    short: "Skill Gap",
    description: "Find what's missing",
    icon: GitCompareArrows,
  },
  {
    id: "roadmap",
    label: "Learning Roadmap",
    short: "Roadmap",
    description: "30/60/90 day upskill plan",
    icon: Map,
  },
  {
    id: "coach",
    label: "AI Career Coach",
    short: "Coach",
    description: "ChatGPT for your career",
    icon: Bot,
    badge: "AI",
  },
  {
    id: "coding-practice",
    label: "Coding Practice",
    short: "Code",
    description: "IDE + AI code review",
    icon: Code2,
    badge: "New",
  },
  {
    id: "mock-interview",
    label: "AI Mock Interview",
    short: "Mock AI",
    description: "AI interviewer + video self-review",
    icon: Video,
    badge: "New",
  },
  {
    id: "learning-hub",
    label: "Learning Hub",
    short: "Learn",
    description: "Courses, flashcards & roadmaps",
    icon: GraduationCap,
  },
  {
    id: "recruiter",
    label: "Recruiter Platform",
    short: "Recruiter",
    description: "Source, rank & track candidates",
    icon: Users,
    badge: "Pro",
  },
  {
    id: "pricing",
    label: "Plans & Billing",
    short: "Pricing",
    description: "Upgrade or manage your subscription",
    icon: CreditCard,
  },
  {
    id: "analytics",
    label: "Analytics",
    short: "Analytics",
    description: "Your usage & career insights",
    icon: BarChart3,
  },
  {
    id: "career-intelligence",
    label: "Career Intelligence",
    short: "Career AI",
    description: "Unified career health & matching",
    icon: Brain,
    badge: "AI",
  },
  {
    id: "admin",
    label: "Admin Panel",
    short: "Admin",
    description: "Users, billing & analytics",
    icon: ShieldCheck,
  },
];

export const MODULE_MAP: Record<ModuleId, ModuleDef> = MODULES.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<ModuleId, ModuleDef>
);
