"use client";

import * as React from "react";
import { useResumeStore } from "@/store/resume-store";
import { PageBasedPreview } from "@/components/modules/page-based-preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

/**
 * Clean Print Preview Route — /resume/preview
 *
 * Renders ONLY A4 pages (no sidebar, no toolbar, no editor).
 * User clicks "Print" → window.print() → browser saves as PDF.
 *
 * Each .resume-page has CSS page-break-after: always
 * so Chrome prints each A4 page as a separate PDF page.
 */
export default function PrintPreviewPage() {
  const data = useResumeStore((s) => s.data);
  const style = useResumeStore((s) => s.style);
  const pageLayout = useResumeStore((s) => s.pageLayout);
  const hydrate = useResumeStore((s) => s.hydrate);

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  const allSections: Record<string, boolean> = {
    personal: true, summary: true, experience: true, skills: true,
    projects: true, education: true, certifications: true, languages: true,
    awards: true, publications: true, interests: true, references: true,
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Print bar (hidden in print) */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="size-4" />
              Back to Editor
            </Button>
          </Link>
          <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print / Save as PDF
          </Button>
        </div>
      </header>

      {/* A4 Pages */}
      <main className="mx-auto max-w-5xl px-4 py-8 print:p-0">
        <div className="flex flex-col items-center gap-6 print:gap-0">
          <PageBasedPreview
            data={data}
            style={style}
            sections={allSections}
            pageLayout={pageLayout}
            zoom={1}
          />
        </div>
      </main>

      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .resume-page {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
          }
          .resume-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}
