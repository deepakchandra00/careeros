"use client";

import * as React from "react";
import { A4_WIDTH, A4_HEIGHT, type Page } from "@/lib/resume/layout-engine/types";
import type { PageLayout } from "@/store/resume-store";
import { TemplateBackground } from "./TemplateBackground";
import { BlockRenderer } from "./BlockRenderer";
import type { TemplatePattern } from "./template-layout";

/**
 * PageRenderer — renders ONE A4 page from the PageModel.
 *
 * Architecture:
 *
 *   ┌──────────────────────────────────────────────┐
 *   │  .resume-page  (794 × 1123, relative)        │
 *   │  ┌─────────┐                                 │
 *   │  │ bg layer│  ← TemplateBackground (absolute)│
 *   │  └─────────┘                                 │
 *   │  ┌─────────────────────────────────────────┐ │
 *   │  │ content layer (padded, zIndex:1)        │ │
 *   │  │   <BlockRenderer />  <BlockRenderer />   │ │
 *   │  │   <BlockRenderer />  ...                 │ │
 *   │  └─────────────────────────────────────────┘ │
 *   └──────────────────────────────────────────────┘
 *
 * The background fills the ENTIRE page (sidebar / header band / colors).
 * The content sits in a padded frame whose left/right padding is increased
 * by the sidebar width so content never overlaps the sidebar.
 *
 * No translateY. No clipping. Each page renders ONLY the blocks assigned to
 * it by the layout engine.
 */
export function PageRenderer({
  page,
  accent,
  pageLayout,
  pattern,
  sidebarWidth = 0,
  showPageNumber = false,
  totalPages = 1,
}: {
  /** The page to render (from generatePageModel().pages[n]). */
  page: Page;
  /** Accent color (hex). */
  accent: string;
  /** User-adjustable page padding. */
  pageLayout: PageLayout;
  /** Template structural pattern. */
  pattern: TemplatePattern;
  /** Sidebar width in px (sidebar patterns only). */
  sidebarWidth?: number;
  /** Show the "page / total" indicator (screen only). */
  showPageNumber?: boolean;
  /** Total page count (for the page indicator). */
  totalPages?: number;
}) {
  // Compute the content frame's padding. For sidebar patterns, shift the
  // content away from the sidebar by adding the sidebar width to the
  // corresponding side's padding.
  const isSidebarLeft = pattern === "sidebar-left";
  const isSidebarRight = pattern === "sidebar-right";
  const isHeaderBand = pattern === "header-band";

  // For header-band patterns, reserve extra top padding so content starts
  // below the band (the band is 120px tall by default).
  const headerBandHeight = isHeaderBand ? 120 : 0;

  const paddingTop = pageLayout.paddingTop + headerBandHeight;
  const paddingBottom = pageLayout.paddingBottom;
  const paddingLeft = pageLayout.paddingLeft + (isSidebarLeft ? sidebarWidth : 0);
  const paddingRight = pageLayout.paddingRight + (isSidebarRight ? sidebarWidth : 0);

  return (
    <div
      className="resume-page relative bg-white shadow-lg print:!shadow-none"
      style={{
        width: A4_WIDTH,
        height: A4_HEIGHT,
        overflow: "hidden",
        position: "relative",
        boxSizing: "border-box",
        // Print: each .resume-page becomes one PDF page.
        pageBreakAfter: page.pageNumber < totalPages ? "always" : "auto",
        breakAfter: page.pageNumber < totalPages ? "page" : "auto",
      }}
    >
      {/* ── Background layer (fills entire page) ─────────────────────── */}
      <TemplateBackground
        pattern={pattern}
        accent={accent}
        sidebarWidth={sidebarWidth}
        headerHeight={headerBandHeight}
      />

      {/* ── Content layer (padded frame, above background) ──────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
          height: "100%",
          boxSizing: "border-box",
          // Allow children to flow naturally; no clipping, no transforms.
          overflow: "hidden",
        }}
      >
        {page.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} accent={accent} />
        ))}
      </div>

      {/* ── Page number indicator (screen only) ─────────────────────── */}
      {showPageNumber && totalPages > 1 ? (
        <div
          className="print:hidden"
          style={{
            position: "absolute",
            bottom: 6,
            right: 12,
            zIndex: 20,
            fontSize: 10,
            fontWeight: 500,
            color: "#94a3b8",
          }}
        >
          {page.pageNumber} / {totalPages}
        </div>
      ) : null}
    </div>
  );
}
