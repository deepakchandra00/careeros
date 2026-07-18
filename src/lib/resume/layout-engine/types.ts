/**
 * Layout Engine Types — Pure TypeScript, no React, no DOM.
 *
 * This module defines the data structures used by the layout pipeline:
 *
 * Resume JSON → Parser → Measurer → Paginator → PageModel → React Renderer
 */

/** Block type enum — safer than string literals */
export enum BlockType {
  Contact = "contact",
  Summary = "summary",
  Experience = "experience",
  ExperienceEntry = "experience_entry",
  Skills = "skills",
  Projects = "projects",
  ProjectEntry = "project_entry",
  Education = "education",
  EducationEntry = "education_entry",
  Certifications = "certifications",
  Languages = "languages",
  Awards = "awards",
  Publications = "publications",
  Interests = "interests",
  CustomSection = "custom_section",
}

/** Insets for padding/margins */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Pagination rules for a block */
export interface PaginationRules {
  /** Don't split this block across pages */
  keepTogether: boolean;
  /** Keep this block with the next one (e.g., section header with first entry) */
  keepWithNext: boolean;
  /** Allow splitting this block into smaller chunks */
  allowSplit: boolean;
  /** Minimum lines at the start of a block on a new page (prevent orphans) */
  widowLines: number;
  /** Minimum lines at the end of a block before a page break (prevent widows) */
  orphanLines: number;
}

/** A layout node — a unit of content that the paginator can place on a page */
export interface LayoutNode {
  id: string;
  type: BlockType;
  /** Estimated height in pixels (computed by the measurer) */
  estimatedHeight: number;
  /** Spacing above this block */
  marginTop: number;
  /** Spacing below this block */
  marginBottom: number;
  /** Pagination rules for this block */
  rules: PaginationRules;
  /** Child nodes (for splittable blocks like Experience) */
  children?: LayoutNode[];
  /** The actual data to render (section data, entry data, etc.) */
  data: unknown;
}

/** A block placed on a page — has absolute position */
export interface PageBlock {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  width: number;
  height: number;
  data: unknown;
}

/** A single page in the page model */
export interface Page {
  pageNumber: number;
  blocks: PageBlock[];
}

/** The complete page model — the output of the pagination engine */
export interface PageModel {
  version: 1;
  pages: Page[];
  totalPages: number;
}

/** Template definition — shared by HTML, DOCX, PDF */
export interface TemplateDefinition {
  id: string;
  version: 1;
  pattern: "sidebar-left" | "sidebar-right" | "header-band" | "single-column";
  theme: {
    headerColor: string;
    fontFamily: string;
    sidebarBg?: string;
    sidebarText?: string;
  };
  layout: {
    page: { width: number; height: number };
    sidebar?: { width: number; background: string; textColor: string };
    contentArea: {
      x: number;
      y: number;
      width: number;
      height: number;
      minPadding: Insets;
      maxPadding: Insets;
    };
  };
}

/** Default page dimensions (A4 at 96 DPI) */
export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

/** Default pagination rules per block type */
export const DEFAULT_PAGINATION_RULES: Record<BlockType, PaginationRules> = {
  [BlockType.Contact]: { keepTogether: true, keepWithNext: false, allowSplit: false, widowLines: 0, orphanLines: 0 },
  [BlockType.Summary]: { keepTogether: true, keepWithNext: false, allowSplit: false, widowLines: 0, orphanLines: 0 },
  [BlockType.Experience]: { keepTogether: false, keepWithNext: false, allowSplit: true, widowLines: 2, orphanLines: 2 },
  [BlockType.ExperienceEntry]: { keepTogether: true, keepWithNext: false, allowSplit: false, widowLines: 0, orphanLines: 0 },
  [BlockType.Skills]: { keepTogether: true, keepWithNext: false, allowSplit: false, widowLines: 0, orphanLines: 0 },
  [BlockType.Projects]: { keepTogether: false, keepWithNext: false, allowSplit: true, widowLines: 2, orphanLines: 2 },
  [BlockType.ProjectEntry]: { keepTogether: true, keepWithNext: false, allowSplit: false, widowLines: 0, orphanLines: 0 },
  [BlockType.Education]: { keepTogether: false, keepWithNext: false, allowSplit: true, widowLines: 1, orphanLines: 1 },
  [BlockType.EducationEntry]: { keepTogether: true, keepWithNext: false, allowSplit: false, widowLines: 0, orphanLines: 0 },
  [BlockType.Certifications]: { keepTogether: true, keepWithNext: false, allowSplit: false, widowLines: 0, orphanLines: 0 },
  [BlockType.Languages]: { keepTogether: true, keepWithNext: false, allowSplit: false, widowLines: 0, orphanLines: 0 },
  [BlockType.Awards]: { keepTogether: true, keepWithNext: false, allowSplit: false, widowLines: 0, orphanLines: 0 },
  [BlockType.Publications]: { keepTogether: true, keepWithNext: false, allowSplit: false, widowLines: 0, orphanLines: 0 },
  [BlockType.Interests]: { keepTogether: true, keepWithNext: false, allowSplit: false, widowLines: 0, orphanLines: 0 },
  [BlockType.CustomSection]: { keepTogether: false, keepWithNext: false, allowSplit: true, widowLines: 1, orphanLines: 1 },
};
