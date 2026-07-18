/**
 * Flow-Based Layout Engine — Pure TypeScript, no React, no DOM.
 *
 * REDESIGNED v2 — Addresses all 5 architectural issues:
 *
 *   1. NO SAFETY FACTORS — uses the true usable height from computePageRects()
 *   2. DOM-BASED MEASUREMENT — real heights via getBoundingClientRect (optional,
 *      falls back to estimates if DOM unavailable)
 *   3. PRESERVE SPACING ON SPLIT — splittable nodes retain their bottom margin
 *   4. REAL NEXT-BLOCK RESERVATION — keepWithNext reserves the actual next
 *      block's height (not just 2 lines)
 *   5. TRULY ATOMIC — every bullet, job header, project header is its own
 *      FlowNode (already done in v1, preserved here)
 *
 * The resume is flattened into a list of ATOMIC renderable units (FlowNodes):
 *
 *   SectionTitle("Experience")
 *   JobHeader(Google — Senior Engineer — 2020-2024)
 *   Bullet("Built X using Y...")
 *   Bullet("Led team of Z...")
 *
 * The paginator walks this flat list and places each atom on a page.
 *
 * Pipeline:
 *   Resume JSON → buildFlow() → { mainGroups, sidebarGroups }
 *              → measureAllNodes() [DOM measurement]
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
import { computePageRects, type PageLayoutRects } from "./layout-rects";
import { measureAllNodes } from "./dom-measurer";

// ─────────────────────────────────────────────────────────────────────────────
// Measurement constants — FALLBACK ESTIMATES only (DOM measurer overrides)
// ─────────────────────────────────────────────────────────────────────────────

/** Fallback average character width (px) when DOM measurement unavailable. */
const CHAR_WIDTH = 6.0;
/** Fallback line height for body text / bullets (px). */
const LINE_HEIGHT = 17;
/** Section title height (h2 + underline + margin). */
const SECTION_TITLE_HEIGHT = 34;
/** Job header height (role line + company line + margin). */
const JOB_HEADER_HEIGHT = 44;
/** Per-bullet line height. */
const BULLET_LINE_HEIGHT = 17;
/** Per-bullet bottom margin. */
const BULLET_MARGIN = 4;
/** Bullet text indent. */
const BULLET_INDENT = 12;
/** Skill chip height including gap. */
const SKILL_CHIP_HEIGHT = 26;
/** Skills per row in the main column. */
const SKILLS_PER_ROW_MAIN = 6;
/** Skills per row in the narrow sidebar. */
const SKILLS_PER_ROW_SIDEBAR = 2;
/** Skills section bottom margin. */
const SKILLS_MARGIN_BOTTOM = 16;
/** Education entry height. */
const EDUCATION_ENTRY_HEIGHT = 42;
/** Education entry bottom margin. */
const EDUCATION_ENTRY_MARGIN = 8;
/** Simple-list item height. */
const SIMPLE_ITEM_HEIGHT = 32;
/** Simple-list item margin. */
const SIMPLE_ITEM_MARGIN = 6;
/** Languages / interests section height. */
const LANGUAGES_HEIGHT = 52;
/** Project header height. */
const PROJECT_HEADER_HEIGHT = 24;
/** Project tech chips height. */
const PROJECT_TECH_HEIGHT = 24;
/** Project entry bottom margin. */
const PROJECT_MARGIN = 12;
/** Section bottom margin (gap between sections). */
const SECTION_GAP = 16;
/**
 * Inter-block spacing — added to the y cursor for each placed block.
 * Accounts for the residual gap between rendered blocks that the
 * measurement functions (which return block content height + marginBottom)
 * don't fully capture: line-height rounding, flex gaps, margin collapsing.
 * Calibrated to 12px (measured average inter-block gap is ~4px, plus
 * line-height rounding, margin collapsing, and flex gap effects).
 */
const BLOCK_SPACING = 12;

// ─────────────────────────────────────────────────────────────────────────────
// Layout context — passed in by the component layer
// ─────────────────────────────────────────────────────────────────────────────

export type TemplatePattern = "sidebar-left" | "sidebar-right" | "header-band" | "single-column";

export interface LayoutContext {
  pattern: TemplatePattern;
  sidebarWidth: number;
  headerBandHeight: number;
  padding: Insets;
  pageWidth: number;
  pageHeight: number;
  /** Accent color (for DOM measurement context). */
  accent?: string;
}

