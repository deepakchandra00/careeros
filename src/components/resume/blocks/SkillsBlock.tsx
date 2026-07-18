"use client";

import * as React from "react";
import type { SkillsBlockData } from "./types";
import { SectionTitle } from "./SummaryBlock";

interface SkillsBlockProps {
  data: SkillsBlockData;
  accent: string;
  isSidebar?: boolean;
}

/**
 * SkillsBlock — renders a list of skills as chips/pills.
 *
 * When `isSidebar` is true, renders with white/translucent chips on colored background.
 * When false, renders with accent-tinted chips on white background.
 */
export function SkillsBlock({ data, accent, isSidebar = false }: SkillsBlockProps) {
  const skills = (data || []).filter((s: string) => s?.trim());
  if (skills.length === 0) return null;

  const chipStyle = isSidebar
    ? {
        fontSize: 10,
        lineHeight: 1.4,
        color: "#ffffff",
        background: "rgba(255,255,255,0.15)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: 4,
        padding: "3px 8px",
        fontWeight: 500,
        whiteSpace: "nowrap" as const,
      }
    : {
        fontSize: 10,
        lineHeight: 1.4,
        color: accent,
        background: hexToRgba(accent, 0.1),
        border: `1px solid ${hexToRgba(accent, 0.35)}`,
        borderRadius: 4,
        padding: "3px 8px",
        fontWeight: 500,
        whiteSpace: "nowrap" as const,
      };

  return (
    <section style={{ marginBottom: 16, breakInside: "avoid" as const }}>
      <SectionTitle accent={accent} isSidebar={isSidebar}>Skills</SectionTitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {skills.map((s: string, i: number) => (
          <span key={i} style={chipStyle}>{s}</span>
        ))}
      </div>
    </section>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
