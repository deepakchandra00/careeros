/**
 * Shared prop types for block components.
 *
 * Block components are intentionally small and self-contained: each receives
 * ONLY its own data (never the full resume) plus the accent color. This makes
 * them safe to render in isolation — required for the block-based renderer
 * and for PDF export.
 */
import type {
  ExperienceItem,
  ProjectItem,
  EducationItem,
  SimpleItem,
  ResumeData,
} from "@/store/resume-store";

export interface BlockProps<T> {
  data: T;
  accent: string;
}

/** Convenience aliases for each block's data shape. */
export type HeaderBlockData = ResumeData;
export type SummaryBlockData = { text: string };
export type ExperienceBlockData = ExperienceItem;
export type SkillsBlockData = string[];
export type ProjectsBlockData = ProjectItem;
export type EducationBlockData = EducationItem;
export type SimpleSectionData = SimpleItem[];
export type CustomSectionData = { title: string; items: SimpleItem[] };

/**
 * A "section" block — produced by the parser when a whole section (Experience,
 * Projects, Education, CustomSection) is placed on a page as a single unit.
 * The `items` array is the list of entries to render under the section header.
 */
export interface SectionItemsPayload<T = unknown> {
  items: T[];
}

/**
 * A "section header" block — produced by the paginator when a section is split
 * across pages. The header renders on its own, followed by entry blocks.
 */
export interface SectionHeaderPayload {
  isHeader?: boolean;
  isContinuation?: boolean;
  sectionType?: unknown;
  sectionData?: unknown;
}
