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
  type PageBlock,
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
 * Pipeline: Resume JSON → Layout Engine → PageModel → PageRenderer → A4 Pages
 *
 * Each page renders ONLY the blocks assigned to it by the layout engine.
 * Sidebar blocks (contact, skills, languages) are separated from main blocks.
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

  const { pattern, sidebarWidth } = React.useMemo(
    () => getTemplateLayout(style.template),
    [style.template]
  );

  // Separate sidebar blocks from main content blocks
  // Sidebar blocks: contact, skills, languages, certifications
  // These render in the sidebar area (for sidebar templates)
  const sidebarSectionIds = new Set(["personal", "skills", "languages", "certifications"]);
  const isSidebarPattern = pattern === "sidebar-left" || pattern === "sidebar-right";

  // Extract sidebar blocks from page 1 (they typically appear at the start)
  const sidebarBlocks: PageBlock[] = React.useMemo(() => {
    if (!isSidebarPattern) return [];
    const allBlocks = pageModel.pages.flatMap((p) => p.blocks);
    return allBlocks.filter((b) => {
      // Check if this block belongs to a sidebar section
      const blockData = b.data as { sectionType?: string; isHeader?: boolean };
      if (blockData?.isHeader) {
        // Check if the header is for a sidebar section
        const sectionType = blockData.sectionType as string;
        return sidebarSectionIds.has(sectionType);
      }
      return false;
    });
  }, [pageModel, isSidebarPattern]);

  // Filter out sidebar blocks from page blocks (so they don't render twice)
  const filteredPages = React.useMemo(() => {
    if (!isSidebarPattern) return pageModel.pages;
    return pageModel.pages.map((page) => ({
      ...page,
      blocks: page.blocks.filter((b) => {
        const blockData = b.data as { sectionType?: string; isHeader?: boolean };
        if (blockData?.isHeader && sidebarSectionIds.has(blockData.sectionType as string)) {
          return false; // Remove sidebar section headers from main content
        }
        // Also remove sidebar section content blocks
        // Check by block type
        const sidebarTypes = new Set(["contact", "skills", "languages", "certifications"]);
        if (sidebarTypes.has(b.type)) {
          return false;
        }
        return true;
      }),
    }));
  }, [pageModel, isSidebarPattern]);

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
        {filteredPages.map((page) => (
          <PageRenderer
            key={page.pageNumber}
            page={page}
            accent={style.accent}
            pageLayout={pageLayout}
            pattern={pattern}
            sidebarWidth={sidebarWidth}
            showPageNumber
            totalPages={pageModel.totalPages}
            sidebarBlocks={page.pageNumber === 1 ? sidebarBlocks : []}
          />
        ))}
      </div>
    </div>
  );
}
