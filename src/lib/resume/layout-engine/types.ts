/**
 * Layout Engine Types — Pure TypeScript, no React, no DOM.
 *
 * REDESIGNED around flow-based pagination.
 *
 * The resume is flattened into a list of ATOMIC renderable units (FlowNodes):
 *
 *   Resume
 *   ├── SectionTitle  ("EXPERIENCE")
 *   ├── JobHeader      (role · company · dates)
 *   ├── Bullet         (one bullet point)
 *   ├── Bullet
 *   ├── JobHeader
 *   ├── Bullet
 *   ...
 *
 * The paginator walks this flat list and places each atom on a page,
 * filling every page to 100% before starting a new one. Paragraphs can
 * split mid-text; bullets flow individually; section/job headers stick
 * to their following content (keepWithNext).
 *
 * Pipeline:
 *   Resume JSON → buildFlow() → FlowNode[] → paginate() → PageModel
 */

/** Block type enum — identifies which React component renders a block */
export enum BlockType {
  // ── Legacy section types (still used by simple/atomic sections) ──
  Contact = "contact",
  Summary = "summary",           // legacy: whole-summary block (unused by flow engine)
  Experience = "experience",     // legacy: whole-experience section (unused by flow engine)
  ExperienceEntry = "experience_entry",
  Skills = "skills",
  Projects = "projects",         // legacy: whole-projects section (unused by flow engine)
  ProjectEntry = "project_entry",
  Education = "education",       // legacy: whole-education section (unused by flow engine)
  EducationEntry = "education_entry",
  Certifications = "certifications",
  Languages = "languages",
  Awards = "awards",
  Publications = "publications",
  Interests = "interests",
  CustomSection = "custom_section",

  // ── Atomic flow units (emitted by the flow engine) ──
  /** A standalone section title (e.g. "EXPERIENCE", "EDUCATION"). */
  SectionTitle = "section_title",
  /** An experience entry header: role, company, dates, location. No bullets. */
  JobHeader = "job_header",
  /** A single bullet point. */
  Bullet = "bullet",
  /** A text paragraph (summary text, project description). Splittable. */
  Paragraph = "paragraph",
  /** A project entry header: name + link. */
  ProjectHeader = "project_header",
  /** Tech-stack chips for a project. */
  ProjectTech = "project_tech",
}

/** Insets for padding/margins */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * FlowNode — the smallest renderable unit.
 *
 * Produced by `buildFlow()`. Each node carries its own measured height so
 * the paginator can decide placement without re-measuring.
 */
export interface FlowNode {
  id: string;
  type: BlockType;
  /** The data passed to the React block component. */
  data: unknown;
  /** Measured height in pixels (including internal margins). */
  height: number;
  /** Keep this node with the next one (section titles, job headers). */
  keepWithNext?: boolean;
  /** This node's text can be split across pages (paragraphs). */
  splittable?: boolean;
  /** Force a page break before this node (manual break). */
  forceBreak?: boolean;
  /** Which column this node belongs to. */
  column?: "main" | "sidebar";
  /** Section ID for grouping (keepTogether / page breaks). */
  sectionId?: string;

  // ── Splittable-text metadata (only for splittable nodes) ──
  text?: string;
  lineHeight?: number;
  charsPerLine?: number;
}

/**
 * RenderedBlock — a FlowNode that has been placed on a page.
 *
 * This is what the React BlockRenderer receives. It's a slimmed-down
 * FlowNode (no pagination metadata, just render data).
 */
export interface PageBlock {
  id: string;
  type: BlockType;
  data: unknown;
  height: number;
  /** True if this block is a continuation of content from the previous page. */
  continued?: boolean;
  /** Section ID (for highlighting / inspector). */
  sectionId?: string;
}

/** A single page in the page model */
export interface Page {
  pageNumber: number;
  /** Main content column blocks. */
  blocks: PageBlock[];
  /** Sidebar column blocks (sidebar templates only). */
  sidebarBlocks: PageBlock[];
}

/** The complete page model — the output of the flow engine */
export interface PageModel {
  version: 2;
  pages: Page[];
  totalPages: number;
}

/** Default page dimensions (A4 at 96 DPI) */
export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;
