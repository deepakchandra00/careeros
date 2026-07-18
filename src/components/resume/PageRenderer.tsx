"use client";

import * as React from "react";
import { A4_WIDTH, A4_HEIGHT, type Page } from "@/lib/resume/layout-engine/types";
import type { PageLayout, ResumeData } from "@/store/resume-store";
import { TemplateBackground } from "./TemplateBackground";
import { BlockRenderer } from "./BlockRenderer";
import type { TemplatePattern } from "./template-layout";

/**
 * PageRenderer — renders ONE A4 page from the PageModel.
 *
 * FIX: Removed `overflow: hidden` from the content layer.
 * Content flows naturally. The layout engine already decided which
 * blocks belong on this page — no clipping needed.
 *
 * FIX: Background + sidebar content rendered together.
 * The sidebar shows contact/skills/etc. (not just a colored div).
 */
export function PageRenderer({
  page,
  accent,
  pageLayout,
  pattern,
  sidebarWidth = 0,
  showPageNumber = false,
  totalPages = 1,
  sidebarBlocks = [],
}: {
  page: Page;
  accent: string;
  pageLayout: PageLayout;
  pattern: TemplatePattern;
  sidebarWidth?: number;
  showPageNumber?: boolean;
  totalPages?: number;
  /** Blocks that should render in the sidebar (contact, skills, etc.) */
  sidebarBlocks?: Page["blocks"];
}) {
  const isSidebarLeft = pattern === "sidebar-left";
  const isSidebarRight = pattern === "sidebar-right";
  const isHeaderBand = pattern === "header-band";
  const hasSidebar = isSidebarLeft || isSidebarRight;

  const headerBandHeight = isHeaderBand ? 120 : 0;
  const paddingTop = pageLayout.paddingTop + headerBandHeight;
  const paddingBottom = pageLayout.paddingBottom;

  // For sidebar layouts: main content is next to the sidebar
  // For non-sidebar: content uses full width with padding
  const mainPaddingLeft = hasSidebar && isSidebarLeft ? 0 : pageLayout.paddingLeft;
  const mainPaddingRight = hasSidebar && isSidebarRight ? 0 : pageLayout.paddingRight;

  return (
    <div
      className="resume-page relative bg-white shadow-lg print:!shadow-none"
      style={{
        width: A4_WIDTH,
        height: A4_HEIGHT,
        overflow: "hidden", // Clip at PAGE level (not content level) — needed for A4 boundary
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
      {hasSidebar && sidebarBlocks && sidebarBlocks.length > 0 && (
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
            overflow: "hidden",
          }}
        >
          {sidebarBlocks.map((block) => (
            <BlockRenderer key={block.id} block={block} accent={accent} isSidebar />
          ))}
        </div>
      )}

      {/* ── Main content layer (padded frame, NO overflow:hidden) ────── */}
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
          // NO overflow:hidden — content flows naturally
          // The layout engine already decided which blocks fit on this page
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
    </div>
  );
}
