/**
 * Layout Engine — Pure TypeScript, no React, no DOM.
 *
 * Pipeline:
 *   Resume JSON → Parser → Measurer → Paginator → PageModel
 *
 * Usage:
 *   import { generatePageModel } from "@/lib/resume/layout-engine";
 *   const pageModel = generatePageModel(resumeData, sectionOrder, contentArea, padding);
 */

import type { ResumeData } from "@/store/resume-store";
import type { Insets, PageModel } from "./types";
import { parseResume } from "./parser";
import { measureNodes } from "./measurer";
import { paginate } from "./paginator";

export { types } from "./types";
export type { LayoutNode, PageBlock, Page, PageModel, TemplateDefinition, Insets, PaginationRules } from "./types";
export { BlockType } from "./types";
export { parseResume } from "./parser";
export { measureNodes } from "./measurer";
export { paginate } from "./paginator";

/**
 * Full pipeline: Resume JSON → PageModel
 *
 * @param data - The resume data from the store
 * @param sectionOrder - The order of sections (from the store)
 * @param contentArea - Available content area { width, height } in pixels
 * @param padding - User-adjustable padding (Insets)
 * @returns PageModel with pages and blocks
 */
export function generatePageModel(
  data: ResumeData,
  sectionOrder: string[],
  contentArea: { width: number; height: number },
  padding: Insets
): PageModel {
  // 1. Parse: Resume JSON → LayoutNodes
  const nodes = parseResume(data, sectionOrder);

  // 2. Measure: Estimate heights
  measureNodes(nodes);

  // 3. Paginate: Assign to pages
  const pageModel = paginate(nodes, contentArea, padding);

  return pageModel;
}
