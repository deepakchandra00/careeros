"use client";

import * as React from "react";
import { BlockType, type PageBlock } from "@/lib/resume/layout-engine";
import type {
  ExperienceItem,
  ProjectItem,
  EducationItem,
  ResumeData,
  SimpleItem,
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
  SectionTitleBlock,
  JobHeaderBlock,
  BulletBlock,
  ParagraphBlock,
  ProjectHeaderBlock,
  ProjectTechBlock,
} from "./blocks";

/**
 * BlockRenderer — maps a PageBlock (from the flow engine) to its React
 * component.
 *
 * The flow engine emits ATOMIC blocks:
 *
 *   - SectionTitle  → standalone section header (keepWithNext)
 *   - JobHeader     → experience entry header (role/company/dates)
 *   - Bullet        → single bullet point
 *   - Paragraph     → text block (splittable across pages)
 *   - ProjectHeader → project name + link
 *   - ProjectTech   → tech-stack chips
 *   - Contact       → name/title/contacts (HeaderBlock)
 *   - EducationEntry → one education item
 *   - Skills / Certifications / Languages / Awards / Publications / Interests
 *                    → atomic section blocks (render their own title)
 *
 * Each block component receives ONLY its own data, which keeps them
 * reusable and PDF-export-safe.
 */
export function BlockRenderer({
  block,
  accent,
  isSidebar = false,
}: {
  block: PageBlock;
  accent: string;
  isSidebar?: boolean;
}) {
  const data = block.data as any;

  switch (block.type) {
    // ── Atomic flow blocks ───────────────────────────────────────────────

    case BlockType.SectionTitle:
      return <SectionTitleBlock data={data} accent={accent} />;

    case BlockType.JobHeader:
      return <JobHeaderBlock data={data as ExperienceItem} accent={accent} />;

    case BlockType.Bullet:
      return <BulletBlock data={data} accent={accent} />;

    case BlockType.Paragraph:
      return <ParagraphBlock data={data} continued={block.continued} />;

    case BlockType.ProjectHeader:
      return <ProjectHeaderBlock data={data as ProjectItem} accent={accent} />;

    case BlockType.ProjectTech:
      return <ProjectTechBlock data={data} />;

    // ── Contact / personal header ────────────────────────────────────────
    case BlockType.Contact:
      return <HeaderBlock data={data as ResumeData} accent={accent} isSidebar={isSidebar} />;

    // ── Legacy summary (unused by flow engine, kept for safety) ──────────
    case BlockType.Summary:
      return <SummaryBlock data={data ?? { text: "" }} accent={accent} />;

    // ── Skills (atomic — renders own title) ──────────────────────────────
    case BlockType.Skills: {
      const skills: string[] = Array.isArray(data?.skills) ? data.skills : Array.isArray(data) ? data : [];
      const sidebar = data?.isSidebar ?? isSidebar;
      return <SkillsBlock data={skills} accent={accent} isSidebar={sidebar} />;
    }

    // ── Education entry (atomic) ─────────────────────────────────────────
    case BlockType.EducationEntry:
      return <EducationBlock data={data as EducationItem} accent={accent} />;

    // ── Legacy whole-education section (unused by flow engine) ───────────
    case BlockType.Education: {
      if (data && Array.isArray(data.items)) {
        return (
          <>
            <SectionTitleBlock data={{ title: "Education", isSidebar }} accent={accent} />
            {data.items.map((item: EducationItem, i: number) => (
              <EducationBlock key={item.id || i} data={item} accent={accent} />
            ))}
          </>
        );
      }
      return null;
    }

    // ── Simple list sections (atomic — render own title) ─────────────────
    case BlockType.Certifications:
    case BlockType.Awards:
    case BlockType.Publications: {
      const items: SimpleItem[] = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      const title = data?.title ?? "Section";
      return (
        <SimpleSectionBlock
          data={items}
          accent={accent}
          title={title}
          isSidebar={data?.isSidebar ?? isSidebar}
        />
      );
    }

    case BlockType.Languages: {
      const items: string[] = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      return <LanguagesBlock data={items} accent={accent} isSidebar={data?.isSidebar ?? isSidebar} />;
    }

    case BlockType.Interests: {
      const items: string[] = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      return <InterestsBlock data={items} accent={accent} />;
    }

    // ── Custom section (atomic — renders own title) ──────────────────────
    case BlockType.CustomSection: {
      const items: SimpleItem[] = Array.isArray(data?.items) ? data.items : [];
      return (
        <CustomSectionBlock
          data={{ title: data?.title ?? "Section", items }}
          accent={accent}
        />
      );
    }

    // ── Legacy entry blocks (unused by flow engine, kept for safety) ─────
    case BlockType.ExperienceEntry:
      return <ExperienceBlock data={data as ExperienceItem} accent={accent} />;

    case BlockType.ProjectEntry:
      return <ProjectsBlock data={data as ProjectItem} accent={accent} />;

    case BlockType.Experience:
    case BlockType.Projects:
      // Legacy whole-section blocks — not emitted by the flow engine.
      return null;

    default:
      return null;
  }
}