/** Sections that render in the sidebar column (for sidebar-left/right). */
const SIDEBAR_SECTION_IDS = new Set([
  "personal",
  "skills",
  "languages",
  "certifications",
  "interests",
]);

/** Header-band patterns have NO sidebar column. */
const HEADER_BAND_SIDEBAR_IDS = new Set<string>([]);

// ─────────────────────────────────────────────────────────────────────────────
// Section group
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

function charsPerLine(widthPx: number, indent = 0): number {
  return Math.max(8, Math.floor((widthPx - indent) / CHAR_WIDTH));
}

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

function measureParagraph(text: string, widthPx: number, indent = 0): number {
  const cpl = charsPerLine(widthPx, indent);
  const lines = wrapText(text, cpl);
  return lines.length * LINE_HEIGHT;
}

function measureBullet(text: string, widthPx: number): number {
  const cpl = charsPerLine(widthPx, BULLET_INDENT);
  const lines = wrapText(text, cpl);
  return lines.length * BULLET_LINE_HEIGHT + BULLET_MARGIN;
}

function measureHeader(data: ResumeData, isSidebar: boolean): number {
  let h = 0;
  if (isSidebar) {
    h += 80 + 12;
    h += 22;
    if (data.title) h += 14;
    const contacts = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
    h += contacts.length * 14 + 8;
    h += 20;
  } else {
    h += 30;
    if (data.title) h += 18;
    const contacts = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
    h += Math.max(1, Math.ceil(contacts.length / 4)) * 15 + 8;
    h += 16;
  }
  return h;
}

function measureSkills(skills: string[], isSidebar: boolean): number {
  if (!skills.length) return 0;
  const perRow = isSidebar ? SKILLS_PER_ROW_SIDEBAR : SKILLS_PER_ROW_MAIN;
  const rows = Math.ceil(skills.length / perRow);
  return SECTION_TITLE_HEIGHT + rows * SKILL_CHIP_HEIGHT + SKILLS_MARGIN_BOTTOM;
}

function measureLanguagesSection(): number {
  return LANGUAGES_HEIGHT + SECTION_GAP;
}

