/**
 * Layout Engine — Pure TypeScript, no React, no DOM.
 *
 * Pipeline:
 *   Resume JSON → Parser → Measurer → Paginator → PageModel
 *
 * Usage:
 *   import { generatePageModel } from "@/lib/resume/layout-engine";
 *   const pageModel = generatePageModel(resumeData, sectionOrder, contentArea, padding, options);
 */

import type { ResumeData, SectionSettings } from "@/store/resume-store";
import type { Insets, PageModel } from "./types";
import { parseResume } from "./parser";
import { measureNodes } from "./measurer";
import { paginate, type PaginateOptions } from "./paginator";

export { types } from "./types";
export type { LayoutNode, PageBlock, Page, PageModel, TemplateDefinition, Insets, PaginationRules } from "./types";
export { BlockType } from "./types";
export { parseResume } from "./parser";
export { measureNodes } from "./measurer";
export { paginate, type PaginateOptions } from "./paginator";

/** Options passed through to the parser + paginator from the resume store. */
export interface GeneratePageModelOptions {
  /** Section IDs that must always start on a new page (manual page breaks). */
  pageBreaks?: string[];
  /** Per-section layout overrides (keepTogether / startOnNewPage). */
  sectionSettings?: Record<string, SectionSettings>;
}

/**
 * Full pipeline: Resume JSON → PageModel
 *
 * @param data - The resume data from the store
 * @param sectionOrder - The order of sections (from the store)
 * @param contentArea - Available content area { width, height } in pixels
 * @param padding - User-adjustable padding (Insets)
 * @param options - Optional page-break + section-settings overrides
 * @returns PageModel with pages and blocks
 */
export function generatePageModel(
  data: ResumeData,
  sectionOrder: string[],
  contentArea: { width: number; height: number },
  padding: Insets,
  options?: GeneratePageModelOptions
): PageModel {
  // Compose the effective pageBreaks set: explicit list + sections flagged
  // startOnNewPage via sectionSettings.
  const explicitBreaks = options?.pageBreaks ?? [];
  const settingsBreaks = options?.sectionSettings
    ? Object.entries(options.sectionSettings)
        .filter(([, s]) => s?.startOnNewPage)
        .map(([id]) => id)
    : [];
  const mergedPageBreaks = Array.from(new Set([...explicitBreaks, ...settingsBreaks]));

  // 1. Parse: Resume JSON → LayoutNodes (with per-section rule overrides)
  const nodes = parseResume(data, sectionOrder, options?.sectionSettings);

  // 2. Measure: Estimate heights
  measureNodes(nodes);

  // 3. Paginate: Assign to pages (respecting manual page breaks)
  const pageModel = paginate(nodes, contentArea, padding, { pageBreaks: mergedPageBreaks });

  return pageModel;
}
