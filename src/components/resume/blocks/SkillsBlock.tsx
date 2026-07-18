"use client";

import * as React from "react";
import type { BlockProps, SkillsBlockData } from "./types";
import { SectionTitle } from "./SummaryBlock";

/**
 * SkillsBlock — renders a list of skills as chips/pills.
 *
 * Chips wrap to multiple lines as needed. The chip background uses a soft
 * tint of the accent color (10% opacity) with the accent color for the text
 * and a thin accent border, giving a clean, modern look that works on both
 * light and dark template backgrounds.
 */
export function SkillsBlock({ data, accent }: BlockProps<SkillsBlockData>) {
  const skills = (data || []).filter((s) => s?.trim());
  if (skills.length === 0) return null;

  return (
    <section
      style={{
        marginBottom: 16,
        breakInside: "avoid" as const,
      }}
    >
      <SectionTitle accent={accent}>Skills</SectionTitle>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {skills.map((s, i) => (
          <span
            key={i}
            style={{
              fontSize: 10,
              lineHeight: 1.4,
              color: accent,
              background: hexToRgba(accent, 0.1),
              border: `1px solid ${hexToRgba(accent, 0.35)}`,
              borderRadius: 4,
              padding: "3px 8px",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}

/** Convert a #RRGGBB hex string to an rgba() string with the given alpha. */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
