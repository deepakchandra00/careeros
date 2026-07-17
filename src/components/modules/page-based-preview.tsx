"use client";

import * as React from "react";
import type { ResumeData, TemplateStyle, PageLayout } from "@/store/resume-store";
import { ResumePreview } from "@/components/modules/resume-templates";
import { cn } from "@/lib/utils";

/**
 * A4 Page-Based Resume Preview with Adjustable Padding + Auto-Reflow
 *
 * ┌─────────────────────────────┐  ← .resume-page (fixed 794×1123px)
 * │█████████████████████████████│  ← Template background fills entire page
 * │█  ← Padding (adjustable) →█│
 * │█  ┌─────────────────────┐ █│
 * │█  │ Resume Content       │ █│  ← Content area shrinks as padding grows
 * │█  └─────────────────────┘ █│
 * │█████████████████████████████│
 * └─────────────────────────────┘
 *
 * The template background ALWAYS fills the entire A4 page.
 * Only the content container's padding changes — the background
 * is never removed or clipped.
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
  const contentHeightPerPage = Math.max(100, A4_HEIGHT_PX - pageLayout.paddingTop - pageLayout.paddingBottom);

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
      {/* Hidden measurement container — renders full template to measure height */}
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
      {children}
      {/* Visual padding guide (dashed border, hidden in print) */}
      {(pageLayout.paddingTop > 0 || pageLayout.paddingBottom > 0 || pageLayout.paddingLeft > 0 || pageLayout.paddingRight > 0) && (
        <div
          className="absolute pointer-events-none z-10 print:hidden"
          style={{
            top: `${pageLayout.paddingTop}px`,
            bottom: `${pageLayout.paddingBottom}px`,
            left: `${pageLayout.paddingLeft}px`,
            right: `${pageLayout.paddingRight}px`,
            border: "1px dashed rgba(99,102,241,0.3)",
          }}
        />
      )}
      {totalPages > 1 && (
        <div className="absolute bottom-2 right-3 z-10 text-[10px] font-medium text-slate-400 print:hidden">
          Page {pageNumber} of {totalPages}
        </div>
      )}
    </div>
  );
}

/**
 * Renders the resume content clipped to a specific page.
 *
 * KEY: The template renders at FULL page size (794×1123px) so its background
 * fills the entire A4 page. The content is then visually clipped by the
 * parent's overflow:hidden + negative offset, but the background remains
 * visible in the padding area.
 *
 * This ensures sidebar colors, gradient headers, and other template
 * backgrounds are never removed by padding.
 */
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
  const contentHeight = Math.max(100, A4_HEIGHT_PX - pageLayout.paddingTop - pageLayout.paddingBottom);
  const offset = pageIndex * contentHeight;

  return (
    <div
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        overflow: "hidden",
      }}
    >
      {/* The template renders at full page size — background fills entire page */}
      <div
        style={{
          position: "absolute",
          // Shift up by the offset for this page + down by paddingTop
          // so the content starts below the top padding
          top: `${pageLayout.paddingTop - offset}px`,
          left: `${pageLayout.paddingLeft}px`,
          right: `${pageLayout.paddingRight}px`,
        }}
      >
        <ResumePreview data={data} style={style} sections={sections} />
      </div>
    </div>
  );
}
