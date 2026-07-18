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
 * The flow engine assigns each page:
 *   - `blocks`        → main content column (flows top-to-bottom)
 *   - `sidebarBlocks` → sidebar column (for sidebar-left/right patterns)
 *
 * The sidebar column has NO overflow:hidden — content flows naturally.
 * The page-level overflow:hidden clips only at the A4 boundary (needed
 * for clean page breaks in print).
 *
 * For header-band patterns, the header (name/contacts) is part of the
 * main content and renders below the colored band.
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
  const isSidebarLeft = pattern === "sidebar-left";
  const isSidebarRight = pattern === "sidebar-right";
  const isHeaderBand = pattern === "header-band";
  const hasSidebar = isSidebarLeft || isSidebarRight;

  const headerBandHeight = isHeaderBand ? 120 : 0;
  const paddingTop = pageLayout.paddingTop + headerBandHeight;
  const paddingBottom = pageLayout.paddingBottom;

  // For sidebar layouts: main content is next to the sidebar.
  const mainPaddingLeft = hasSidebar && isSidebarLeft ? 0 : pageLayout.paddingLeft;
  const mainPaddingRight = hasSidebar && isSidebarRight ? 0 : pageLayout.paddingRight;

  const sidebarBlocks = page.sidebarBlocks || [];

  return (
    <div
      className="resume-page relative bg-white shadow-lg print:!shadow-none"
      style={{
        width: A4_WIDTH,
        height: A4_HEIGHT,
        overflow: "hidden", // Clip at PAGE level — needed for clean A4 boundary in print
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
        headerHeight={headerBandHeight}
      />

      {/* ── Sidebar content (for sidebar patterns) ──────────────────── */}
      {hasSidebar && sidebarBlocks.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: paddingTop,
            bottom: paddingBottom,
            [isSidebarLeft ? "left" : "right"]: 0,
            width: sidebarWidth,
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

      {/* ── Main content layer (padded frame) ───────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop,
          paddingBottom,
          paddingLeft: hasSidebar && isSidebarLeft ? sidebarWidth + mainPaddingLeft : mainPaddingLeft,
          paddingRight: hasSidebar && isSidebarRight ? sidebarWidth + mainPaddingRight : mainPaddingRight,
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        {page.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} accent={accent} />
        ))}
      </div>

      {/* ── Page number indicator (screen only, hidden in print) ────── */}
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
