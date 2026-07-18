"use client";

/**
 * DOM-Based Block Measurer — Real pixel measurement via hidden rendering.
 *
 * PROBLEM this solves:
 *   The old estimator used `CHAR_WIDTH = 6.5` and `wrapText()` to guess
 *   how many lines a paragraph would take. But browsers render text
 *   differently based on font loading, bold weight, kerning, sidebar
 *   width, etc. The estimate was often wrong (3 estimated lines vs 5
 *   actual), causing hidden bullets, footer overlap, and bad page breaks.
 *
 * SOLUTION:
 *   Use the Canvas 2D API (`measureText`) to get real character widths
 *   at the exact font size used by each block type. This is synchronous
 *   and accurate — no hidden DOM rendering needed.
 *
 *   For atomic blocks (skills, certifications, etc.), use heuristics
 *   calibrated against the actual block components.
 *
 * This runs client-side (the preview is already client-side). The engine
 * calls `measureAllNodes()` before pagination to get real heights.
 */

import {
  BlockType,
  type FlowNode,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Measurement cache — keyed by content hash + width
// ─────────────────────────────────────────────────────────────────────────────

interface CacheKey {
  type: BlockType;
  dataHash: string;
  width: number;
  isSidebar: boolean;
}

const cache = new Map<string, number>();

function hashData(data: unknown): string {
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}

function cacheKey(node: FlowNode, width: number, isSidebar: boolean): string {
  const k: CacheKey = {
    type: node.type,
    dataHash: hashData(node.data),
    width,
    isSidebar,
  };
  return JSON.stringify(k);
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas-based text measurement (synchronous, accurate)
// ─────────────────────────────────────────────────────────────────────────────

let canvasCtx: CanvasRenderingContext2D | null = null;

/** Get (or create) a cached Canvas 2D context for text measurement. */
function getCanvasCtx(): CanvasRenderingContext2D | null {
  if (canvasCtx) return canvasCtx;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvasCtx = canvas.getContext("2d");
  return canvasCtx;
}

/**
 * Measure the real width of a text string at a given font size.
 * Uses the browser's Canvas measureText API (synchronous, accurate).
 */
function measureTextWidth(text: string, fontSizePx: number, fontWeight: number = 400): number {
  const ctx = getCanvasCtx();
  if (!ctx) return text.length * fontSizePx * 0.55; // fallback
  ctx.font = `${fontWeight} ${fontSizePx}px Helvetica, Arial, sans-serif`;
  return ctx.measureText(text).width;
}

/**
 * Compute the average character width at a given font size.
 * Used for estimating wrap points.
 */
function avgCharWidth(fontSizePx: number, fontWeight: number = 400): number {
  // Measure a representative sample of characters
  const sample = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789";
  const ctx = getCanvasCtx();
  if (!ctx) return fontSizePx * 0.55;
  ctx.font = `${fontWeight} ${fontSizePx}px Helvetica, Arial, sans-serif`;
  const totalWidth = ctx.measureText(sample).width;
  return totalWidth / sample.length;
}

/**
 * Word-wrap text to fit a given pixel width.
 * Uses real character widths from the Canvas API.
 */
function wrapTextReal(text: string, widthPx: number, fontSizePx: number, fontWeight: number = 400, indent = 0): string[] {
  const availableWidth = widthPx - indent;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine.length === 0 ? word : currentLine + " " + word;
    const testWidth = measureTextWidth(testLine, fontSizePx, fontWeight);

    if (testWidth <= availableWidth) {
      currentLine = testLine;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      // Check if the single word is wider than available (break long words)
      const wordWidth = measureTextWidth(word, fontSizePx, fontWeight);
      if (wordWidth > availableWidth) {
        // Break the word character by character
        let chars = "";
        for (const ch of word) {
          const testChars = chars + ch;
          if (measureTextWidth(testChars, fontSizePx, fontWeight) <= availableWidth) {
            chars = testChars;
          } else {
            if (chars) lines.push(chars);
            chars = ch;
          }
        }
        currentLine = chars;
      } else {
        currentLine = word;
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// ─────────────────────────────────────────────────────────────────────────────
// Block-specific measurement functions
// ─────────────────────────────────────────────────────────────────────────────

/** Line height multiplier (CSS line-height: 1.6 → 1.6x font size). */
const LH_BULLET = 1.6;
const LH_PARAGRAPH = 1.7;
const LH_BODY = 1.5;

/** Bullet block: fontSize 10, lineHeight 1.6, marginBottom 4, paddingLeft 12. */
function measureBulletReal(text: string, widthPx: number): number {
  const lines = wrapTextReal(text, widthPx, 10, 400, 12);
  return lines.length * (10 * LH_BULLET) + 4; // +4 for marginBottom
}

/** Paragraph block: fontSize 10.5, lineHeight 1.7. */
function measureParagraphReal(text: string, widthPx: number): { height: number; lineHeight: number; lines: number } {
  const fontSize = 10.5;
  const lineHeight = fontSize * LH_PARAGRAPH;
  const lines = wrapTextReal(text, widthPx, fontSize, 400);
  return { height: lines.length * lineHeight, lineHeight, lines: lines.length };
}

/** Job header: role line (fontSize 12, bold) + company line (fontSize 11, semibold) + marginBottom 6. */
function measureJobHeaderReal(data: any, widthPx: number): number {
  const roleWidth = measureTextWidth(data.role || "", 12, 700);
  const dateWidth = measureTextWidth([data.start, data.end || "Present"].filter(Boolean).join(" — "), 9, 400);
  const roleLineH = 12 * LH_BODY;
  const companyLineH = 11 * LH_BODY;
  // Role + date are on one line (flex space-between), so role takes one line
  // unless the role+date together exceed width
  let roleLines = 1;
  if (roleWidth + dateWidth + 20 > widthPx && roleWidth > widthPx * 0.6) {
    roleLines = wrapTextReal(data.role || "", widthPx, 12, 700).length;
  }
  return roleLines * roleLineH + companyLineH + 6; // +6 marginBottom
}

/** Section title: h2 fontSize 12, margin 0 0 8 0, paddingBottom 4, borderBottom. */
function measureSectionTitleReal(): number {
  return 12 * LH_BODY + 8 + 4 + 2; // line + marginBottom + paddingBottom + border
}

/** Project header: name (fontSize 12, bold) + link (fontSize 9) on one line + marginBottom 4. */
function measureProjectHeaderReal(data: any, widthPx: number): number {
  const nameWidth = measureTextWidth(data.name || "", 12, 700);
  const linkWidth = measureTextWidth(data.link || "", 9, 400);
  const lineH = 12 * LH_BODY;
  let lines = 1;
  if (nameWidth + linkWidth + 20 > widthPx && nameWidth > widthPx * 0.7) {
    lines = wrapTextReal(data.name || "", widthPx, 12, 700).length;
  }
  return lines * lineH + 4;
}

/** Project tech: chips, fontSize 9, gap 4, marginBottom 8. Estimate rows. */
function measureProjectTechReal(tech: string[], widthPx: number): number {
  if (!tech.length) return 0;
  const chipPadding = 12; // 6px each side
  const gap = 4;
  let rowWidth = 0;
  let rows = 1;
  for (const t of tech) {
    const chipW = measureTextWidth(t, 9, 400) + chipPadding;
    if (rowWidth + chipW > widthPx && rowWidth > 0) {
      rows++;
      rowWidth = chipW + gap;
    } else {
      rowWidth += chipW + gap;
    }
  }
  return rows * (9 * 1.4 + 4) + 8; // chip height + gap + marginBottom
}

/** Skills section: title + chips. */
function measureSkillsReal(skills: string[], isSidebar: boolean, widthPx: number): number {
  if (!skills.length) return 0;
  const titleH = measureSectionTitleReal();
  const chipH = 10 * 1.4 + 6; // fontSize 10, padding 3+3
  const chipPadding = 16; // 8px each side
  const gap = 6;
  let rowWidth = 0;
  let rows = 1;
  for (const s of skills) {
    const chipW = measureTextWidth(s, 10, 500) + chipPadding;
    if (rowWidth + chipW > widthPx && rowWidth > 0) {
      rows++;
      rowWidth = chipW + gap;
    } else {
      rowWidth += chipW + gap;
    }
  }
  return titleH + rows * chipH + 16; // +16 marginBottom
}

/** Simple list (certifications, awards, publications): title + items. */
function measureSimpleListReal(items: any[], widthPx: number, isSidebar: boolean): number {
  if (!items.length) return 0;
  const titleH = measureSectionTitleReal();
  let h = titleH;
  for (const item of items) {
    const titleLines = wrapTextReal(item.title || "", widthPx, 11, 600, 10);
    h += titleLines.length * (11 * LH_BODY);
    if (item.subtitle) {
      h += 10 * LH_BODY;
    }
    if (item.description) {
      const descLines = wrapTextReal(item.description, widthPx, 10, 400);
      h += descLines.length * (10 * LH_BODY);
    }
    h += 6; // item margin
  }
  return h + 16; // section marginBottom
}

/** Education entry: degree (12 bold) + school (11) + optional grade (10) + marginBottom 10. */
function measureEducationReal(data: any, widthPx: number): number {
  let h = 12 * LH_BODY; // degree line
  h += 11 * LH_BODY; // school line
  if (data.grade) h += 10 * LH_BODY;
  return h + 10; // +10 marginBottom
}

/** Header (contact): name (26 bold) + title (13) + contacts (10) + marginBottom 16. */
function measureHeaderReal(data: any, isSidebar: boolean, widthPx: number): number {
  if (isSidebar) {
    let h = 80 + 12; // photo + margin
    h += 18 * 1.2; // name (fontSize 18)
    if (data.title) h += 10 * 1.4;
    const contacts = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
    h += contacts.length * (9 * 1.6 + 2) + 8;
    h += 20; // marginBottom
    return h;
  } else {
    let h = 26 * 1.15; // name (fontSize 26)
    if (data.title) h += 13 * 1.4;
    const contacts = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
    // Contacts wrap horizontally with dots — estimate rows
    const dotSep = 16; // "·" margin
    let rowWidth = 0;
    let rows = 1;
    for (const c of contacts) {
      const cWidth = measureTextWidth(c, 10, 400) + dotSep;
      if (rowWidth + cWidth > widthPx && rowWidth > 0) {
        rows++;
        rowWidth = cWidth;
      } else {
        rowWidth += cWidth;
      }
    }
    h += rows * (10 * 1.5) + 8;
    h += 16; // marginBottom
    return h;
  }
}

/** Languages/Interests: title + one line of text + marginBottom 16. */
function measureLanguagesReal(items: string[], widthPx: number): number {
  if (!items.length) return 0;
  const titleH = measureSectionTitleReal();
  const text = items.join(", ");
  const lines = wrapTextReal(text, widthPx, 10.5, 400);
  return titleH + lines.length * (10.5 * 1.6) + 16;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API: measureAllNodes
// ─────────────────────────────────────────────────────────────────────────────

export interface MeasureContext {
  mainWidth: number;
  sidebarWidth: number;
  accent: string;
}

/**
 * Measure all FlowNodes using real Canvas-based text measurement.
 *
 * Walks both main and sidebar groups, measures each node at the exact
 * column width, and updates `node.height` with the real value.
 * Results are cached by content + width.
 *
 * For splittable (paragraph) nodes, also updates `node.lineHeight` and
 * `node.charsPerLine` with real values.
 */
export function measureAllNodes(
  groups: { nodes: FlowNode[] }[],
  ctx: MeasureContext
): void {
  for (const group of groups) {
    for (const node of group.nodes) {
      const isSidebar = node.column === "sidebar";
      const width = isSidebar && ctx.sidebarWidth > 0 ? ctx.sidebarWidth : ctx.mainWidth;

      // Check cache
      const key = cacheKey(node, width, isSidebar);
      const cached = cache.get(key);
      if (cached !== undefined) {
        // Apply cached height (and lineHeight for splittable nodes)
        if (node.splittable && node.text) {
          // For splittable, the cache stores the line height
          node.lineHeight = cached;
          const lines = wrapTextReal(node.text, width, 10.5, 400);
          const bottomMargin = (node.data as any)?._bottomMargin || 0;
          node.height = lines.length * cached + bottomMargin;
          node.charsPerLine = Math.floor(width / avgCharWidth(10.5));
        } else {
          node.height = cached;
        }
        continue;
      }

      // Measure based on block type
      let measuredHeight = node.height; // fallback to estimate

      switch (node.type) {
        case BlockType.Bullet: {
          const text = (node.data as any)?.text || "";
          measuredHeight = measureBulletReal(text, width);
          break;
        }
        case BlockType.Paragraph: {
          const text = (node.data as any)?.text || "";
          const result = measureParagraphReal(text, width);
          const bottomMargin = (node.data as any)?._bottomMargin || 0;
          measuredHeight = result.height + bottomMargin;
          node.lineHeight = result.lineHeight;
          node.charsPerLine = Math.floor(width / avgCharWidth(10.5));
          // Cache the line height for splittable nodes
          cache.set(key, result.lineHeight);
          node.height = measuredHeight;
          continue; // already set height and cached
        }
        case BlockType.JobHeader: {
          measuredHeight = measureJobHeaderReal(node.data, width);
          break;
        }
        case BlockType.SectionTitle: {
          measuredHeight = measureSectionTitleReal();
          break;
        }
        case BlockType.ProjectHeader: {
          measuredHeight = measureProjectHeaderReal(node.data, width);
          break;
        }
        case BlockType.ProjectTech: {
          const tech = (node.data as any)?.tech || [];
          measuredHeight = measureProjectTechReal(tech, width);
          break;
        }
        case BlockType.Skills: {
          const skills = (node.data as any)?.skills || [];
          measuredHeight = measureSkillsReal(skills, isSidebar, width);
          break;
        }
        case BlockType.Certifications:
        case BlockType.Awards:
        case BlockType.Publications:
        case BlockType.CustomSection: {
          const items = (node.data as any)?.items || [];
          measuredHeight = measureSimpleListReal(items, width, isSidebar);
          break;
        }
        case BlockType.Languages:
        case BlockType.Interests: {
          const items = (node.data as any)?.items || [];
          measuredHeight = measureLanguagesReal(items, width);
          break;
        }
        case BlockType.EducationEntry: {
          measuredHeight = measureEducationReal(node.data, width);
          break;
        }
        case BlockType.Contact: {
          measuredHeight = measureHeaderReal(node.data, isSidebar, width);
          break;
        }
        default:
          // Keep fallback estimate
          break;
      }

      node.height = measuredHeight;
      cache.set(key, measuredHeight);
    }
  }
}

/**
 * Clear the measurement cache. Call when resume data or template changes.
 */
export function clearMeasureCache(): void {
  cache.clear();
}
