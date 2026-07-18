"use client";

import * as React from "react";
import type { TemplatePattern } from "./template-layout";
import type { PageLayoutRects } from "@/lib/resume/layout-engine/layout-rects";

/**
 * TemplateBackground — the visual background layer of a resume page.
 *
 * REDESIGNED: Uses the UNIFIED layout rects (PageLayoutRects) for all
 * positioning. The sidebar and header band now respect the page padding
 * — they start at usableRect.x/usableRect.y, not at (0, 0).
 *
 * This fixes:
 *   - Sidebar background now respects left/right padding
 *   - Header band now respects top/side padding
 *   - Background aligns with content (same coordinate system)
 */
export function TemplateBackground({
  pattern,
  accent,
  rects,
}: {
  pattern: TemplatePattern;
  accent: string;
  /** Sidebar width in px (sidebar patterns only). */
  sidebarWidth?: number;
  /** Header band height in px (header-band pattern only). */
  headerHeight?: number;
  /** The unified layout rects (single source of truth). */
  rects?: PageLayoutRects;
}) {
  // If rects are provided, use them (new unified system)
  if (rects) {
    if (rects.isHeaderBand) {
      return (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: rects.header.x,
            top: rects.header.y,
            width: rects.header.width,
            height: rects.header.height,
            background: accent,
            zIndex: 0,
          }}
        />
      );
    }

    if (rects.hasSidebar) {
      return (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: rects.sidebar.x,
            top: rects.sidebar.y,
            width: rects.sidebar.width,
            height: rects.sidebar.height,
            background: accent,
            zIndex: 0,
          }}
        />
      );
    }

    // single-column — no background decoration
    return null;
  }

  // Fallback: legacy positioning (should not be reached with new PageRenderer)
  if (pattern === "sidebar-left" || pattern === "sidebar-right") {
    return null;
  }
  if (pattern === "header-band") {
    return null;
  }
  return null;
}