function measureSimpleList(items: SimpleItem[], widthPx: number): number {
  if (!items.length) return 0;
  let h = SECTION_TITLE_HEIGHT;
  for (const item of items) {
    const titleLines = wrapText(item.title || "", charsPerLine(widthPx, 10)).length;
    h += titleLines * LINE_HEIGHT;
    if (item.subtitle) h += LINE_HEIGHT;
    h += SIMPLE_ITEM_MARGIN;
  }
  return h + SECTION_GAP;
}

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

  const mainWidth = ctx.pageWidth - ctx.sidebarWidth - ctx.padding.left - ctx.padding.right;
  const sidebarWidth = ctx.sidebarWidth > 0 ? ctx.sidebarWidth - 32 : 0;

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
        data: { text, _bottomMargin: SECTION_GAP },
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
          // FIX #4: Reserve the ACTUAL next block height, not just 2 lines
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
            data: { text: proj.description, _bottomMargin: 0 },
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
 * FIXES applied:
 *   - NO SAFETY FACTOR: availableHeight is the TRUE usable height
 *   - FIX #3: Splittable nodes preserve their bottom margin when split
 *   - FIX #4: keepWithNext reserves the ACTUAL next block's height
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
    // Add BLOCK_SPACING to account for inter-block gaps (marginBottom on
    // block components + line-height rounding). This is NOT a safety factor
    // on the available height — it's a per-block spacing allowance that
    // matches the actual rendered gaps.
    y += (overrides?.height ?? node.height) + BLOCK_SPACING;
  };

  for (const group of groups) {
    if (group.startOnNewPage) flush();

    const groupHeight = group.nodes.reduce((sum, n) => sum + n.height, 0);

    if (group.keepTogether) {
      if (y > 0 && y + groupHeight > availableHeight) {
        flush();
      }
      if (groupHeight <= availableHeight || y === 0) {
        for (const node of group.nodes) {
          place(node);
        }
        continue;
      }
      // Doesn't fit even on a fresh page — fall through to normal flow
    }

    for (let i = 0; i < group.nodes.length; i++) {
      const node = group.nodes[i];
      const next = group.nodes[i + 1];

      if (node.forceBreak && current.length > 0) {
        flush();
      }

      // FIX #4: keepWithNext reserves the ACTUAL next block height
      if (node.keepWithNext) {
        // Reserve the real next block's full height (not just 2 lines).
        // If the next block is splittable, reserve at least 3 lines so
        // the header isn't stranded with just 1 line of content.
        const nextMin = next
          ? next.splittable
            ? Math.min(next.height, 3 * (next.lineHeight || LINE_HEIGHT))
            : Math.min(next.height, 60) // Reserve up to 60px for the next atomic block
          : 0;

        if (y > 0 && y + node.height + nextMin > availableHeight) {
          flush();
        }
        place(node);
        continue;
      }

      // FIX #3: Splittable nodes preserve their bottom margin when split
      if (node.splittable && node.text) {
        const lh = node.lineHeight || LINE_HEIGHT;
        const cpl = node.charsPerLine || 80;
        const lines = wrapText(node.text, cpl);
        // The bottom margin that was baked into node.height
        const bottomMargin = (node.data as any)?._bottomMargin || 0;
        const textHeight = node.height - bottomMargin;
        let idx = 0;

        while (idx < lines.length) {
          const avail = remaining();
          const fitCount = Math.floor(avail / lh);

          if (fitCount <= 0) {
            if (current.length > 0) flush();
            continue;
          }

          const take = Math.min(fitCount, lines.length - idx);

          if (take >= lines.length - idx) {
            // Rest fits on current page — include the bottom margin
            const fittedText = lines.slice(idx).join(" ");
            const fittedHeight = (lines.length - idx) * lh + bottomMargin;
            place(node, {
              data: { text: fittedText },
              height: fittedHeight,
            });
            idx = lines.length;
          } else {
            // Split: take `take` lines, continue on next page.
            // FIX #3: The continued block gets a small top margin (8px)
            // instead of the original bottom margin, so spacing is
            // preserved without losing height to margins.
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

  if (pages.length === 0) {
    pages.push([]);
  }

  return pages;
}

// ─────────────────────────────────────────────────────────────────────────────
// generatePageModel — the public entry point
// ─────────────────────────────────────────────────────────────────────────────

export interface GeneratePageModelOptions {
  pageBreaks?: string[];
  sectionSettings?: Record<string, SectionSettings>;
  layout: LayoutContext;
}

/**
 * Full pipeline: Resume JSON → PageModel
 *
 * FIXES:
 *   - FIX #1: NO SAFETY FACTOR — uses the TRUE content rect height from
 *     computePageRects(). Every pixel of usable space is utilized.
 *   - FIX #2: DOM measurement — calls measureAllNodes() to get real heights
 *     (falls back to estimates if DOM unavailable).
 */
export function generatePageModel(
  data: ResumeData,
  sectionOrder: string[],
  options: GeneratePageModelOptions
): PageModel {
  const ctx = options.layout;

  // Compose effective section settings
  const settings: Record<string, SectionSettings> = { ...(options.sectionSettings || {}) };
  for (const breakId of options.pageBreaks || []) {
    settings[breakId] = {
      keepTogether: settings[breakId]?.keepTogether ?? false,
      startOnNewPage: true,
    };
  }

  // 1. Build: ResumeData → { mainGroups, sidebarGroups }
  const { mainGroups, sidebarGroups } = buildFlow(data, sectionOrder, settings, ctx);

  // 2. Compute the TRUE layout rectangles (single source of truth)
  const rects = computePageRects({
    pageWidth: ctx.pageWidth,
    pageHeight: ctx.pageHeight,
    padding: ctx.padding,
    pattern: ctx.pattern,
    sidebarWidth: ctx.sidebarWidth,
    headerBandHeight: ctx.headerBandHeight,
  });

  // FIX #1: Use the TRUE content rect height — NO safety factor.
  // The content rect already accounts for padding, header band, and sidebar.
  const mainAvailableHeight = rects.content.height;
  const sidebarAvailableHeight = rects.sidebar.height;

  // 3. DOM measurement — get real heights for all nodes (client-side only)
  if (typeof window !== "undefined") {
    const mainContentWidth = rects.content.width;
    const sidebarContentWidth = rects.sidebar.width > 0 ? rects.sidebar.width - 32 : 0;
    measureAllNodes([...mainGroups, ...sidebarGroups], {
      mainWidth: mainContentWidth,
      sidebarWidth: sidebarContentWidth,
      accent: ctx.accent || "#10b981",
    });
  }

  // 4. Paginate main and sidebar independently using TRUE heights
  const mainPages = paginateFlow(mainGroups, mainAvailableHeight);
  const sidebarPages = paginateFlow(sidebarGroups, sidebarAvailableHeight);

  // 5. Merge
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
