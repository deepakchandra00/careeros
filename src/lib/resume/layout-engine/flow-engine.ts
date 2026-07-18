/**
 * Flow-Based Layout Engine — Pure TypeScript, no React, no DOM.
 *
 * This replaces the old section-level parser/measurer/paginator trio.
 *
 * The resume is flattened into a list of ATOMIC renderable units (FlowNodes):
 *
 *   SectionTitle("Experience")
 *   JobHeader(Google — Senior Engineer — 2020-2024)
 *   Bullet("Built X using Y...")
 *   Bullet("Led team of Z...")
 *   JobHeader(Microsoft — ...)
 *   Bullet(...)
 *
 * The paginator walks this flat list and places each atom on a page:
 *   - Section titles & job headers use keepWithNext (stick to following content)
 *   - Paragraphs split mid-text across pages (line-by-line)
 *   - Bullets flow individually (no "move whole job" behaviour)
 *   - Every page is filled to 100% before starting a new one
 *
 * Sidebar content is paginated independently in the sidebar column.
 *
 * Pipeline:
 *   Resume JSON → buildFlow() → { mainGroups, sidebarGroups }
 *              → paginateFlow(main) + paginateFlow(sidebar)
 *              → merge → PageModel
 */

import type {
  ResumeData,
  SectionSettings,
  ExperienceItem,
  ProjectItem,
  EducationItem,
  SimpleItem,
  CustomSection,
} from "@/store/resume-store";
import {
  BlockType,
  A4_WIDTH,
  A4_HEIGHT,
  type Insets,
  type FlowNode,
  type PageBlock,
  type Page,
  type PageModel,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Measurement constants (calibrated against actual rendered block heights)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Average character width at 10pt sans-serif (px). Used for line wrapping.
 * Calibrated to 6.5px based on browser measurements (actual ~6.4px per char
 * at 10pt in a 512px-wide container → ~79 chars/line).
 */
const CHAR_WIDTH = 6.5;
/** Line height for body text / bullets (px). Matches block components. */
const LINE_HEIGHT = 16;
/** Section title height: 12px font + 4px pad + 8px margin + buffer. */
const SECTION_TITLE_HEIGHT = 36;
/** Job header height: role line (~14px) + company line (~14px) + 8px margin + buffer. */
const JOB_HEADER_HEIGHT = 44;
/** Per-bullet line height (matches BulletBlock div). */
const BULLET_LINE_HEIGHT = 16;
/** Per-bullet bottom margin (matches BulletBlock marginBottom: 4). */
const BULLET_MARGIN = 4;
/** Bullet text indent (left padding for the bullet marker). */
const BULLET_INDENT = 12;
/** Skill chip height including gap. */
const SKILL_CHIP_HEIGHT = 26;
/** Skills per row in the main column. */
const SKILLS_PER_ROW_MAIN = 6;
/** Skills per row in the narrow sidebar. */
const SKILLS_PER_ROW_SIDEBAR = 2;
/** Skills section bottom margin. */
const SKILLS_MARGIN_BOTTOM = 16;
/** Education entry height (degree + school + optional grade/location). */
const EDUCATION_ENTRY_HEIGHT = 42;
/** Education entry bottom margin. */
const EDUCATION_ENTRY_MARGIN = 8;
/** Simple-list item height (title + optional subtitle/date). */
const SIMPLE_ITEM_HEIGHT = 32;
/** Simple-list item margin. */
const SIMPLE_ITEM_MARGIN = 6;
/** Languages / interests section height (title + one line). */
const LANGUAGES_HEIGHT = 52;
/** Project header height (name + link line). */
const PROJECT_HEADER_HEIGHT = 24;
/** Project tech chips height (one row + margin). */
const PROJECT_TECH_HEIGHT = 24;
/** Project entry bottom margin. */
const PROJECT_MARGIN = 12;
/** Section bottom margin (gap between sections). */
const SECTION_GAP = 16;
/**
 * Inter-block vertical spacing. Each rendered block has a marginBottom
 * (from the block component styles) that creates a gap between blocks.
 * This constant is added to every node's measured height so the
 * paginator accounts for these gaps. Calibrated to 12px (average of
 * section marginBottom:16, header marginBottom:16, bullet marginBottom:4,
 * plus line-height rounding).
 */
const BLOCK_SPACING = 12;

/**
 * Safety factor applied to available height for sidebar-left, sidebar-right,
 * and single-column patterns. Accounts for measurement underestimation.
 * 0.90 = reserve 10% buffer.
 */
const HEIGHT_SAFETY_FACTOR = 0.90;

/**
 * Safety factor for header-band patterns. Header bands need a larger buffer
 * because the header block (name+contacts) renders below the band and the
 * layout has more unpredictable spacing. 0.80 = reserve 20% buffer.
 */
const HEADER_BAND_SAFETY_FACTOR = 0.80;

// ─────────────────────────────────────────────────────────────────────────────
// Layout context — passed in by the component layer
// ─────────────────────────────────────────────────────────────────────────────

export type TemplatePattern = "sidebar-left" | "sidebar-right" | "header-band" | "single-column";

export interface LayoutContext {
  pattern: TemplatePattern;
  sidebarWidth: number;
  /** Header band height (header-band pattern only). 0 otherwise. */
  headerBandHeight: number;
  padding: Insets;
  pageWidth: number;
  pageHeight: number;
}

/** Sections that render in the sidebar column (for sidebar-left/right patterns). */
const SIDEBAR_SECTION_IDS = new Set([
  "personal",
  "skills",
  "languages",
  "certifications",
  "interests",
]);

/**
 * For header-band patterns, there is NO separate sidebar column —
 * all sections flow in the main column. (The header band is just a
 * decorative top strip; content below it is single-column.)
 */
const HEADER_BAND_SIDEBAR_IDS = new Set<string>([]);

// ─────────────────────────────────────────────────────────────────────────────
// Section group — a section's nodes + pagination preferences
// ─────────────────────────────────────────────────────────────────────────────

interface SectionGroup {
  sectionId: string;
  keepTogether: boolean;
  startOnNewPage: boolean;
  nodes: FlowNode[];
}

// ─────────────────────────────────────────────────────────────────────────────
// buildFlow — ResumeData → { mainGroups, sidebarGroups }
// ─────────────────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);

/** Compute characters per line for a given content width. */
function charsPerLine(widthPx: number, indent = 0): number {
  return Math.max(8, Math.floor((widthPx - indent) / CHAR_WIDTH));
}

/** Greedy word-wrap: split text into lines no longer than charsPerLine. */
function wrapText(text: string, charsPerLine: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (line.length === 0) {
      line = word;
    } else if (line.length + 1 + word.length <= charsPerLine) {
      line += " " + word;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Measure a paragraph's height given text and content width. */
function measureParagraph(text: string, widthPx: number, indent = 0): number {
  const cpl = charsPerLine(widthPx, indent);
  const lines = wrapText(text, cpl);
  return lines.length * LINE_HEIGHT;
}

/** Measure a single bullet's height (including margin). */
function measureBullet(text: string, widthPx: number): number {
  const cpl = charsPerLine(widthPx, BULLET_INDENT);
  const lines = wrapText(text, cpl);
  return lines.length * BULLET_LINE_HEIGHT + BULLET_MARGIN;
}

/** Measure the header block (name + title + contacts). */
function measureHeader(data: ResumeData, isSidebar: boolean): number {
  let h = 0;
  if (isSidebar) {
    h += 80 + 12; // photo circle + margin
    h += 22; // name
    if (data.title) h += 14;
    const contacts = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
    h += contacts.length * 14 + 8;
    h += 20; // bottom margin
  } else {
    h += 30; // name (26px font + line height)
    if (data.title) h += 18;
    const contacts = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
    h += Math.max(1, Math.ceil(contacts.length / 4)) * 15 + 8;
    h += 16; // bottom margin
  }
  return h;
}

/** Measure the skills section (chips). */
function measureSkills(skills: string[], isSidebar: boolean): number {
  if (!skills.length) return 0;
  const perRow = isSidebar ? SKILLS_PER_ROW_SIDEBAR : SKILLS_PER_ROW_MAIN;
  const rows = Math.ceil(skills.length / perRow);
  return SECTION_TITLE_HEIGHT + rows * SKILL_CHIP_HEIGHT + SKILLS_MARGIN_BOTTOM;
}

/** Measure the languages / interests section. */
function measureLanguagesSection(): number {
  return LANGUAGES_HEIGHT + SECTION_GAP;
}

/** Measure a simple list section (certifications, awards, publications). */
function measureSimpleList(items: SimpleItem[], widthPx: number): number {
  if (!items.length) return 0;
  let h = SECTION_TITLE_HEIGHT;
  for (const item of items) {
    const titleLines = wrapText(item.title || "", charsPerLine(widthPx, 10)).length;
    h += titleLines * LINE_HEIGHT;
    if (item.subtitle) h += LINE_HEIGHT;
    if (item.date) h += 0; // date is on the same line as title
    h += SIMPLE_ITEM_MARGIN;
  }
  return h + SECTION_GAP;
}

/**
 * Build the flow: ResumeData → { mainGroups, sidebarGroups }.
 *
 * Each section becomes a SectionGroup with a flat list of atomic FlowNodes.
 * The group is routed to the main or sidebar column based on the template
 * pattern.
 */
function buildFlow(
  data: ResumeData,
  sectionOrder: string[],
  sectionSettings: Record<string, SectionSettings> | undefined,
  ctx: LayoutContext
): { mainGroups: SectionGroup[]; sidebarGroups: SectionGroup[] } {
  const mainGroups: SectionGroup[] = [];
  const sidebarGroups: SectionGroup[] = [];

  const isSidebarPattern = ctx.pattern === "sidebar-left" || ctx.pattern === "sidebar-right";
  const isHeaderBand = ctx.pattern === "header-band";

  // Effective content widths
  const mainWidth = ctx.pageWidth - ctx.sidebarWidth - ctx.padding.left - ctx.padding.right;
  const sidebarWidth = ctx.sidebarWidth > 0 ? ctx.sidebarWidth - 32 : 0; // 16px padding each side

  // Which sections go to the sidebar?
  const sidebarIds = isSidebarPattern
    ? SIDEBAR_SECTION_IDS
    : isHeaderBand
    ? HEADER_BAND_SIDEBAR_IDS
    : new Set<string>();

  for (const sectionId of sectionOrder) {
    const settings = sectionSettings?.[sectionId];
    const goesToSidebar = sidebarIds.has(sectionId);
    const columnWidth = goesToSidebar ? sidebarWidth : mainWidth;

    const group = buildSection(sectionId, data, columnWidth, goesToSidebar, settings);
    if (!group || group.nodes.length === 0) continue;

    if (goesToSidebar) {
      sidebarGroups.push(group);
    } else {
      mainGroups.push(group);
    }
  }

  return { mainGroups, sidebarGroups };
}

/** Build a single section into a SectionGroup. */
function buildSection(
  sectionId: string,
  data: ResumeData,
  width: number,
  isSidebar: boolean,
  settings: SectionSettings | undefined
): SectionGroup | null {
  const group: SectionGroup = {
    sectionId,
    keepTogether: !!settings?.keepTogether,
    startOnNewPage: !!settings?.startOnNewPage,
    nodes: [],
  };

  switch (sectionId) {
    case "personal": {
      group.nodes.push({
        id: uid(),
        type: BlockType.Contact,
        data: data,
        height: measureHeader(data, isSidebar),
        column: isSidebar ? "sidebar" : "main",
        sectionId,
      });
      break;
    }

    case "summary": {
      const text = (data.summary || "").trim();
      if (!text) return null;
      group.nodes.push({
        id: uid(),
        type: BlockType.SectionTitle,
        data: { title: "Profile", isSidebar },
        height: SECTION_TITLE_HEIGHT,
        keepWithNext: true,
        sectionId,
      });
      group.nodes.push({
        id: uid(),
        type: BlockType.Paragraph,
        data: { text },
        height: measureParagraph(text, width) + SECTION_GAP,
        splittable: true,
        text,
        lineHeight: LINE_HEIGHT,
        charsPerLine: charsPerLine(width),
        sectionId,
      });
      break;
    }

    case "experience": {
      if (!data.experience?.length) return null;
      group.nodes.push({
        id: uid(),
        type: BlockType.SectionTitle,
        data: { title: "Experience", isSidebar },
        height: SECTION_TITLE_HEIGHT,
        keepWithNext: true,
        sectionId,
      });
      for (const exp of data.experience) {
        const bullets = (exp.bullets || []).filter((b) => b?.trim());
        group.nodes.push({
          id: uid(),
          type: BlockType.JobHeader,
          data: exp,
          height: JOB_HEADER_HEIGHT,
          keepWithNext: bullets.length > 0,
          sectionId,
        });
        for (const b of bullets) {
          group.nodes.push({
            id: uid(),
            type: BlockType.Bullet,
            data: { text: b },
            height: measureBullet(b, width),
            sectionId,
          });
        }
      }
      // Add section gap to the last node
      if (group.nodes.length > 0) {
        group.nodes[group.nodes.length - 1].height += SECTION_GAP;
      }
      break;
    }

    case "skills": {
      if (!data.skills?.length) return null;
      group.nodes.push({
        id: uid(),
        type: BlockType.Skills,
        data: { skills: data.skills, isSidebar },
        height: measureSkills(data.skills, isSidebar),
        column: isSidebar ? "sidebar" : "main",
        sectionId,
      });
      break;
    }

    case "projects": {
      if (!data.projects?.length) return null;
      group.nodes.push({
        id: uid(),
        type: BlockType.SectionTitle,
        data: { title: "Projects", isSidebar },
        height: SECTION_TITLE_HEIGHT,
        keepWithNext: true,
        sectionId,
      });
      for (const proj of data.projects) {
        const tech = (proj.tech || []).filter((t) => t?.trim());
        group.nodes.push({
          id: uid(),
          type: BlockType.ProjectHeader,
          data: proj,
          height: PROJECT_HEADER_HEIGHT,
          keepWithNext: true,
          sectionId,
        });
        if (proj.description?.trim()) {
          group.nodes.push({
            id: uid(),
            type: BlockType.Paragraph,
            data: { text: proj.description },
            height: measureParagraph(proj.description, width),
            splittable: true,
            text: proj.description,
            lineHeight: LINE_HEIGHT,
            charsPerLine: charsPerLine(width),
            sectionId,
          });
        }
        if (tech.length > 0) {
          group.nodes.push({
            id: uid(),
            type: BlockType.ProjectTech,
            data: { tech },
            height: PROJECT_TECH_HEIGHT,
            sectionId,
          });
        }
        // Entry margin
        if (group.nodes.length > 0) {
          group.nodes[group.nodes.length - 1].height += PROJECT_MARGIN;
        }
      }
      break;
    }

    case "education": {
      if (!data.education?.length) return null;
      group.nodes.push({
        id: uid(),
        type: BlockType.SectionTitle,
        data: { title: "Education", isSidebar },
        height: SECTION_TITLE_HEIGHT,
        keepWithNext: true,
        sectionId,
      });
      for (const edu of data.education) {
        let h = EDUCATION_ENTRY_HEIGHT;
        if (edu.grade) h += LINE_HEIGHT;
        group.nodes.push({
          id: uid(),
          type: BlockType.EducationEntry,
          data: edu,
          height: h + EDUCATION_ENTRY_MARGIN,
          sectionId,
        });
      }
      if (group.nodes.length > 0) {
        group.nodes[group.nodes.length - 1].height += SECTION_GAP;
      }
      break;
    }

    case "certifications": {
      if (!data.certifications?.length) return null;
      // SimpleSectionBlock renders its own title — no separate SectionTitle atom.
      group.nodes.push({
        id: uid(),
        type: BlockType.Certifications,
        data: { items: data.certifications, title: "Certifications", isSidebar },
        height: measureSimpleList(data.certifications, width),
        sectionId,
      });
      break;
    }

    case "languages": {
      if (!data.languages?.length) return null;
      // LanguagesBlock renders its own title.
      group.nodes.push({
        id: uid(),
        type: BlockType.Languages,
        data: { items: data.languages, isSidebar },
        height: measureLanguagesSection(),
        sectionId,
      });
      break;
    }

    case "awards": {
      if (!data.awards?.length) return null;
      // SimpleSectionBlock renders its own title.
      group.nodes.push({
        id: uid(),
        type: BlockType.Awards,
        data: { items: data.awards, title: "Achievements", isSidebar },
        height: measureSimpleList(data.awards, width),
        sectionId,
      });
      break;
    }

    case "publications": {
      if (!data.publications?.length) return null;
      // SimpleSectionBlock renders its own title.
      group.nodes.push({
        id: uid(),
        type: BlockType.Publications,
        data: { items: data.publications, title: "Publications", isSidebar },
        height: measureSimpleList(data.publications, width),
        sectionId,
      });
      break;
    }

    case "interests": {
      if (!data.interests?.length) return null;
      // InterestsBlock renders its own title.
      group.nodes.push({
        id: uid(),
        type: BlockType.Interests,
        data: { items: data.interests, isSidebar },
        height: measureLanguagesSection(),
        sectionId,
      });
      break;
    }

    case "references":
      return null;

    default: {
      // Custom section — CustomSectionBlock renders its own title.
      const custom = data.customSections?.find(
        (cs) => cs.id === sectionId || cs.title.toLowerCase() === sectionId
      );
      if (!custom || !custom.items?.length) return null;
      group.nodes.push({
        id: uid(),
        type: BlockType.CustomSection,
        data: { title: custom.title, items: custom.items, isSidebar },
        height: measureSimpleList(custom.items, width),
        sectionId,
      });
      break;
    }
  }

  return group.nodes.length > 0 ? group : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// paginateFlow — flow-based pagination on atomic blocks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Paginate a list of section groups into pages of RenderedBlocks.
 *
 * Algorithm:
 *   For each group:
 *     - If startOnNewPage: flush current page first.
 *     - If keepTogether: try to fit the whole group on the current page.
 *       If it doesn't fit, flush and try on a fresh page. If it STILL
 *       doesn't fit (taller than a full page), fall back to normal flow.
 *     - Otherwise (normal flow): place nodes one by one.
 *       - keepWithNext nodes: ensure header + next atom fit, else flush.
 *       - splittable nodes: split text across pages line-by-line.
 *       - atomic nodes: if they don't fit, flush first.
 *
 * Every page is filled to 100% before starting a new one.
 */
function paginateFlow(groups: SectionGroup[], availableHeight: number): PageBlock[][] {
  const pages: PageBlock[][] = [];
  let current: PageBlock[] = [];
  let y = 0;

  const flush = () => {
    if (current.length > 0) {
      pages.push(current);
      current = [];
      y = 0;
    }
  };

  const remaining = () => availableHeight - y;

  const place = (node: FlowNode, overrides?: Partial<PageBlock>) => {
    current.push({
      id: node.id,
      type: node.type,
      data: node.data,
      height: node.height,
      sectionId: node.sectionId,
      ...overrides,
    });
    y += node.height;
  };

  for (const group of groups) {
    // Manual page break before this section
    if (group.startOnNewPage) flush();

    // Compute group total height
    const groupHeight = group.nodes.reduce((sum, n) => sum + n.height, 0);

    if (group.keepTogether) {
      // Try to keep the whole section together
      if (y > 0 && y + groupHeight > availableHeight) {
        flush();
      }
      // If it fits on a fresh page (or current page), place all nodes
      if (groupHeight <= availableHeight || y === 0) {
        for (const node of group.nodes) {
          place(node);
        }
        continue;
      }
      // Doesn't fit even on a fresh page — fall through to normal flow (split)
    }

    // Normal flow: place nodes one by one
    for (let i = 0; i < group.nodes.length; i++) {
      const node = group.nodes[i];
      const next = group.nodes[i + 1];

      // Manual page break on this specific node
      if (node.forceBreak && current.length > 0) {
        flush();
      }

      // keepWithNext: header must stay with following content.
      // Ensure header + at least the first chunk of the next node fits.
      if (node.keepWithNext) {
        // Estimate the minimum we need to keep with the header:
        // the header itself + at least 2 lines of the next block.
        const nextMin = next
          ? next.splittable
            ? 2 * (next.lineHeight || LINE_HEIGHT)
            : Math.min(next.height, 2 * LINE_HEIGHT)
          : 0;
        if (y > 0 && y + node.height + nextMin > availableHeight) {
          flush();
        }
        place(node);
        continue;
      }

      // Splittable text node: split across pages line-by-line
      if (node.splittable && node.text) {
        const lh = node.lineHeight || LINE_HEIGHT;
        const cpl = node.charsPerLine || 80;
        const lines = wrapText(node.text, cpl);
        let idx = 0;

        while (idx < lines.length) {
          const avail = remaining();
          const fitCount = Math.floor(avail / lh);

          if (fitCount <= 0) {
            // No room for even one line — start a new page
            if (current.length > 0) flush();
            continue;
          }

          const take = Math.min(fitCount, lines.length - idx);

          if (take >= lines.length - idx) {
            // Rest fits on current page
            const fittedText = lines.slice(idx).join(" ");
            place(node, {
              data: { text: fittedText },
              height: (lines.length - idx) * lh,
            });
            idx = lines.length;
          } else {
            // Split: take `take` lines, continue on next page
            const fittedText = lines.slice(idx, idx + take).join(" ");
            place(node, {
              data: { text: fittedText },
              height: take * lh,
              continued: true,
            });
            idx += take;
            flush();
          }
        }
        continue;
      }

      // Atomic node: if it doesn't fit, flush first
      if (y > 0 && y + node.height > availableHeight) {
        flush();
      }
      place(node);
    }
  }

  flush();

  // Ensure at least one page
  if (pages.length === 0) {
    pages.push([]);
  }

  return pages;
}

// ─────────────────────────────────────────────────────────────────────────────
// generatePageModel — the public entry point
// ─────────────────────────────────────────────────────────────────────────────

export interface GeneratePageModelOptions {
  /** Section IDs that must start on a new page (manual page breaks). */
  pageBreaks?: string[];
  /** Per-section layout overrides (keepTogether / startOnNewPage). */
  sectionSettings?: Record<string, SectionSettings>;
  /** Template layout context (pattern, sidebar width, etc.). */
  layout: LayoutContext;
}

/**
 * Full pipeline: Resume JSON → PageModel
 *
 * @param data - The resume data from the store
 * @param sectionOrder - The order of sections (from the store)
 * @param options - Layout context + page-break + section-settings overrides
 * @returns PageModel with pages (each carrying main blocks + sidebar blocks)
 */
export function generatePageModel(
  data: ResumeData,
  sectionOrder: string[],
  options: GeneratePageModelOptions
): PageModel {
  const ctx = options.layout;

  // Compose effective section settings: merge explicit pageBreaks as startOnNewPage
  const settings: Record<string, SectionSettings> = { ...(options.sectionSettings || {}) };
  for (const breakId of options.pageBreaks || []) {
    settings[breakId] = {
      keepTogether: settings[breakId]?.keepTogether ?? false,
      startOnNewPage: true,
    };
  }

  // 1. Build: ResumeData → { mainGroups, sidebarGroups }
  const { mainGroups, sidebarGroups } = buildFlow(data, sectionOrder, settings, ctx);

  // 2. Compute available heights for main and sidebar columns.
  // Header-band patterns need a larger safety buffer because the header block
  // (name+contacts) renders BELOW the band and adds extra height that's hard
  // to estimate precisely.
  const isHeaderBand = ctx.pattern === "header-band";
  const mainSafetyFactor = isHeaderBand ? HEADER_BAND_SAFETY_FACTOR : HEIGHT_SAFETY_FACTOR;
  const mainAvailableHeight = Math.floor(
    (ctx.pageHeight - ctx.padding.top - ctx.padding.bottom - (isHeaderBand ? ctx.headerBandHeight : 0)) *
      mainSafetyFactor
  );
  const sidebarAvailableHeight = Math.floor(
    (ctx.pageHeight - ctx.padding.top - ctx.padding.bottom) * HEIGHT_SAFETY_FACTOR
  );

  // 3. Paginate main and sidebar independently
  const mainPages = paginateFlow(mainGroups, mainAvailableHeight);
  const sidebarPages = paginateFlow(sidebarGroups, sidebarAvailableHeight);

  // 4. Merge: page N gets main page N's blocks + sidebar page N's blocks
  const totalPages = Math.max(mainPages.length, sidebarPages.length);
  const pages: Page[] = [];

  for (let i = 0; i < totalPages; i++) {
    pages.push({
      pageNumber: i + 1,
      blocks: mainPages[i] || [],
      sidebarBlocks: sidebarPages[i] || [],
    });
  }

  return {
    version: 2,
    pages,
    totalPages: pages.length,
  };
}
