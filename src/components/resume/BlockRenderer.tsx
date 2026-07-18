"use client";

import * as React from "react";
import { BlockType, type PageBlock } from "@/lib/resume/layout-engine";
import type {
  ExperienceItem,
  ProjectItem,
  EducationItem,
  ResumeData,
} from "@/store/resume-store";
import {
  HeaderBlock,
  SummaryBlock,
  ExperienceBlock,
  SkillsBlock,
  ProjectsBlock,
  EducationBlock,
  SimpleSectionBlock,
  LanguagesBlock,
  InterestsBlock,
  CustomSectionBlock,
  SectionHeaderBlock,
} from "./blocks";

/**
 * BlockRenderer — maps a PageBlock (from the layout engine) to its React
 * component.
 *
 * The layout engine emits several flavors of blocks:
 *
 *  1. Entry blocks — a single entry (one experience, one project, one
 *     education item). These are the common case when a section is split
 *     across pages.
 *
 *  2. Section-header blocks — emitted when a section is split across pages.
 *     Identified by `data.isHeader === true`. Rendered as a standalone title.
 *
 *  3. Whole-section blocks — emitted when an entire section fits on one page.
 *     The block's `data` carries `{ items: [...] }` (packed by the parser).
 *     Rendered as a section header followed by the entry blocks.
 *
 *  4. Simple-section blocks — flat list sections (Skills, Certifications,
 *     Languages, Awards, Publications, Interests). The block's `data` IS the
 *     list itself.
 *
 *  5. Contact / Summary — single blocks with their own data shapes.
 *
 * Each block component receives ONLY its own data (never the full resume),
 * which keeps them reusable and PDF-export-safe.
 */
export function BlockRenderer({
  block,
  accent,
}: {
  block: PageBlock;
  accent: string;
}) {
  const data = block.data as any;

  switch (block.type) {
    // ── Contact / personal header ────────────────────────────────────────
    case BlockType.Contact:
      return <HeaderBlock data={data as ResumeData} accent={accent} />;

    // ── Summary ──────────────────────────────────────────────────────────
    case BlockType.Summary:
      // Summary is never split — `data` is always { text }.
      if (data && data.isHeader) return null;
      return <SummaryBlock data={data ?? { text: "" }} accent={accent} />;

    // ── Experience ───────────────────────────────────────────────────────
    case BlockType.Experience:
      // Split-section header (emitted by paginator).
      if (data && data.isHeader) {
        return (
          <SectionHeaderBlock
            accent={accent}
            sectionType={BlockType.Experience}
            isContinuation={!!data.isContinuation}
          />
        );
      }
      // Whole-section block (fits on one page). Render header + entries.
      if (data && Array.isArray(data.items)) {
        return (
          <ExperienceSectionBlock
            items={data.items as ExperienceItem[]}
            accent={accent}
          />
        );
      }
      return null;

    case BlockType.ExperienceEntry:
      return <ExperienceBlock data={data as ExperienceItem} accent={accent} />;

    // ── Skills ───────────────────────────────────────────────────────────
    case BlockType.Skills:
      if (data && data.isHeader) return null;
      return <SkillsBlock data={Array.isArray(data) ? data : []} accent={accent} />;

    // ── Projects ─────────────────────────────────────────────────────────
    case BlockType.Projects:
      if (data && data.isHeader) {
        return (
          <SectionHeaderBlock
            accent={accent}
            sectionType={BlockType.Projects}
            isContinuation={!!data.isContinuation}
          />
        );
      }
      if (data && Array.isArray(data.items)) {
        return (
          <ProjectsSectionBlock
            items={data.items as ProjectItem[]}
            accent={accent}
          />
        );
      }
      return null;

    case BlockType.ProjectEntry:
      return <ProjectsBlock data={data as ProjectItem} accent={accent} />;

    // ── Education ────────────────────────────────────────────────────────
    case BlockType.Education:
      if (data && data.isHeader) {
        return (
          <SectionHeaderBlock
            accent={accent}
            sectionType={BlockType.Education}
            isContinuation={!!data.isContinuation}
          />
        );
      }
      if (data && Array.isArray(data.items)) {
        return (
          <EducationSectionBlock
            items={data.items as EducationItem[]}
            accent={accent}
          />
        );
      }
      return null;

    case BlockType.EducationEntry:
      return <EducationBlock data={data as EducationItem} accent={accent} />;

    // ── Simple list sections ─────────────────────────────────────────────
    case BlockType.Certifications:
      if (data && data.isHeader) return null;
      return (
        <SimpleSectionBlock
          data={Array.isArray(data) ? data : []}
          accent={accent}
          title="Certifications"
        />
      );

    case BlockType.Awards:
      if (data && data.isHeader) return null;
      return (
        <SimpleSectionBlock
          data={Array.isArray(data) ? data : []}
          accent={accent}
          title="Achievements"
        />
      );

    case BlockType.Publications:
      if (data && data.isHeader) return null;
      return (
        <SimpleSectionBlock
          data={Array.isArray(data) ? data : []}
          accent={accent}
          title="Publications"
        />
      );

    case BlockType.Languages:
      if (data && data.isHeader) return null;
      return (
        <LanguagesBlock data={Array.isArray(data) ? data : []} accent={accent} />
      );

    case BlockType.Interests:
      if (data && data.isHeader) return null;
      return (
        <InterestsBlock data={Array.isArray(data) ? data : []} accent={accent} />
      );

    // ── Custom section ───────────────────────────────────────────────────
    case BlockType.CustomSection:
      if (data && data.isHeader) return null;
      return <CustomSectionBlock data={data} accent={accent} />;

    default:
      return null;
  }
}

/**
 * ExperienceSectionBlock — renders a whole Experience section (header + all
 * entries) when the section fits on a single page.
 */
function ExperienceSectionBlock({
  items,
  accent,
}: {
  items: ExperienceItem[];
  accent: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <section style={{ marginBottom: 16 }}>
      <SectionHeaderBlock accent={accent} sectionType={BlockType.Experience} />
      {items.map((item, i) => (
        <ExperienceBlock key={item.id || i} data={item} accent={accent} />
      ))}
    </section>
  );
}

/**
 * ProjectsSectionBlock — renders a whole Projects section (header + all
 * entries) when the section fits on a single page.
 */
function ProjectsSectionBlock({
  items,
  accent,
}: {
  items: ProjectItem[];
  accent: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <section style={{ marginBottom: 16 }}>
      <SectionHeaderBlock accent={accent} sectionType={BlockType.Projects} />
      {items.map((item, i) => (
        <ProjectsBlock key={item.id || i} data={item} accent={accent} />
      ))}
    </section>
  );
}

/**
 * EducationSectionBlock — renders a whole Education section (header + all
 * entries) when the section fits on a single page.
 */
function EducationSectionBlock({
  items,
  accent,
}: {
  items: EducationItem[];
  accent: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <section style={{ marginBottom: 16 }}>
      <SectionHeaderBlock accent={accent} sectionType={BlockType.Education} />
      {items.map((item, i) => (
        <EducationBlock key={item.id || i} data={item} accent={accent} />
      ))}
    </section>
  );
}
