"use client";

import * as React from "react";
import type { ResumeData, TemplateStyle } from "@/store/resume-store";
import { ResumePreview } from "@/components/modules/resume-templates";
import { cn } from "@/lib/utils";

/**
 * A4 Page-Based Resume Preview with Automatic Page Reflow
 *
 * Renders the resume as separate A4 pages (210mm × 297mm) instead of
 * one infinitely long page. Uses ResizeObserver to measure content height
 * and automatically split into pages.
 *
 * Features:
 * - Automatic pagination (default)
 * - Page break indicators between pages
 * - Page number badges ("Page X of Y")
 * - Each page has CSS page-break-after for clean PDF generation
 * - Print-optimized (works with window.print())
 */

// A4 dimensions at 96 DPI
const A4_WIDTH_PX = 794;  // 210mm
const A4_HEIGHT_PX = 1123; // 297mm

interface PageBasedPreviewProps {
  data: ResumeData;
  style: TemplateStyle;
  sections: Record<string, boolean>;
  zoom?: number;
  className?: string;
}

export function PageBasedPreview({
  data,
  style,
  sections,
  zoom = 0.75,
  className,
}: PageBasedPreviewProps) {
  const measureRef = React.useRef<HTMLDivElement | null>(null);
  const [totalPages, setTotalPages] = React.useState(1);

  // Measure content height and calculate page count
  React.useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      const fullHeight = el.scrollHeight;
      const pages = Math.max(1, Math.ceil(fullHeight / A4_HEIGHT_PX));
      setTotalPages(pages);
    };

    // Initial measure
    measure();

    // Re-measure on content changes
    const observer = new ResizeObserver(() => measure());
    observer.observe(el);

    // Re-measure after fonts load
    if (document.fonts) {
      document.fonts.ready.then(() => measure());
    }

    const timer = setTimeout(measure, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [data, style, sections]);

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
          <A4Page key={i} pageNumber={i + 1} totalPages={totalPages}>
            <ClippedContent
              data={data}
              style={style}
              sections={sections}
              pageIndex={i}
            />
          </A4Page>
        ))}
      </div>
    </div>
  );
}

/** A single A4 page container */
function A4Page({
  children,
  pageNumber,
  totalPages,
}: {
  children: React.ReactNode;
  pageNumber: number;
  totalPages: number;
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
      {/* Page number badge (hidden in print) */}
      {totalPages > 1 && (
        <div className="absolute bottom-2 right-3 text-[10px] font-medium text-slate-400 print:hidden">
          Page {pageNumber} of {totalPages}
        </div>
      )}
    </div>
  );
}

/**
 * Renders the resume content clipped to a specific page.
 * Uses negative top offset to show only the relevant portion.
 */
function ClippedContent({
  data,
  style,
  sections,
  pageIndex,
}: {
  data: ResumeData;
  style: TemplateStyle;
  sections: Record<string, boolean>;
  pageIndex: number;
}) {
  const offset = pageIndex * A4_HEIGHT_PX;
  return (
    <div
      style={{
        width: `${A4_WIDTH_PX}px`,
        height: `${A4_HEIGHT_PX}px`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: `-${offset}px`,
          left: "0",
          width: `${A4_WIDTH_PX}px`,
        }}
      >
        <ResumePreview data={data} style={style} sections={sections} />
      </div>
    </div>
  );
}
