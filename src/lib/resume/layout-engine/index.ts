/**
 * Layout Engine — Pure TypeScript, no React, no DOM.
 *
 * REDESIGNED: flow-based pagination on atomic renderable blocks.
 *
 * Pipeline:
 *   Resume JSON → buildFlow() → FlowNode[] → paginateFlow() → PageModel
 *
 * Usage:
 *   import { generatePageModel } from "@/lib/resume/layout-engine";
 *   const pageModel = generatePageModel(resumeData, sectionOrder, { layout, ... });
 */

export type {
  Insets,
  FlowNode,
  PageBlock,
  Page,
  PageModel,
} from "./types";
export { BlockType, A4_WIDTH, A4_HEIGHT } from "./types";

export { generatePageModel, type GeneratePageModelOptions, type LayoutContext, type TemplatePattern } from "./flow-engine";
