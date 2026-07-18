"use client";

import * as React from "react";
import type {
  ResumeData,
  TemplateStyle,
  PageLayout,
  SectionSettings,
} from "@/store/resume-store";
import {
  generatePageModel,
  type Insets,
} from "@/lib/resume/layout-engine";
import { PageRenderer } from "@/components/resume/PageRenderer";
import { getTemplateLayout } from "@/components/resume/template-layout";
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
 * PageBasedPreview — block-based resume preview.
 *
 * Pipeline:
 *
 *   Resume JSON → Layout Engine → PageModel (blocks per page)
 *                → PageRenderer (one per page) → A4 pages
 *
 * Each page renders ONLY the blocks assigned to it by the layout engine.
 * The template background (sidebar / header band / colors) is a separate
 * layer that fills the entire page; content sits in a padded frame on top.
 *
 * No `ResumePreview`. No `translateY`. No content repetition.
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
  // Visible section order (respect per-section visibility toggles).
  const sectionOrder = React.useMemo(() => {
    return data.sectionOrder.filter((id) => sections[id] !== false);
  }, [data.sectionOrder, sections]);

  // Convert the store's PageLayout ({ paddingTop, ... }) into the Insets
  // shape ({ top, right, bottom, left }) the layout engine expects.
  // This conversion was missing previously — passing PageLayout directly
  // caused `padding.top` to be `undefined`, which broke pagination.
  const insets: Insets = React.useMemo(
    () => ({
      top: pageLayout.paddingTop ?? 0,
      bottom: pageLayout.paddingBottom ?? 0,
      left: pageLayout.paddingLeft ?? 0,
      right: pageLayout.paddingRight ?? 0,
    }),
    [pageLayout]
  );

  const pageModel = React.useMemo(() => {
    return generatePageModel(
      data,
      sectionOrder,
      { width: A4_WIDTH, height: A4_HEIGHT },
      insets,
      { pageBreaks, sectionSettings }
    );
  }, [data, sectionOrder, insets, pageBreaks, sectionSettings]);

  // Template structural pattern + sidebar width (derived from the template ID
  // via the shared DOCX config so screen + export stay consistent).
  const { pattern, sidebarWidth } = React.useMemo(
    () => getTemplateLayout(style.template),
    [style.template]
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
          <PageRenderer
            key={page.pageNumber}
            page={page}
            accent={style.accent}
            pageLayout={pageLayout}
            pattern={pattern}
            sidebarWidth={sidebarWidth}
            showPageNumber
            totalPages={pageModel.totalPages}
          />
        ))}
      </div>
    </div>
  );
}
