"use client";

import { create } from "zustand";

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  tier: "FREE" | "PRO" | "TEAMS";
}

/**
 * Feature flag store. Seeded with the platform's feature gates.
 * In production these would sync with the backend; here they're client-side
 * for the MVP. Use `isEnabled(key)` to gate UI.
 */
const SEED_FLAGS: FeatureFlag[] = [
  { key: "resume-builder", label: "Resume Builder", description: "AI resume builder with 13 templates", enabled: true, tier: "FREE" },
  { key: "ats-review", label: "ATS Review", description: "Upload & scan resume for ATS score", enabled: true, tier: "FREE" },
  { key: "ai-coach", label: "AI Career Coach", description: "Chat with the AI career coach", enabled: true, tier: "FREE" },
  { key: "coding-practice", label: "Coding Practice", description: "Monaco IDE + AI code review", enabled: true, tier: "FREE" },
  { key: "mock-interview", label: "AI Mock Interview", description: "AI interviewer + camera self-review", enabled: true, tier: "PRO" },
  { key: "recruiter", label: "Recruiter Platform", description: "Source, rank & track candidates", enabled: true, tier: "PRO" },
  { key: "jd-optimizer", label: "JD Optimizer", description: "Match resume to job descriptions", enabled: true, tier: "PRO" },
  { key: "linkedin", label: "LinkedIn Optimizer", description: "AI LinkedIn profile optimization", enabled: true, tier: "PRO" },
  { key: "naukri", label: "Naukri Optimizer", description: "Boost Naukri search visibility", enabled: true, tier: "PRO" },
  { key: "portfolio", label: "Portfolio Builder", description: "Resume → website in one click", enabled: true, tier: "PRO" },
  { key: "salary", label: "Salary Predictor", description: "Market salary insights", enabled: true, tier: "PRO" },
  { key: "learning-hub", label: "Learning Hub", description: "Courses, flashcards & roadmaps", enabled: true, tier: "FREE" },
  { key: "export-pdf", label: "PDF Export", description: "Download resume as PDF", enabled: true, tier: "FREE" },
  { key: "export-docx", label: "Word Export", description: "Download resume as .docx", enabled: true, tier: "PRO" },
  { key: "resume-import", label: "Resume Import", description: "Upload PDF/DOCX to auto-fill", enabled: true, tier: "FREE" },
  { key: "teams", label: "Team Edition", description: "Shared templates & bulk reviews", enabled: false, tier: "TEAMS" },
];

interface FlagStore {
  flags: FeatureFlag[];
  toggle: (key: string) => void;
  setEnabled: (key: string, enabled: boolean) => void;
  isEnabled: (key: string) => boolean;
  reset: () => void;
}

export const useFeatureFlags = create<FlagStore>((set, get) => ({
  flags: SEED_FLAGS,
  toggle: (key) =>
    set((s) => ({
      flags: s.flags.map((f) =>
        f.key === key ? { ...f, enabled: !f.enabled } : f
      ),
    })),
  setEnabled: (key, enabled) =>
    set((s) => ({
      flags: s.flags.map((f) => (f.key === key ? { ...f, enabled } : f)),
    })),
  isEnabled: (key) => {
    const f = get().flags.find((f) => f.key === key);
    return f ? f.enabled : true; // default enabled if unknown
  },
  reset: () => set({ flags: SEED_FLAGS }),
}));
