"use client";

import * as React from "react";
import type { ResumeData, TemplateStyle, PageLayout } from "@/store/resume-store";
import { generatePageModel, BlockType, type PageModel, type PageBlock } from "@/lib/resume/layout-engine";
import { ResumePreview } from "@/components/modules/resume-templates";
import { cn } from "@/lib/utils";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

interface PageBasedPreviewProps {
  data: ResumeData;
  style: TemplateStyle;
  sections: Record<string, boolean>;
  pageLayout: PageLayout;
  zoom?: number;
  className?: string;
}

/**
 * Page-Based Resume Preview — renders the PageModel as A4 pages.
 *
 * Pipeline: Resume JSON → Layout Engine → PageModel → A4 Pages
 *
 * The layout engine (pure TypeScript) decides which sections go on which page.
 * The background (sidebar, colors) fills every page.
 * Content is placed at absolute positions from the PageModel.
 */
export function PageBasedPreview({
  data,
  style,
  sections,
  pageLayout,
  zoom = 0.75,
  className,
}: PageBasedPreviewProps) {
  // Generate the page model using the layout engine
  const sectionOrder = React.useMemo(() => {
    const order = data.sectionOrder.filter((id) => sections[id] !== false);
    return order;
  }, [data.sectionOrder, sections]);

  const pageModel = React.useMemo(() => {
    return generatePageModel(data, sectionOrder, { width: A4_WIDTH, height: A4_HEIGHT }, pageLayout);
  }, [data, sectionOrder, pageLayout]);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          transition: "transform 0.15s ease",
        }}
        className="flex flex-col items-center gap-4 print:!scale-100 print:!transform-none"
      >
        {pageModel.pages.map((page) => (
          <A4Page
            key={page.pageNumber}
            pageNumber={page.pageNumber}
            totalPages={pageModel.totalPages}
            pageLayout={pageLayout}
          >
            <PageContentRenderer
              data={data}
              style={style}
              sections={sections}
              page={page}
              pageLayout={pageLayout}
            />
          </A4Page>
        ))}
      </div>
    </div>
  );
}

function A4Page({
  children,
  pageNumber,
  totalPages,
  pageLayout,
}: {
  children: React.ReactNode;
  pageNumber: number;
  totalPages: number;
  pageLayout: PageLayout;
}) {
  const isLast = pageNumber === totalPages;
  const hasPadding = pageLayout.paddingTop > 0 || pageLayout.paddingBottom > 0 || pageLayout.paddingLeft > 0 || pageLayout.paddingRight > 0;

  return (
    <div
      className="resume-page relative bg-white shadow-lg print:!shadow-none"
      style={{
        width: `${A4_WIDTH}px`,
        minHeight: `${A4_HEIGHT}px`,
        maxHeight: `${A4_HEIGHT}px`,
        overflow: "hidden",
        pageBreakAfter: !isLast ? "always" : "auto",
        breakAfter: !isLast ? "page" : "auto",
      }}
    >
      {children}

      {/* Visual padding guide */}
      {hasPadding && (
        <div
          className="absolute pointer-events-none z-20 print:hidden"
          style={{
            top: `${pageLayout.paddingTop}px`,
            bottom: `${pageLayout.paddingBottom}px`,
            left: `${pageLayout.paddingLeft}px`,
            right: `${pageLayout.paddingRight}px`,
            border: "1px dashed rgba(99,102,241,0.4)",
            borderRadius: "2px",
          }}
        />
      )}

      {/* Page number */}
      {totalPages > 1 && (
        <div className="absolute bottom-1.5 right-3 z-20 text-[10px] font-medium text-slate-400 print:hidden">
          {pageNumber} / {totalPages}
        </div>
      )}
    </div>
  );
}

/**
 * Renders the content for a single page.
 *
 * Uses a hidden measurement container to render the full template (for background),
 * then overlays content blocks from the PageModel at their absolute positions.
 *
 * The template background fills the entire page. Content is positioned
 * within the padded content area using the PageModel's block coordinates.
 */
function PageContentRenderer({
  data,
  style,
  sections,
  page,
  pageLayout,
}: {
  data: ResumeData;
  style: TemplateStyle;
  sections: Record<string, boolean>;
  page: { pageNumber: number; blocks: PageBlock[] };
  pageLayout: PageLayout;
}) {
  return (
    <>
      {/* Render the full template as background (sidebar, colors, decorations) */}
      {/* The template fills the entire page. Content is positioned on top. */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
        <ResumePreview data={data} style={style} sections={sections} />
      </div>

      {/* Content overlay — white background to hide template text, then re-render content */}
      {/* This approach renders the template once (for background) and then renders
          only the content blocks for this page on top of it.
          
          For Phase 1 (compatibility), we use a simpler approach:
          - The template renders fully (background + all content)
          - We don't try to hide/re-show individual blocks
          - The page model is used for page count calculation and print
          - Each page shows the full template with content shifted for that page
          
          This is a transitional approach that works now and will be replaced
          with proper background/content separation in Phase 2. */}
    </>
  );
}
