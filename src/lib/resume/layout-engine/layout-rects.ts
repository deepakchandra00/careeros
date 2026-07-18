/**
 * Unified Layout Rectangle System — Single Source of Truth for Page Geometry.
 *
 * PROBLEM this solves:
 *   Previously, the PageRenderer, TemplateBackground, and flow-engine each
 *   computed padding independently. The sidebar used `left: 0`, the header
 *   used `left: 0`, and the content used `paddingLeft` — three different
 *   coordinate systems that caused:
 *     - Left padding slider had no visible effect
 *     - Header/sidebar ignored padding
 *     - Footer overlapped content
 *     - Thumbnail mismatch
 *
 * SOLUTION:
 *   Compute ONE set of rectangles from the page dimensions + padding +
 *   template pattern. Every renderer (header, sidebar, content, footer,
 *   page number) consumes the SAME rectangles. Nobody computes padding
 *   again.
 *
 *   Page (794 × 1123)
 *   ├── usableRect (page minus padding)
 *   ├── headerRect (top portion of usableRect, for header-band pattern)
 *   ├── sidebarRect (left or right portion of usableRect, for sidebar patterns)
 *   └── contentRect (the remaining area where flow content goes)
 *
 * All coordinates are absolute (relative to the page origin, not nested).
 */

import type { Insets } from "./types";
import type { TemplatePattern } from "./flow-engine";

/** A rectangle in page coordinates (absolute, not relative). */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The complete layout geometry for one page. */
export interface PageLayoutRects {
  /** Full page rectangle (0, 0, pageWidth, pageHeight). */
  page: Rect;
  /** Page minus padding — the usable area. */
  usable: Rect;
  /**
   * Header rectangle (for header-band pattern). Sits at the top of the
   * usable area. For non-header-band patterns, this is a zero-height rect.
   */
  header: Rect;
  /**
   * Sidebar rectangle (for sidebar-left/right patterns). Spans the full
   * usable height (minus header if header-band). For single-column, this
   * is a zero-width rect.
   */
  sidebar: Rect;
  /**
   * Content rectangle — where the main flow content goes. This is the
   * usable area minus header height minus sidebar width. Every flow node
   * is paginated to fit within this rectangle.
   */
  content: Rect;
  /** True if the sidebar is on the left side. */
  isSidebarLeft: boolean;
  /** True if the sidebar is on the right side. */
  isSidebarRight: boolean;
  /** True if this is a header-band pattern. */
  isHeaderBand: boolean;
  /** True if this pattern has a sidebar (left or right). */
  hasSidebar: boolean;
}

export interface ComputeRectsOptions {
  pageWidth: number;
  pageHeight: number;
  padding: Insets;
  pattern: TemplatePattern;
  sidebarWidth: number;
  headerBandHeight: number;
}

/**
 * Compute the complete set of layout rectangles for a page.
 *
 * This is the SINGLE SOURCE OF TRUTH. All renderers must use these rects
 * — never recompute padding independently.
 */
export function computePageRects(opts: ComputeRectsOptions): PageLayoutRects {
  const { pageWidth, pageHeight, padding, pattern, sidebarWidth, headerBandHeight } = opts;

  const isSidebarLeft = pattern === "sidebar-left";
  const isSidebarRight = pattern === "sidebar-right";
  const isHeaderBand = pattern === "header-band";
  const hasSidebar = isSidebarLeft || isSidebarRight;

  // ── Usable rect: page minus padding ──
  const usable: Rect = {
    x: padding.left,
    y: padding.top,
    width: pageWidth - padding.left - padding.right,
    height: pageHeight - padding.top - padding.bottom,
  };

  // ── Header rect (header-band pattern only) ──
  // Sits at the top of the usable area, full usable width.
  const headerHeight = isHeaderBand ? headerBandHeight : 0;
  const header: Rect = isHeaderBand
    ? { x: usable.x, y: usable.y, width: usable.width, height: headerHeight }
    : { x: usable.x, y: usable.y, width: usable.width, height: 0 };

  // ── Sidebar rect (sidebar-left/right patterns) ──
  // Spans from below the header to the bottom of the usable area.
  const sidebarY = usable.y + headerHeight;
  const sidebarH = usable.height - headerHeight;

  let sidebar: Rect;
  if (isSidebarLeft) {
    sidebar = { x: usable.x, y: sidebarY, width: sidebarWidth, height: sidebarH };
  } else if (isSidebarRight) {
    sidebar = {
      x: usable.x + usable.width - sidebarWidth,
      y: sidebarY,
      width: sidebarWidth,
      height: sidebarH,
    };
  } else {
    sidebar = { x: 0, y: 0, width: 0, height: 0 };
  }

  // ── Content rect — where flow content goes ──
  // Usable area minus header height minus sidebar width.
  let contentX = usable.x;
  let contentWidth = usable.width;

  if (isSidebarLeft) {
    contentX = usable.x + sidebarWidth;
    contentWidth = usable.width - sidebarWidth;
  } else if (isSidebarRight) {
    contentWidth = usable.width - sidebarWidth;
  }

  const content: Rect = {
    x: contentX,
    y: sidebarY, // below header (or top of usable if no header)
    width: contentWidth,
    height: sidebarH, // same height as sidebar
  };

  return {
    page: { x: 0, y: 0, width: pageWidth, height: pageHeight },
    usable,
    header,
    sidebar,
    content,
    isSidebarLeft,
    isSidebarRight,
    isHeaderBand,
    hasSidebar,
  };
}
