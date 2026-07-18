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
  type LayoutContext,
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
 * Pipeline: Resume JSON → Flow Engine → PageModel → PageRenderer → A4 Pages
 *
 * The flow engine flattens the resume into atomic blocks (section titles,
 * job headers, bullets, paragraphs) and paginates them at the item level.
 * Sidebar content is routed to the sidebar column and paginated independently.
 *
 * Each page renders ONLY the blocks assigned to it — no clipping, no
 * hidden content, no "move whole section" behaviour.
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

  const { pattern, sidebarWidth } = React.useMemo(
    () => getTemplateLayout(style.template),
    [style.template]
  );

  const layout: LayoutContext = React.useMemo(
    () => ({
      pattern,
      sidebarWidth,
      headerBandHeight: pattern === "header-band" ? 120 : 0,
      padding: {
        top: pageLayout.paddingTop ?? 0,
        bottom: pageLayout.paddingBottom ?? 0,
        left: pageLayout.paddingLeft ?? 0,
        right: pageLayout.paddingRight ?? 0,
      },
      pageWidth: A4_WIDTH,
      pageHeight: A4_HEIGHT,
      accent: style.accent,
    }),
    [pattern, sidebarWidth, pageLayout, style.accent]
  );

  const pageModel = React.useMemo(() => {
    return generatePageModel(data, sectionOrder, {
      layout,
      pageBreaks,
      sectionSettings,
    });
  }, [data, sectionOrder, layout, pageBreaks, sectionSettings]);

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
