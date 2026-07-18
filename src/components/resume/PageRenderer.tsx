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
 * FIXES applied (Issues 1, 3, 4):
 *
 *   Issue 1: Removed overflow:hidden from content & sidebar layers.
 *            The paginator MUST guarantee fitting — the renderer must
 *            NEVER hide data. If content overflows, it's visible (and
 *            the user sees the bug) rather than silently clipped.
 *
 *   Issue 3: Content & sidebar use top+bottom absolute positioning
 *            instead of fixed height. This is more reliable for print.
 *
 *   Issue 4: Removed pageBreakAfter (kept only breakAfter). Chrome's
 *            print engine has conflicts when both are present.
 *
 * The page-level container still has overflow:hidden — that's needed
 * for the A4 boundary (background color, sidebar fill). But the CONTENT
 * layers inside flow naturally.
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
        // Page-level overflow:hidden is needed for the A4 boundary
        // (background color, sidebar fill). Content layers inside do NOT
        // have overflow:hidden — they flow naturally.
        overflow: "hidden",
        position: "relative",
        boxSizing: "border-box",
        // Issue 4: Use ONLY breakAfter (modern CSS). Don't use pageBreakAfter
        // alongside it — Chrome's print engine has conflicts when both present.
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
      {/* Issue 1: NO overflow:hidden — content flows naturally */}
      {/* Issue 3: Use top+bottom instead of fixed height for print reliability */}
      {rects.hasSidebar && sidebarBlocks.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: rects.sidebar.x,
            top: rects.sidebar.y,
            bottom: A4_HEIGHT - rects.sidebar.y - rects.sidebar.height,
            width: rects.sidebar.width,
            padding: "0 16px",
            zIndex: 2,
            color: "#ffffff",
          }}
        >
          {sidebarBlocks.map((block) => (
            <BlockRenderer key={block.id} block={block} accent={accent} isSidebar />
          ))}
        </div>
      )}

      {/* ── Main content layer (uses contentRect — single coordinate) ── */}
      {/* Issue 1: NO overflow:hidden — content flows naturally */}
      {/* Issue 3: Use top+bottom instead of fixed height for print reliability */}
      <div
        style={{
          position: "absolute",
          left: rects.content.x,
          top: rects.content.y,
          bottom: A4_HEIGHT - rects.content.y - rects.content.height,
          width: rects.content.width,
          zIndex: 1,
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
