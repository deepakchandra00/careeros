/**
 * Layout Engine — Pure TypeScript + DOM measurement, no React in engine core.
 *
 * REDESIGNED v2: flow-based pagination with unified content rectangles
 * and DOM-based measurement.
 *
 * Pipeline:
 *   Resume JSON → buildFlow() → FlowNode[]
 *              → measureAllNodes() [DOM measurement]
 *              → paginateFlow() [true usable height, no safety factor]
 *              → PageModel
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
export { computePageRects, type PageLayoutRects, type Rect, type ComputeRectsOptions } from "./layout-rects";
export { measureAllNodes, clearMeasureCache, type MeasureContext } from "./dom-measurer";
