"use client";

import * as React from "react";
import Link from "next/link";
import { MODULES, type ModuleId } from "@/lib/modules";
import { useAppStore } from "@/store/app-store";
import { useResumeStore } from "@/store/resume-store";
import { useSession } from "next-auth/react";
import { adminGetNavConfig } from "@/lib/supabase-client";
import { UpgradeModal } from "@/components/app/upgrade-modal";
import { cn } from "@/lib/utils";
import {
  X,
  Rocket,
  Crown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const GROUPS: { label: string; ids: ModuleId[] }[] = [
  {
    label: "Overview",
    ids: ["dashboard", "coach"],
  },
  {
    label: "Resume Suite",
    ids: [
      "resume-builder",
      "resume-review",
      "jd-optimizer",
      "resume-rewriter",
      "versions",
    ],
  },
  {
    label: "Profile Optimization",
    ids: ["linkedin", "naukri", "portfolio", "cover-letter"],
  },
  {
    label: "Career Growth",
    ids: [
      "interview",
      "mock-interview",
      "coding-practice",
      "learning-hub",
      "salary",
      "job-tracker",
      "job-search",
      "skill-gap",
      "roadmap",
    ],
  },
  {
    label: "Recruiter",
    ids: ["recruiter"],
  },
  {
    label: "Account",
    ids: ["pricing", "analytics", "career-intelligence"],
  },
];

export function Sidebar() {
  const active = useAppStore((s) => s.activeModule);
  const setModule = useAppStore((s) => s.setModule);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebar = useAppStore((s) => s.setSidebar);
  const resumeName = useResumeStore((s) => s.data.name);
  const { data: session } = useSession();
  const userName = session?.user?.name || resumeName;
  const firstName = userName.split(" ")[0];
  const userPlan = (session?.user as { plan?: string } | undefined)?.plan ?? "FREE";
  const userRole = (session?.user as { role?: string } | undefined)?.role || "JOBSEEKER";
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const [navConfig, setNavConfig] = React.useState<Record<string, boolean>>({});
  const [navConfigLoaded, setNavConfigLoaded] = React.useState(false);

  // Pull navigation visibility config from Supabase (admin-set flags).
  // Failures are silently ignored — the sidebar falls back to role-based rules.
  React.useEffect(() => {
    let cancelled = false;
    adminGetNavConfig()
      .then((cfg) => {
        if (!cancelled) {
          setNavConfig(cfg);
          setNavConfigLoaded(true);
        }
      })
      .catch(() => {
        // Service role key may not be exposed client-side in this sandbox;
        // silently fall back to all-visible.
        if (!cancelled) setNavConfigLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Compute the set of visible module IDs based on:
  //   1. Global nav config (admin panel) — hide if explicitly `false`
  //   2. Role rules — admin module only for ADMIN, recruiter only for RECRUITER+
  const visibleModuleIds = React.useMemo(() => {
    const visible = new Set<ModuleId>();
    for (const m of MODULES) {
      // Role-based gating first
      if (m.id === "admin" && userRole !== "ADMIN") continue;
      if (m.id === "recruiter" && userRole === "JOBSEEKER") continue;
      // Then global nav config (admin can hide any module)
      if (navConfigLoaded && navConfig[m.id] === false) continue;
      visible.add(m.id);
    }
    return visible;
  }, [userRole, navConfig, navConfigLoaded]);

  // Show the System / Admin section only if the admin module survived the filter
  const adminVisible = visibleModuleIds.has("admin");

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSidebar(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSidebar]);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebar(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-5">
          <button
            onClick={() => setModule("dashboard")}
            className="flex items-center gap-2.5"
          >
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground shadow-lg shadow-primary/20">
              <Rocket className="size-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold leading-tight tracking-tight">
                CareerOS
              </p>
              <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
                AI Career Platform
              </p>
            </div>
          </button>
          <button
            onClick={() => setSidebar(false)}
            className="grid size-8 place-items-center rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
          {GROUPS.map((g) => {
            const ids = g.ids.filter((id) => visibleModuleIds.has(id));
            if (ids.length === 0) return null;
            return (
              <div key={g.label} className="mb-4">
                <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  {g.label}
                </p>
                <div className="space-y-0.5">
                  {ids.map((id) => {
                    const m = MODULES.find((x) => x.id === id)!;
                    const Icon = m.icon;
                    const isActive = active === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setModule(id)}
                        className={cn(
                          "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1 text-left truncate">{m.label}</span>
                        {m.badge && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "h-4 px-1 text-[9px] font-semibold",
                              isActive
                                ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                                : "bg-primary/20 text-primary"
                            )}
                          >
                            {m.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Admin */}
          {adminVisible && (
            <div className="mb-2">
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                System
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => setModule("admin")}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active === "admin"
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  {React.createElement(MODULES[MODULES.length - 1].icon, { className: "size-4" })}
                  <span className="flex-1 text-left">Admin Panel</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Upgrade card */}
        <div className="border-t border-sidebar-border p-3">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/90 to-emerald-500/80 p-4 text-primary-foreground">
            <div className="absolute -right-6 -top-6 size-20 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-center gap-1.5">
                <Crown className="size-3.5" />
                <p className="text-xs font-semibold">Upgrade to Pro</p>
              </div>
              <p className="mt-1 text-[11px] text-primary-foreground/80">
                Unlimited resumes, ATS, JD matching & AI coach.
              </p>
              <Button
                size="sm"
                className="mt-3 h-7 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={() => setUpgradeOpen(true)}
              >
                <Sparkles className="mr-1 size-3" /> {userPlan === "FREE" ? "Go Pro — $12/mo" : "Manage Plan"}
              </Button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 px-2">
            <div className="grid size-8 place-items-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
              {firstName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{userName}</p>
              <p className="truncate text-[10px] text-sidebar-foreground/50">
                {userPlan} plan
              </p>
            </div>
          </div>
        </div>
      </aside>
      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
