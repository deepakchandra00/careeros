"use client";

import * as React from "react";
import type { ResumeData, TemplateStyle, PageLayout } from "@/store/resume-store";
import { ResumePreview } from "@/components/modules/resume-templates";
import { cn } from "@/lib/utils";

/**
 * A4 Page-Based Resume Preview with Adjustable Padding + Auto-Reflow
 *
 * ┌─────────────────────────────┐  ← .resume-page (fixed 794×1123px)
 * │█  Top Padding (adjustable)█│
 * │█  ┌─────────────────────┐ █│
 * │█  │ Resume Content       │ █│  ← content area shrinks as padding grows
 * │█  └─────────────────────┘ █│
 * │█  Bottom Padding         █│
 * └─────────────────────────────┘
 *
 * When padding increases → content height decreases → fewer items fit
 * per page → content auto-reflows to next page.
 */

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

interface PageBasedPreviewProps {
  data: ResumeData;
  style: TemplateStyle;
  sections: Record<string, boolean>;
  pageLayout: PageLayout;
  zoom?: number;
  className?: string;
}

export function PageBasedPreview({
  data,
  style,
  sections,
  pageLayout,
  zoom = 0.75,
  className,
}: PageBasedPreviewProps) {
  const measureRef = React.useRef<HTMLDivElement | null>(null);
  const [totalPages, setTotalPages] = React.useState(1);

  // Content height per page = A4 height minus top/bottom padding
  const contentHeightPerPage = A4_HEIGHT_PX - pageLayout.paddingTop - pageLayout.paddingBottom;

  React.useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      const fullHeight = el.scrollHeight;
      const pages = Math.max(1, Math.ceil(fullHeight / contentHeightPerPage));
      setTotalPages(pages);
    };

    measure();

    const observer = new ResizeObserver(() => measure());
    observer.observe(el);

    if (document.fonts) {
      document.fonts.ready.then(() => measure());
    }

    const timer = setTimeout(measure, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [data, style, sections, contentHeightPerPage]);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        style={{
          position: "absolute",
          left: "-99999px",
          top: "0",
          width: `${A4_WIDTH_PX}px`,
          visibility: "hidden",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <ResumePreview data={data} style={style} sections={sections} />
      </div>

      {/* Visible A4 pages */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          transition: "transform 0.15s ease",
        }}
        className="flex flex-col items-center gap-4 print:!scale-100 print:!transform-none"
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <A4Page
            key={i}
            pageNumber={i + 1}
            totalPages={totalPages}
            pageLayout={pageLayout}
          >
            <ClippedContent
              data={data}
              style={style}
              sections={sections}
              pageIndex={i}
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
  return (
    <div
      className="resume-page relative bg-white shadow-lg print:!shadow-none"
      style={{
        width: `${A4_WIDTH_PX}px`,
        minHeight: `${A4_HEIGHT_PX}px`,
        maxHeight: `${A4_HEIGHT_PX}px`,
        overflow: "hidden",
        pageBreakAfter: !isLast ? "always" : "auto",
        breakAfter: !isLast ? "page" : "auto",
      }}
    >
      {/* Visual padding guide (dashed border, hidden in print) */}
      {(pageLayout.paddingTop > 0 || pageLayout.paddingBottom > 0 || pageLayout.paddingLeft > 0 || pageLayout.paddingRight > 0) && (
        <div
          className="absolute pointer-events-none print:hidden"
          style={{
            top: `${pageLayout.paddingTop}px`,
            bottom: `${pageLayout.paddingBottom}px`,
            left: `${pageLayout.paddingLeft}px`,
            right: `${pageLayout.paddingRight}px`,
            border: "1px dashed rgba(0,0,0,0.1)",
          }}
        />
      )}
      {children}
      {totalPages > 1 && (
        <div className="absolute bottom-2 right-3 text-[10px] font-medium text-slate-400 print:hidden">
          Page {pageNumber} of {totalPages}
        </div>
      )}
    </div>
  );
}

function ClippedContent({
  data,
  style,
  sections,
  pageIndex,
  pageLayout,
}: {
  data: ResumeData;
  style: TemplateStyle;
  sections: Record<string, boolean>;
  pageIndex: number;
  pageLayout: PageLayout;
}) {
  const contentHeight = A4_HEIGHT_PX - pageLayout.paddingTop - pageLayout.paddingBottom;
  const offset = pageIndex * contentHeight;

  return (
    <div
      style={{
        position: "absolute",
        top: `${pageLayout.paddingTop}px`,
        left: `${pageLayout.paddingLeft}px`,
        right: `${pageLayout.paddingRight}px`,
        bottom: `${pageLayout.paddingBottom}px`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: `-${offset}px`,
          left: "0",
          right: "0",
        }}
      >
        <ResumePreview data={data} style={style} sections={sections} />
      </div>
    </div>
  );
}
