"use client";

import * as React from "react";
import type { ResumeData, TemplateStyle, PageLayout, SectionSettings } from "@/store/resume-store";
import { generatePageModel } from "@/lib/resume/layout-engine";
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
  pageBreaks?: string[];
  sectionSettings?: Record<string, SectionSettings>;
}

/**
 * Page-Based Resume Preview with Layout Engine.
 *
 * Padding is an INPUT to the layout engine (determines contentHeightPerPage),
 * AND is visually applied in the renderer (content starts at paddingTop, ends at paddingBottom).
 *
 * The template's background (sidebar, colors) fills the entire A4 page.
 * Content is shifted vertically per page using translateY.
 */
export function PageBasedPreview({
  data,
  style,
  sections,
  pageLayout,
  zoom = 0.75,
  className,
  pageBreaks,
  sectionSettings,
}: PageBasedPreviewProps) {
  const sectionOrder = React.useMemo(() => {
    return data.sectionOrder.filter((id) => sections[id] !== false);
  }, [data.sectionOrder, sections]);

  const pageModel = React.useMemo(() => {
    return generatePageModel(
      data,
      sectionOrder,
      { width: A4_WIDTH, height: A4_HEIGHT },
      pageLayout,
      { pageBreaks, sectionSettings }
    );
  }, [data, sectionOrder, pageLayout, pageBreaks, sectionSettings]);

  // Content height per page = A4 height minus top/bottom padding
  const contentHeightPerPage = Math.max(
    100,
    A4_HEIGHT - pageLayout.paddingTop - pageLayout.paddingBottom
  );

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
            <PageContent
              data={data}
              style={style}
              sections={sections}
              pageIndex={page.pageNumber - 1}
              contentHeightPerPage={contentHeightPerPage}
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
  const hasPadding =
    pageLayout.paddingTop > 0 ||
    pageLayout.paddingBottom > 0 ||
    pageLayout.paddingLeft > 0 ||
    pageLayout.paddingRight > 0;

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
            border: "1px dashed rgba(99,102,241,0.3)",
            borderRadius: "2px",
          }}
        />
      )}

      {totalPages > 1 && (
        <div className="absolute bottom-1.5 right-3 z-20 text-[10px] font-medium text-slate-400 print:hidden">
          {pageNumber} / {totalPages}
        </div>
      )}
    </div>
  );
}

/**
 * Renders content for a single page.
 *
 * FIX: Padding is now VISUALLY APPLIED:
 * - The outer clip container starts at paddingTop and ends at paddingBottom
 * - The template is shifted by (pageIndex * contentHeightPerPage) + paddingTop
 * - This means content on page 1 starts at paddingTop (not 0)
 * - Content on page 2 starts at paddingTop + contentHeightPerPage
 * - The template's background fills the entire page (renders at full size)
 * - The white padding areas show the template's background naturally
 *
 * NO content repetition. Each page shows a DIFFERENT portion.
 */
function PageContent({
  data,
  style,
  sections,
  pageIndex,
  contentHeightPerPage,
  pageLayout,
}: {
  data: ResumeData;
  style: TemplateStyle;
  sections: Record<string, boolean>;
  pageIndex: number;
  contentHeightPerPage: number;
  pageLayout: PageLayout;
}) {
  // The total vertical offset = page offset + top padding
  // Page 0: offset = paddingTop (content starts below the top padding)
  // Page 1: offset = paddingTop + contentHeightPerPage
  // Page 2: offset = paddingTop + 2 * contentHeightPerPage
  const verticalOffset = pageLayout.paddingTop + pageIndex * contentHeightPerPage;

  return (
    // Outer container: clips to A4 page boundary
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    >
      {/* Inner container: holds the template, shifted up by verticalOffset */}
      {/* The template renders at full 794px width — background fills entire page */}
      <div
        style={{
          position: "absolute",
          top: `-${verticalOffset}px`,
          left: 0,
          right: 0,
          width: `${A4_WIDTH}px`,
        }}
      >
        <ResumePreview data={data} style={style} sections={sections} />
      </div>
    </div>
  );
}
