"use client";

import * as React from "react";
import { A4_WIDTH, A4_HEIGHT, type Page } from "@/lib/resume/layout-engine/types";
import type { PageLayout } from "@/store/resume-store";
import { TemplateBackground } from "./TemplateBackground";
import { BlockRenderer } from "./BlockRenderer";
import { computePageRects, type PageLayoutRects } from "@/lib/resume/layout-engine/layout-rects";
import type { TemplatePattern } from "./template-layout";

/**
 * PageRenderer — renders ONE A4 page from the PageModel.
 *
 * REDESIGNED: Uses the UNIFIED content rectangle system (computePageRects)
 * as the single source of truth for page geometry. The header, sidebar,
 * content, and page number ALL use the same rects — nobody recomputes
 * padding independently.
 *
 * This fixes:
 *   - Left/right padding sliders now work (content respects padding)
 *   - Header respects padding (no longer left:0)
 *   - Footer respects padding (no longer left:0 right:0)
 *   - Sidebar aligns with content (same coordinate system)
 *   - No overflow (content stays within contentRect)
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
  page: Page;
  accent: string;
  pageLayout: PageLayout;
  pattern: TemplatePattern;
  sidebarWidth?: number;
  showPageNumber?: boolean;
  totalPages?: number;
}) {
  // ── Compute the UNIFIED layout rects (single source of truth) ──
  const rects: PageLayoutRects = React.useMemo(
    () =>
      computePageRects({
        pageWidth: A4_WIDTH,
        pageHeight: A4_HEIGHT,
        padding: {
          top: pageLayout.paddingTop ?? 0,
          bottom: pageLayout.paddingBottom ?? 0,
          left: pageLayout.paddingLeft ?? 0,
          right: pageLayout.paddingRight ?? 0,
        },
        pattern,
        sidebarWidth,
        headerBandHeight: pattern === "header-band" ? 120 : 0,
      }),
    [pageLayout, pattern, sidebarWidth]
  );

  const sidebarBlocks = page.sidebarBlocks || [];

  return (
    <div
      className="resume-page relative bg-white shadow-lg print:!shadow-none"
      style={{
        width: A4_WIDTH,
        height: A4_HEIGHT,
        overflow: "hidden",
        position: "relative",
        boxSizing: "border-box",
        pageBreakAfter: page.pageNumber < totalPages ? "always" : "auto",
        breakAfter: page.pageNumber < totalPages ? "page" : "auto",
      }}
    >
      {/* ── Background layer (fills entire page) ─────────────────────── */}
      <TemplateBackground
        pattern={pattern}
        accent={accent}
        sidebarWidth={sidebarWidth}
        headerHeight={rects.header.height}
        rects={rects}
      />

      {/* ── Sidebar content (for sidebar patterns) ──────────────────── */}
      {rects.hasSidebar && sidebarBlocks.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: rects.sidebar.x,
            top: rects.sidebar.y,
            width: rects.sidebar.width,
            height: rects.sidebar.height,
            padding: "0 16px",
            zIndex: 2,
            color: "#ffffff",
            overflow: "hidden",
          }}
        >
          {sidebarBlocks.map((block) => (
            <BlockRenderer key={block.id} block={block} accent={accent} isSidebar />
          ))}
        </div>
      )}

      {/* ── Main content layer (uses contentRect — single coordinate) ── */}
      <div
        style={{
          position: "absolute",
          left: rects.content.x,
          top: rects.content.y,
          width: rects.content.width,
          height: rects.content.height,
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        {page.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} accent={accent} />
        ))}
      </div>

      {/* ── Page number indicator (respects padding via usableRect) ──── */}
      {showPageNumber && totalPages > 1 ? (
        <div
          className="print:hidden"
          style={{
            position: "absolute",
            left: rects.usable.x,
            bottom: A4_HEIGHT - rects.usable.y - rects.usable.height + 6,
            right: A4_WIDTH - rects.usable.x - rects.usable.width + 6,
            textAlign: "right",
            zIndex: 20,
            fontSize: 10,
            fontWeight: 500,
            color: "#94a3b8",
          }}
        >
          Page {page.pageNumber} of {totalPages}
        </div>
      ) : null}

      {/* ── CSS reset: eliminate unpredictable default browser margins ── */}
      <style>{`
        .resume-page p,
        .resume-page h1,
        .resume-page h2,
        .resume-page h3,
        .resume-page ul,
        .resume-page ol,
        .resume-page li,
        .resume-page div {
          margin-top: 0;
        }
        .resume-page ul,
        .resume-page li {
          list-style: none;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
