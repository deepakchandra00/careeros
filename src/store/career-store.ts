"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Career Intelligence Store — shared across modules.
 *
 * Each module (LinkedIn, Naukri, ATS Review, Salary, Interview) stores its
 * latest analysis score here. The Career Intelligence module reads all scores
 * to compute a unified Career Health score.
 *
 * Persisted to localStorage so scores survive page reloads.
 */

export interface ModuleScore {
  /** 0-100 score, or null if not yet analyzed */
  score: number | null;
  /** ISO timestamp of last analysis */
  analyzedAt: string | null;
  /** Optional short label (e.g. "72/100 SEO") */
  label?: string;
}

export interface CareerSnapshot {
  resume: ModuleScore;
  linkedin: ModuleScore;
  naukri: ModuleScore;
  github: ModuleScore;
  portfolio: ModuleScore;
  interview: ModuleScore;
  coding: ModuleScore;
  salary: ModuleScore;
}

export interface CareerInsight {
  overallScore: number;
  betterThanPercent: number;
  roleComparison: string;
  topMatchingRoles: { role: string; stars: number; matchPercent: number }[];
  recommendations: string[];
  salaryRange: { min: number; max: number; currency: string } | null;
  generatedAt: string;
}

interface CareerStoreState {
  scores: CareerSnapshot;
  insight: CareerInsight | null;
  setScore: (
    module: keyof CareerSnapshot,
    score: number,
    label?: string
  ) => void;
  getScore: (module: keyof CareerSnapshot) => ModuleScore;
  getAllScores: () => CareerSnapshot;
  getComputedOverall: () => number;
  setInsight: (insight: CareerInsight) => void;
  clearAll: () => void;
}

const EMPTY_SCORE: ModuleScore = { score: null, analyzedAt: null };

const EMPTY_SNAPSHOT: CareerSnapshot = {
  resume: { ...EMPTY_SCORE },
  linkedin: { ...EMPTY_SCORE },
  naukri: { ...EMPTY_SCORE },
  github: { ...EMPTY_SCORE },
  portfolio: { ...EMPTY_SCORE },
  interview: { ...EMPTY_SCORE },
  coding: { ...EMPTY_SCORE },
  salary: { ...EMPTY_SCORE },
};

export const useCareerStore = create<CareerStoreState>()(
  persist(
    (set, get) => ({
      scores: { ...EMPTY_SNAPSHOT },
      insight: null,

      setScore: (module, score, label) =>
        set((state) => ({
          scores: {
            ...state.scores,
            [module]: { score, analyzedAt: new Date().toISOString(), label },
          },
        })),

      getScore: (module) => get().scores[module],

      getAllScores: () => get().scores,

      getComputedOverall: () => {
        const s = get().scores;
        const entries = Object.values(s).filter((v) => v.score !== null);
        if (entries.length === 0) return 0;
        const sum = entries.reduce((acc, v) => acc + (v.score ?? 0), 0);
        return Math.round(sum / entries.length);
      },

      setInsight: (insight) => set({ insight }),

      clearAll: () => set({ scores: { ...EMPTY_SNAPSHOT }, insight: null }),
    }),
    {
      name: "careeros-career-store",
      version: 1,
    }
  )
);

/** Convenience helper for non-React code. */
export function getCareerScores(): CareerSnapshot {
  return useCareerStore.getState().scores;
}
