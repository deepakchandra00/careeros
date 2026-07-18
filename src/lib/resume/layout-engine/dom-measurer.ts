"use client";

/**
 * DOM-Based Block Measurer — TRUE pixel measurement via hidden DOM rendering.
 *
 * FIXES Issue 5: Renders each block in a hidden container with
 * visibility:hidden (NOT display:none), then calls getBoundingClientRect()
 * to get the REAL rendered height.
 *
 * This file does NOT use React's createRoot/flushSync (which causes
 * "flushSync was called from inside a lifecycle method" errors when
 * called during useMemo). Instead, it builds plain DOM elements with
 * the EXACT same inline styles as the React block components, appends
 * them to a hidden container, and measures with getBoundingClientRect.
 *
 * This is 100% synchronous, 100% accurate, and doesn't interfere with
 * React's render cycle.
 */

import {
  BlockType,
  type FlowNode,
} from "./types";
import type {
  ExperienceItem,
  ProjectItem,
  EducationItem,
  SimpleItem,
  ResumeData,
} from "@/store/resume-store";

// ─────────────────────────────────────────────────────────────────────────────
// Measurement cache
// ─────────────────────────────────────────────────────────────────────────────

interface CacheKey {
  type: BlockType;
  dataHash: string;
  width: number;
  isSidebar: boolean;
}

const heightCache = new Map<string, number>();
const lineHeightCache = new Map<string, number>();

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
// Hidden measurement container
// ─────────────────────────────────────────────────────────────────────────────

let measureContainer: HTMLDivElement | null = null;

/**
 * Get (or create) the hidden measurement container.
 *
 * Uses visibility:hidden (NOT display:none) so the browser still
 * performs layout and we can measure heights with getBoundingClientRect.
 */
function getMeasureContainer(width: number): HTMLDivElement {
  if (!measureContainer) {
    measureContainer = document.createElement("div");
    measureContainer.id = "resume-measure-container";
    measureContainer.style.position = "absolute";
    measureContainer.style.left = "-99999px";
    measureContainer.style.top = "0";
    measureContainer.style.visibility = "hidden";
    measureContainer.style.pointerEvents = "none";
    measureContainer.style.margin = "0";
    measureContainer.style.padding = "0";
    measureContainer.style.border = "0";
    measureContainer.style.boxSizing = "border-box";
    measureContainer.style.fontFamily = "Helvetica, Arial, sans-serif";
    document.body.appendChild(measureContainer);
  }
  measureContainer.style.width = `${width}px`;
  return measureContainer;
}

/**
 * Measure a DOM element's height (including margins).
 */
function measureElement(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const marginTop = parseInt(cs.marginTop) || 0;
  const marginBottom = parseInt(cs.marginBottom) || 0;
  return Math.ceil(rect.height + marginTop + marginBottom);
}

/**
 * Create a DOM element with inline styles (matching the React block components).
 */
function el(tag: string, style: Record<string, string>, text?: string, children?: HTMLElement[]): HTMLElement {
  const e = document.createElement(tag);
  Object.entries(style).forEach(([k, v]) => {
    (e.style as any)[k] = v;
  });
  if (text) e.textContent = text;
  if (children) children.forEach(c => e.appendChild(c));
  return e;
}

// ─────────────────────────────────────────────────────────────────────────────
// Block renderers — plain DOM matching the React block components
// ─────────────────────────────────────────────────────────────────────────────

function renderBullet(text: string, accent: string): HTMLElement {
  return el("div", {
    fontSize: "10px",
    lineHeight: "1.6",
    color: "#555",
    paddingLeft: "12px",
    position: "relative",
    marginBottom: "4px",
  }, text);
}

function renderJobHeader(data: ExperienceItem, accent: string): HTMLElement {
  const container = el("div", { marginBottom: "6px", breakInside: "avoid" });
  const dateLine = [data.start, data.end || "Present"].filter(Boolean).join(" — ");
  const line1 = el("div", {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "12px",
  });
  line1.appendChild(el("span", { fontSize: "12px", fontWeight: "700", color: "#1a1a2e" }, data.role));
  if (dateLine) line1.appendChild(el("span", { fontSize: "9px", color: "#888", whiteSpace: "nowrap" }, dateLine));
  container.appendChild(line1);

  const line2 = el("div", { display: "flex", alignItems: "baseline", gap: "6px" });
  line2.appendChild(el("span", { fontSize: "11px", color: accent, fontWeight: "600" }, data.company));
  if (data.location) line2.appendChild(el("span", { fontSize: "9px", color: "#888" }, "· " + data.location));
  container.appendChild(line2);
  return container;
}

