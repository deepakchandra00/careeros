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
 * The layout engine calculates page count based on the content frame
 * (page size minus padding). The template renders at full page size.
 * Content is shifted vertically per page using translateY.
 *
 * NO content repetition. Each page shows a DIFFERENT portion of the resume.
 * The template's background (sidebar, colors) fills every page naturally.
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
 * CRITICAL FIX: The template renders ONCE per page, but shifted vertically
 * by (pageIndex * contentHeightPerPage) so each page shows a DIFFERENT
 * portion of the resume. This prevents content repetition.
 *
 * The template's background (sidebar, colors, gradients) fills the entire
 * A4 page on every page because it renders at full size. Only the text
 * content scrolls between pages.
 *
 * Padding is an INPUT to the layout engine (determines contentHeightPerPage),
 * NOT a CSS hack applied to the template.
 */
function PageContent({
  data,
  style,
  sections,
  pageIndex,
  contentHeightPerPage,
  pageLayout: _pageLayout,
}: {
  data: ResumeData;
  style: TemplateStyle;
  sections: Record<string, boolean>;
  pageIndex: number;
  contentHeightPerPage: number;
  pageLayout: PageLayout;
}) {
  // Calculate vertical offset: page 0 = 0px, page 1 = contentHeight, page 2 = 2*contentHeight
  const verticalOffset = pageIndex * contentHeightPerPage;

  return (
    // Outer container: clips to A4 page boundary (overflow hidden)
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
      {/* This shows a DIFFERENT portion of the resume on each page */}
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
