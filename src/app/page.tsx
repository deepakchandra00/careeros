"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Loader2, Rocket } from "lucide-react";
import { AuthGate } from "@/components/app/auth-gate";
import { useAppStore } from "@/store/app-store";
import type { ModuleId } from "@/lib/modules";

// Lazy-load shell components (only needed when authenticated) to reduce initial memory
const Sidebar = dynamic(() => import("@/components/app/sidebar").then(m => ({ default: m.Sidebar })));
const Topbar = dynamic(() => import("@/components/app/topbar").then(m => ({ default: m.Topbar })));
const Footer = dynamic(() => import("@/components/app/footer").then(m => ({ default: m.Footer })));
const Onboarding = dynamic(() => import("@/components/app/onboarding").then(m => ({ default: m.Onboarding })));
const CommandPalette = dynamic(() => import("@/components/app/command-palette").then(m => ({ default: m.CommandPalette })));

// Lazy-load ALL modules to reduce initial compilation memory.
// Each module is compiled on-demand when the user first navigates to it.
const DashboardModule = dynamic(() => import("@/components/modules/dashboard").then(m => ({ default: m.DashboardModule })), { loading: () => <ModuleSkeleton /> });
const ResumeBuilderModule = dynamic(() => import("@/components/modules/resume-builder").then(m => ({ default: m.ResumeBuilderModule })), { loading: () => <ModuleSkeleton /> });
const ResumeReviewModule = dynamic(() => import("@/components/modules/resume-review").then(m => ({ default: m.ResumeReviewModule })), { loading: () => <ModuleSkeleton /> });
const JdOptimizerModule = dynamic(() => import("@/components/modules/jd-optimizer").then(m => ({ default: m.JdOptimizerModule })), { loading: () => <ModuleSkeleton /> });
const ResumeRewriterModule = dynamic(() => import("@/components/modules/resume-rewriter").then(m => ({ default: m.ResumeRewriterModule })), { loading: () => <ModuleSkeleton /> });
const VersionManagerModule = dynamic(() => import("@/components/modules/version-manager").then(m => ({ default: m.VersionManagerModule })), { loading: () => <ModuleSkeleton /> });
const LinkedinModule = dynamic(() => import("@/components/modules/linkedin").then(m => ({ default: m.LinkedinModule })), { loading: () => <ModuleSkeleton /> });
const NaukriModule = dynamic(() => import("@/components/modules/naukri").then(m => ({ default: m.NaukriModule })), { loading: () => <ModuleSkeleton /> });
const InterviewModule = dynamic(() => import("@/components/modules/interview").then(m => ({ default: m.InterviewModule })), { loading: () => <ModuleSkeleton /> });
const SalaryModule = dynamic(() => import("@/components/modules/salary").then(m => ({ default: m.SalaryModule })), { loading: () => <ModuleSkeleton /> });
const PortfolioModule = dynamic(() => import("@/components/modules/portfolio").then(m => ({ default: m.PortfolioModule })), { loading: () => <ModuleSkeleton /> });
const CoverLetterModule = dynamic(() => import("@/components/modules/cover-letter").then(m => ({ default: m.CoverLetterModule })), { loading: () => <ModuleSkeleton /> });
const JobTrackerModule = dynamic(() => import("@/components/modules/job-tracker").then(m => ({ default: m.JobTrackerModule })), { loading: () => <ModuleSkeleton /> });
const JobSearchModule = dynamic(() => import("@/components/modules/job-search").then(m => ({ default: m.JobSearchModule })), { loading: () => <ModuleSkeleton /> });
const SkillGapModule = dynamic(() => import("@/components/modules/skill-gap").then(m => ({ default: m.SkillGapModule })), { loading: () => <ModuleSkeleton /> });
const RoadmapModule = dynamic(() => import("@/components/modules/roadmap").then(m => ({ default: m.RoadmapModule })), { loading: () => <ModuleSkeleton /> });
const CoachModule = dynamic(() => import("@/components/modules/coach").then(m => ({ default: m.CoachModule })), { loading: () => <ModuleSkeleton /> });
const CodingPracticeModule = dynamic(() => import("@/components/modules/coding-practice").then(m => ({ default: m.CodingPracticeModule })), { loading: () => <ModuleSkeleton /> });
const MockInterviewModule = dynamic(() => import("@/components/modules/mock-interview").then(m => ({ default: m.MockInterviewModule })), { loading: () => <ModuleSkeleton /> });
const RecruiterModule = dynamic(() => import("@/components/modules/recruiter").then(m => ({ default: m.RecruiterModule })), { loading: () => <ModuleSkeleton /> });
const LearningHubModule = dynamic(() => import("@/components/modules/learning-hub").then(m => ({ default: m.LearningHubModule })), { loading: () => <ModuleSkeleton /> });
const PricingModule = dynamic(() => import("@/components/modules/pricing").then(m => ({ default: m.PricingModule })), { loading: () => <ModuleSkeleton /> });
const AnalyticsModule = dynamic(() => import("@/components/modules/analytics").then(m => ({ default: m.AnalyticsModule })), { loading: () => <ModuleSkeleton /> });
const CareerIntelligenceModule = dynamic(() => import("@/components/modules/career-intelligence").then(m => ({ default: m.CareerIntelligenceModule })), { loading: () => <ModuleSkeleton /> });
const AdminModule = dynamic(() => import("@/components/modules/admin").then(m => ({ default: m.AdminModule })), { loading: () => <ModuleSkeleton /> });

function ModuleSkeleton() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

const MODULE_COMPONENTS: Record<
  ModuleId,
  React.ComponentType
> = {
  dashboard: DashboardModule,
  "resume-builder": ResumeBuilderModule,
  "resume-review": ResumeReviewModule,
  "jd-optimizer": JdOptimizerModule,
  "resume-rewriter": ResumeRewriterModule,
  versions: VersionManagerModule,
  linkedin: LinkedinModule,
  naukri: NaukriModule,
  interview: InterviewModule,
  salary: SalaryModule,
  portfolio: PortfolioModule,
  "cover-letter": CoverLetterModule,
  "job-tracker": JobTrackerModule,
  "job-search": JobSearchModule,
  "skill-gap": SkillGapModule,
  roadmap: RoadmapModule,
  coach: CoachModule,
  "coding-practice": CodingPracticeModule,
  "mock-interview": MockInterviewModule,
  recruiter: RecruiterModule,
  "learning-hub": LearningHubModule,
  pricing: PricingModule,
  analytics: AnalyticsModule,
  "career-intelligence": CareerIntelligenceModule,
  admin: AdminModule,
};

export default function Home() {
  const { data: session, status } = useSession();
  const active = useAppStore((s) => s.activeModule);
  const Active = MODULE_COMPONENTS[active];

  // Auth gate
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground shadow-lg shadow-primary/20">
            <Rocket className="size-6" />
          </div>
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <AuthGate />;
  }

  // Authenticated but not onboarded → show onboarding
  const onboarded = (session?.user as { onboarded?: boolean } | undefined)?.onboarded;
  if (!onboarded) {
    return <Onboarding />;
  }

  return <AppShell Active={Active} />;
}

function AppShell({ Active }: { Active: React.ComponentType }) {
  const setModule = useAppStore((s) => s.setModule);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // Toggle command palette (handled in the palette component via store)
        window.dispatchEvent(new CustomEvent("careeros:command-palette"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setModule]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <Topbar />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Active />
        </main>
        <Footer />
      </div>
      <CommandPalette />
    </div>
  );
}