function renderSectionTitle(title: string, accent: string, isSidebar: boolean): HTMLElement {
  return el("h2", {
    fontSize: "12px",
    fontWeight: "700",
    color: isSidebar ? "rgba(255,255,255,0.7)" : accent,
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    margin: "0 0 8px 0",
    paddingBottom: "4px",
    borderBottom: isSidebar ? "1.5px solid rgba(255,255,255,0.2)" : `1.5px solid ${accent}`,
  }, title);
}

function renderParagraph(text: string): HTMLElement {
  return el("p", {
    fontSize: "10.5px",
    lineHeight: "1.7",
    color: "#444",
    margin: "0 0 8px 0",
  }, text);
}

function renderProjectHeader(data: ProjectItem, accent: string): HTMLElement {
  const container = el("div", {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "12px",
    marginBottom: "4px",
    breakInside: "avoid",
  });
  container.appendChild(el("span", { fontSize: "12px", fontWeight: "700", color: "#1a1a2e" }, data.name));
  if (data.link) container.appendChild(el("span", { fontSize: "9px", color: accent, whiteSpace: "nowrap" }, data.link));
  return container;
}

function renderProjectTech(tech: string[]): HTMLElement {
  const container = el("div", { display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" });
  tech.forEach(t => {
    container.appendChild(el("span", {
      fontSize: "9px",
      color: "#666",
      background: "#f3f4f6",
      borderRadius: "3px",
      padding: "2px 6px",
    }, t));
  });
  return container;
}

function renderSkills(skills: string[], accent: string, isSidebar: boolean): HTMLElement {
  const container = el("section", { marginBottom: "16px", breakInside: "avoid" });
  container.appendChild(renderSectionTitle("Skills", accent, isSidebar));
  const chipContainer = el("div", { display: "flex", flexWrap: "wrap", gap: "6px" });
  skills.forEach(s => {
    const chipStyle = isSidebar
      ? { fontSize: "10px", lineHeight: "1.4", color: "#ffffff", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "4px", padding: "3px 8px", fontWeight: "500", whiteSpace: "nowrap" }
      : { fontSize: "10px", lineHeight: "1.4", color: accent, background: hexToRgba(accent, 0.1), border: `1px solid ${hexToRgba(accent, 0.35)}`, borderRadius: "4px", padding: "3px 8px", fontWeight: "500", whiteSpace: "nowrap" };
    chipContainer.appendChild(el("span", chipStyle, s));
  });
  container.appendChild(chipContainer);
  return container;
}

function renderEducation(data: EducationItem, accent: string): HTMLElement {
  const container = el("div", { marginBottom: "10px", breakInside: "avoid" });
  const dateLine = [data.start, data.end].filter(Boolean).join(" — ");
  const line1 = el("div", { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" });
  line1.appendChild(el("span", { fontSize: "12px", fontWeight: "700", color: "#1a1a2e" }, data.degree));
  if (dateLine) line1.appendChild(el("span", { fontSize: "9px", color: "#888", whiteSpace: "nowrap" }, dateLine));
  container.appendChild(line1);

  const line2 = el("div", { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" });
  line2.appendChild(el("span", { fontSize: "11px", color: accent, fontWeight: "600" }, data.school));
  if (data.location) line2.appendChild(el("span", { fontSize: "9px", color: "#888" }, data.location));
  container.appendChild(line2);

  if (data.grade) {
    container.appendChild(el("div", { fontSize: "10px", color: "#666", marginTop: "2px" }, data.grade));
  }
  return container;
}

function renderSimpleList(items: SimpleItem[], title: string, accent: string, isSidebar: boolean): HTMLElement {
  const container = el("section", { marginBottom: "16px", breakInside: "avoid" });
  container.appendChild(renderSectionTitle(title, accent, isSidebar));
  items.forEach(item => {
    const itemDiv = el("div", { marginBottom: "6px", breakInside: "avoid" });
    const line1 = el("div", { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" });
    line1.appendChild(el("span", { fontSize: "11px", fontWeight: "600", color: "#1a1a2e" }, item.title));
    if (item.date) line1.appendChild(el("span", { fontSize: "9px", color: "#888", whiteSpace: "nowrap" }, item.date));
    itemDiv.appendChild(line1);
    if (item.subtitle) itemDiv.appendChild(el("div", { fontSize: "10px", color: accent, fontWeight: "500" }, item.subtitle));
    if (item.description) itemDiv.appendChild(el("div", { fontSize: "10px", lineHeight: "1.5", color: "#666", marginTop: "1px" }, item.description));
    container.appendChild(itemDiv);
  });
  return container;
}

function renderLanguages(items: string[], accent: string, isSidebar: boolean): HTMLElement {
  const container = el("section", { marginBottom: "16px", breakInside: "avoid" });
  container.appendChild(renderSectionTitle("Languages", accent, isSidebar));
  container.appendChild(el("p", {
    fontSize: "10.5px",
    lineHeight: "1.6",
    color: isSidebar ? "rgba(255,255,255,0.85)" : "#444",
    margin: "0",
  }, items.join(", ")));
  return container;
}

function renderHeader(data: ResumeData, accent: string, isSidebar: boolean): HTMLElement {
  if (isSidebar) {
    const container = el("div", { marginBottom: "20px", textAlign: "center" });
    container.appendChild(el("div", {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "rgba(255,255,255,0.15)",
      margin: "0 auto 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "28px",
      fontWeight: "700",
      color: "#fff",
      border: "3px solid rgba(255,255,255,0.3)",
    }, data.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)));
    container.appendChild(el("h1", { fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: "0", lineHeight: "1.2" }, data.name));
    if (data.title) container.appendChild(el("p", { fontSize: "10px", color: "rgba(255,255,255,0.85)", margin: "4px 0 0", fontWeight: "500" }, data.title));
    const contacts = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
    if (contacts.length > 0) {
      const contactDiv = el("div", { fontSize: "9px", color: "rgba(255,255,255,0.7)", marginTop: "8px", lineHeight: "1.6" });
      contacts.forEach(c => contactDiv.appendChild(el("div", { marginBottom: "2px", wordBreak: "break-word" }, c)));
      container.appendChild(contactDiv);
    }
    return container;
  } else {
    const container = el("header", { marginBottom: "16px", breakInside: "avoid" });
    container.appendChild(el("h1", { fontSize: "26px", fontWeight: "800", color: "#1a1a2e", margin: "0", lineHeight: "1.15", letterSpacing: "-0.3px" }, data.name));
    if (data.title) container.appendChild(el("p", { fontSize: "13px", color: accent, fontWeight: "600", margin: "4px 0 0 0", letterSpacing: "0.2px" }, data.title));
    const contacts = [data.email, data.phone, data.location, data.linkedin, data.github, data.website].filter(Boolean);
    if (contacts.length > 0) {
      const contactDiv = el("div", { fontSize: "10px", color: "#666", marginTop: "6px", lineHeight: "1.5", display: "flex", flexWrap: "wrap", gap: "2px 8px" });
      contacts.forEach((c, i) => {
        const span = el("span", {}, c);
        if (i < contacts.length - 1) {
          const dot = el("span", { color: accent, margin: "0 0 0 8px" }, "·");
          span.appendChild(dot);
        }
        contactDiv.appendChild(span);
      });
      container.appendChild(contactDiv);
    }
    return container;
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Measure a single block by rendering it in the hidden container
// ─────────────────────────────────────────────────────────────────────────────

function measureBlockHeight(node: FlowNode, width: number, isSidebar: boolean, accent: string): number {
  const key = cacheKey(node, width, isSidebar);
  const cached = heightCache.get(key);
  if (cached !== undefined) return cached;

  const container = getMeasureContainer(width);
  // Clear previous content
  container.innerHTML = "";

  let blockEl: HTMLElement | null = null;
  const data = node.data as any;

  switch (node.type) {
    case BlockType.Bullet:
      blockEl = renderBullet(data?.text || "", accent);
      break;
    case BlockType.JobHeader:
      blockEl = renderJobHeader(data, accent);
      break;
    case BlockType.SectionTitle:
      blockEl = renderSectionTitle(data?.title || "", accent, data?.isSidebar || isSidebar);
      break;
    case BlockType.Paragraph:
      blockEl = renderParagraph(data?.text || "");
      break;
    case BlockType.ProjectHeader:
      blockEl = renderProjectHeader(data, accent);
      break;
    case BlockType.ProjectTech:
      blockEl = renderProjectTech(data?.tech || []);
      break;
    case BlockType.Skills:
      blockEl = renderSkills(data?.skills || [], accent, data?.isSidebar || isSidebar);
      break;
    case BlockType.EducationEntry:
      blockEl = renderEducation(data, accent);
      break;
    case BlockType.Certifications:
    case BlockType.Awards:
    case BlockType.Publications:
    case BlockType.CustomSection:
      blockEl = renderSimpleList(data?.items || [], data?.title || "Section", accent, data?.isSidebar || isSidebar);
      break;
    case BlockType.Languages:
      blockEl = renderLanguages(data?.items || [], accent, data?.isSidebar || isSidebar);
      break;
    case BlockType.Interests:
      blockEl = renderLanguages(data?.items || [], accent, false);
      break;
    case BlockType.Contact:
      blockEl = renderHeader(data, accent, isSidebar);
      break;
    default:
      break;
  }

  let measuredHeight = node.height; // fallback
  if (blockEl) {
    container.appendChild(blockEl);
    measuredHeight = measureElement(blockEl);
    container.removeChild(blockEl);
  }

  container.innerHTML = "";
  heightCache.set(key, measuredHeight);
  return measuredHeight;
}

/**
 * Measure the real line height for a splittable paragraph.
 */
function measureLineHeightReal(width: number): number {
  const key = `lineheight:${width}`;
  const cached = lineHeightCache.get(key);
  if (cached !== undefined) return cached;

  const container = getMeasureContainer(width);
  container.innerHTML = "";
  const p = el("p", {
    fontSize: "10.5px",
    lineHeight: "1.7",
    color: "#444",
    margin: "0",
    fontFamily: "Helvetica, Arial, sans-serif",
  }, "x");
  container.appendChild(p);

  const rect = p.getBoundingClientRect();
  let lh = 18;
  if (rect.height > 0) {
    lh = Math.ceil(rect.height);
  }

  container.removeChild(p);
  container.innerHTML = "";
  lineHeightCache.set(key, lh);
  return lh;
}

/**
 * Count how many lines a paragraph will wrap to by rendering it.
 */
function countWrappedLines(text: string, width: number, lineHeight: number): number {
  const container = getMeasureContainer(width);
  container.innerHTML = "";
  const p = el("p", {
    fontSize: "10.5px",
    lineHeight: `${lineHeight / 10.5}`,
    color: "#444",
    margin: "0",
    fontFamily: "Helvetica, Arial, sans-serif",
    whiteSpace: "pre-wrap",
  }, text);
  container.appendChild(p);

  const rect = p.getBoundingClientRect();
  let lineCount = 1;
  if (rect.height > 0) {
    lineCount = Math.round(rect.height / lineHeight);
  }

  container.removeChild(p);
  container.innerHTML = "";
  return Math.max(1, lineCount);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface MeasureContext {
  mainWidth: number;
  sidebarWidth: number;
  accent: string;
}

/**
 * Measure all FlowNodes using TRUE DOM rendering.
 *
 * Renders each block as a plain DOM element (with the exact same inline
 * styles as the React block components) in a hidden container, then
 * measures with getBoundingClientRect. 100% synchronous, 100% accurate.
 */
export function measureAllNodes(
  groups: { nodes: FlowNode[] }[],
  ctx: MeasureContext
): void {
  for (const group of groups) {
    for (const node of group.nodes) {
      const isSidebar = node.column === "sidebar";
      const width = isSidebar && ctx.sidebarWidth > 0 ? ctx.sidebarWidth : ctx.mainWidth;

      if (node.splittable && node.text) {
        // For splittable paragraphs: measure real line height + line count
        const realLH = measureLineHeightReal(width);
        const lineCount = countWrappedLines(node.text, width, realLH);
        const bottomMargin = (node.data as any)?._bottomMargin || 0;

        node.lineHeight = realLH;
        node.charsPerLine = Math.floor(width / 6.0);
        node.height = lineCount * realLH + bottomMargin;
      } else {
        // For all other blocks: render the actual DOM and measure
        const measured = measureBlockHeight(node, width, isSidebar, ctx.accent);
        if (measured > 0) {
          node.height = measured;
        }
      }
    }
  }
}

/**
 * Clear the measurement cache.
 */
export function clearMeasureCache(): void {
  heightCache.clear();
  lineHeightCache.clear();
}
