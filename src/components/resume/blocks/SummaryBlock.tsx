"use client";

import * as React from "react";
import type { BlockProps, SummaryBlockData } from "./types";

/**
 * SummaryBlock — renders the professional summary as a single paragraph.
 *
 * Includes a "Profile" section header in the accent color. The summary text
 * is rendered with a comfortable line-height for readability.
 */
export function SummaryBlock({ data, accent }: BlockProps<SummaryBlockData>) {
  const text = (data?.text ?? "").trim();
  if (!text) return null;

  return (
    <section
      style={{
        marginBottom: 16,
        breakInside: "avoid" as const,
      }}
    >
      <SectionTitle accent={accent}>Profile</SectionTitle>
      <p
        style={{
          fontSize: 10.5,
          lineHeight: 1.7,
          color: "#444",
          margin: 0,
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </p>
    </section>
  );
}

/**
 * SectionTitle — a small, reusable section header used by all blocks that
 * need a labeled section (Summary, Skills, Certifications, etc.).
 *
 * It renders the title in uppercase, accent-colored, with a thin accent
 * underline. Kept here so simple-section blocks can share the look without
 * importing a separate file.
 */
export function SectionTitle({
  children,
  accent,
  isSidebar = false,
}: {
  children: React.ReactNode;
  accent: string;
  isSidebar?: boolean;
}) {
  return (
    <h2
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: isSidebar ? "rgba(255,255,255,0.7)" : accent,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        margin: "0 0 8px 0",
        paddingBottom: 4,
        borderBottom: isSidebar
          ? "1.5px solid rgba(255,255,255,0.2)"
          : `1.5px solid ${accent}`,
      }}
    >
      {children}
    </h2>
  );
}
