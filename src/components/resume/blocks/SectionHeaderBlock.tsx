"use client";

import * as React from "react";
import { SectionTitle } from "./SummaryBlock";
import { BlockType } from "@/lib/resume/layout-engine";

/**
 * SectionHeaderBlock — renders a standalone section title.
 *
 * The paginator emits this block (with `data.isHeader = true`) when a section
 * is split across pages: once at the start of the section, and again as a
 * "continuation" header at the top of each subsequent page.
 *
 * The title text is derived from the block's `sectionType` (a BlockType enum
 * value). Continuation headers are rendered slightly smaller and without the
 * underline, to visually distinguish them from a fresh section start.
 */
export function SectionHeaderBlock({
  accent,
  sectionType,
  isContinuation,
}: {
  accent: string;
  sectionType: BlockType;
  isContinuation?: boolean;
}) {
  const title = titleForSection(sectionType);
  if (!title) return null;

  if (isContinuation) {
    return (
      <h2
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: accent,
          textTransform: "uppercase",
          letterSpacing: 1,
          margin: "0 0 8px 0",
          opacity: 0.75,
          breakInside: "avoid" as const,
        }}
      >
        {title} <span style={{ fontWeight: 400 }}>(continued)</span>
      </h2>
    );
  }

  return <SectionTitle accent={accent}>{title}</SectionTitle>;
}

/** Human-readable title for each section type. */
export function titleForSection(type: BlockType): string {
  switch (type) {
    case BlockType.Experience:
      return "Experience";
    case BlockType.Projects:
      return "Projects";
    case BlockType.Education:
      return "Education";
    case BlockType.Skills:
      return "Skills";
    case BlockType.Certifications:
      return "Certifications";
    case BlockType.Languages:
      return "Languages";
    case BlockType.Awards:
      return "Achievements";
    case BlockType.Publications:
      return "Publications";
    case BlockType.Interests:
      return "Interests";
    case BlockType.Summary:
      return "Profile";
    case BlockType.Contact:
      return "Contact";
    case BlockType.CustomSection:
      return "Section";
    default:
      return "";
  }
}
