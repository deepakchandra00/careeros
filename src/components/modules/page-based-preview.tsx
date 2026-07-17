"use client";

import * as React from "react";
import type { ResumeData, TemplateStyle } from "@/store/resume-store";
import { ResumePreview } from "@/components/modules/resume-templates";
import { cn } from "@/lib/utils";

/**
 * A4 Page-Based Resume Preview with Automatic Page Reflow
 *
 * Instead of one infinitely long page, this component:
 * 1. Renders the resume template in a hidden measurement container
 * 2. Measures the total height of the rendered content
 * 3. Splits the content into A4 pages (297mm = ~1123px at 96dpi)
 * 4. Displays each page as a separate A4 sheet with page breaks
 * 5. Uses CSS `page-break-after: always` for clean PDF pagination
 *
 * The browser's native print engine handles the actual PDF generation,
 * producing perfect multi-page PDFs with selectable text.
 */

// A4 dimensions at 96 DPI (screen) and mm (print)
const A4_WIDTH_PX = 794;  // 210mm at 96dpi
const A4_HEIGHT_PX = 1123; // 297mm at 96dpi
const A4_PADDING_PX = 0;   // templates handle their own padding

interface PageBasedPreviewProps {
  data: ResumeData;
  style: TemplateStyle;
  sections: Record<string, boolean>;
  zoom?: number;
  className?: string;
}

interface A4Page {
  startIndex: number;
  endIndex: number;
}

/**
 * Hook that measures the rendered content height and calculates
 * how many A4 pages are needed and where to split them.
 */
function usePageBreaks(
  data: ResumeData,
  style: TemplateStyle,
  sections: Record<string, boolean>
): { totalPages: number; pageBreaks: A4Page[]; measureRef: React.RefObject<HTMLDivElement | null> } {
  const measureRef = React.useRef<HTMLDivElement | null>(null);
  const [totalPages, setTotalPages] = React.useState(1);
  const [pageBreaks, setPageBreaks] = React.useState<A4Page[]>([{ startIndex: 0, endIndex: 0 }]);

  React.useEffect(() => {
    if (!measureRef.current) return;

    const measure = () => {
      const el = measureRef.current;
      if (!el) return;

      const fullHeight = el.scrollHeight;
      const pagesNeeded = Math.max(1, Math.ceil(fullHeight / A4_HEIGHT_PX));
      setTotalPages(pagesNeeded);

      // Calculate page breaks — distribute content evenly across pages
      const breaks: A4Page[] = [];
      for (let i = 0; i < pagesNeeded; i++) {
        breaks.push({
          startIndex: i * A4_HEIGHT_PX,
          endIndex: Math.min((i + 1) * A4_HEIGHT_PX, fullHeight),
        });
      }
      setPageBreaks(breaks);
    };

    // Initial measure
    measure();

    // Re-measure on content changes using ResizeObserver
    const observer = new ResizeObserver(() => {
      measure();
    });

    observer.observe(measureRef.current);

    // Also re-measure after fonts load
    if (document.fonts) {
      document.fonts.ready.then(() => measure());
    }

    // Re-measure after a delay (for images, dynamic content)
    const timer = setTimeout(measure, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [data, style, sections]);

  return { totalPages, pageBreaks, measureRef };
}

export function PageBasedPreview({
  data,
  style,
  sections,
  zoom = 0.75,
  className,
}: PageBasedPreviewProps) {
  const { totalPages, measureRef } = usePageBreaks(data, style, sections);

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* Hidden measurement container — renders the full template to measure height */}
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
        className="flex flex-col items-center gap-6 print:!scale-100 print:!transform-none"
      >
        {Array.from({ length: totalPages }, (_, pageIndex) => (
          <A4Page
            key={pageIndex}
            pageNumber={pageIndex + 1}
            totalPages={totalPages}
          >
            <ClippedResumeContent
              data={data}
              style={style}
              sections={sections}
              pageIndex={pageIndex}
            />
          </A4Page>
        ))}
      </div>
    </div>
  );
}

/**
 * A single A4 page container.
 */
function A4Page({
  children,
  pageNumber,
  totalPages,
}: {
  children: React.ReactNode;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <div
      className="resume-page relative bg-white shadow-lg print:!shadow-none"
      style={{
        width: `${A4_WIDTH_PX}px`,
        minHeight: `${A4_HEIGHT_PX}px`,
        maxHeight: `${A4_HEIGHT_PX}px`,
        overflow: "hidden",
        pageBreakAfter: totalPages > 1 && pageNumber < totalPages ? "always" : "auto",
        breakAfter: totalPages > 1 && pageNumber < totalPages ? "page" : "auto",
      }}
    >
      {children}
      {/* Page number badge (hidden in print) */}
      {totalPages > 1 && (
        <div className="absolute bottom-2 right-3 text-[10px] font-medium text-muted-foreground/50 print:hidden">
          Page {pageNumber} of {totalPages}
        </div>
      )}
    </div>
  );
}

/**
 * Renders the resume content clipped to a specific page.
 *
 * Uses CSS clip-path to show only the portion of the resume that belongs
 * to this page. This is simpler than DOM splitting and works for all templates.
 */
function ClippedResumeContent({
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
  const clipTop = pageIndex * A4_HEIGHT_PX;
  const clipBottom = clipTop + A4_HEIGHT_PX;

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
          top: `-${clipTop}px`,
          left: "0",
          width: `${A4_WIDTH_PX}px`,
          // The content flows from the negative offset, clipped by the parent
        }}
      >
        <ResumePreview data={data} style={style} sections={sections} />
      </div>
    </div>
  );
}

/**
 * Print-optimized version for PDF export.
 * Renders all content in a single flow with page-break CSS.
 * Used by the print window (export-pdf.tsx).
 */
export function PrintableResume({
  data,
  style,
  sections,
}: {
  data: ResumeData;
  style: TemplateStyle;
  sections: Record<string, boolean>;
}) {
  return (
    <div className="printable-resume">
      <ResumePreview data={data} style={style} sections={sections} />
    </div>
  );
}
