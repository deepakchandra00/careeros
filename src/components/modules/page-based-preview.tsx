"use client";

import * as React from "react";
import type {
  ResumeData,
  TemplateStyle,
  PageLayout,
  SectionSettings,
} from "@/store/resume-store";
import {
  ResumeDocument,
  PAGE_WIDTH_PX,
  PAGE_HEIGHT_PX,
  toPagePerfectResume,
  resolveTemplate,
  type Resume,
  type Template,
} from "@/lib/resume/pp";
import { cn } from "@/lib/utils";

interface PageBasedPreviewProps {
  data: ResumeData;
  style: TemplateStyle;
  sections: Record<string, boolean>;
  pageLayout?: PageLayout;
  zoom?: number;
  className?: string;
  pageBreaks?: string[];
  sectionSettings?: Record<string, SectionSettings>;
  repeatSidebar?: boolean;
  /** Called when the engine finishes measuring & paginating, with the total
   * number of A4 pages the resume occupies. */
  onPageCount?: (n: number) => void;
}

/**
 * PageBasedPreview — resume preview powered by the PagePerfect engine.
 *
 * Pipeline (adapted from pageperfect-resume-engine):
 *   ResumeData → adapter → PagePerfect Resume
 *   templateId + style → template-bridge → PagePerfect Template
 *   Resume + Template → ResumeDocument (measure → paginate → render)
 *
 * The same DOM is used for preview and print, so preview matches print exactly.
 * Templates are pure configuration; adding one requires no engine changes.
 *
 * Key properties:
 *   - Real DOM measurement (portal-based) — what fits on a page mathematically
 *     is exactly what draws on the page.
 *   - Entry splitting across pages (bullet lists that don't fit get split:
 *     first page gets N bullets, second page gets the rest as a continuation).
 *   - Preview DOM IS the print DOM (visibility-based print CSS).
 *
 * The `pageLayout`, `pageBreaks`, `sectionSettings`, and `repeatSidebar` props
 * are accepted for API compatibility with the old engine but are not used — the
 * PagePerfect engine handles pagination automatically via real DOM measurement.
 */
export function PageBasedPreview({
  data,
  style,
  sections,
  pageLayout: _pageLayout,
  zoom = 0.75,
  className,
  pageBreaks: _pageBreaks,
  sectionSettings: _sectionSettings,
  repeatSidebar: _repeatSidebar,
  onPageCount,
}: PageBasedPreviewProps) {
  // Build the PagePerfect Resume from our store data, filtered by `sections`.
  const resume: Resume = React.useMemo(() => {
    const full = toPagePerfectResume(data);
    // When showPhoto is false, strip the photo so the engine doesn't render it
    if (style.showPhoto === false) {
      full.profile = { ...full.profile, photo: "" };
    }
    return filterSections(full, sections);
  }, [data, sections, style.showPhoto]);

  // Resolve the PagePerfect Template with the user's accent/font.
  const template: Template = React.useMemo(
    () => resolveTemplate(style),
    [style],
  );

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        id="pp-print-root"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24 * zoom,
          width: PAGE_WIDTH_PX * zoom,
        }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            width: PAGE_WIDTH_PX,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <ResumeDocument
              resume={resume}
              template={template}
              onPageCount={onPageCount}
              repeatSidebar={style.repeatSidebar !== false}
            />
          </div>
        </div>
      </div>

      {/* Print CSS — the preview DOM IS the printed output */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          html,
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          /* Hide everything, then reveal only the resume pages */
          body * {
            visibility: hidden !important;
          }
          #pp-print-root,
          #pp-print-root * {
            visibility: visible !important;
          }
          /* Neutralize layout wrappers (flex containers, scroll areas, zoom) */
          #pp-print-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: ${PAGE_WIDTH_PX}px !important;
            height: auto !important;
            overflow: visible !important;
            display: block !important;
            gap: 0 !important;
          }
          #pp-print-root > div,
          #pp-print-root > div > div,
          #pp-print-root > div > div > div {
            transform: none !important;
            width: ${PAGE_WIDTH_PX}px !important;
            gap: 0 !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .resume-page {
            width: ${PAGE_WIDTH_PX}px !important;
            height: ${PAGE_HEIGHT_PX}px !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
            border: 0 !important;
            overflow: hidden !important;
            margin: 0 !important;
          }
          .resume-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        }
        .resume-page {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 12px 32px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
}

// ── Section filtering ───────────────────────────────────────────────────────
//
// Our store passes a `sections: Record<string, boolean>` map. When a section is
// toggled off we strip the corresponding data from the PagePerfect Resume so the
// engine never sees it (and never renders it).

function filterSections(resume: Resume, sections: Record<string, boolean>): Resume {
  const want = (id: string): boolean => sections[id] !== false;
  return {
    ...resume,
    summary: want("summary") ? resume.summary : "",
    experience: want("experience") ? resume.experience : [],
    projects: want("projects") ? resume.projects : [],
    education: want("education") ? resume.education : [],
    skills: want("skills") ? resume.skills : [],
    certifications: want("certifications") ? resume.certifications : [],
    languages: want("languages") ? resume.languages : [],
    awards: want("awards") ? resume.awards : [],
    publications: want("publications") ? resume.publications : [],
    interests: want("interests") ? resume.interests : [],
    references: want("references") ? resume.references : [],
    // profile is always shown
    profile: resume.profile,
  };
}
