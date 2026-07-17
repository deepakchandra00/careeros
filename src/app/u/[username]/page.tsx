"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { ResumePreview } from "@/components/modules/resume-templates";
import { useResumeStore } from "@/store/resume-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText } from "lucide-react";
import Link from "next/link";
import { exportResumePdf } from "@/lib/resume/export-pdf";
import { exportResumeDocx } from "@/lib/resume/export-docx";

/**
 * Public portfolio page: /u/[username]
 *
 * Renders the user's resume in a full-screen layout (no sidebar/topbar).
 * Loads resume data from the Zustand store (localStorage-persisted).
 * Includes download buttons for PDF and Word.
 */
export default function PortfolioPage() {
  const params = useParams();
  const username = params.username as string;
  const data = useResumeStore((s) => s.data);
  const style = useResumeStore((s) => s.style);
  const hydrate = useResumeStore((s) => s.hydrate);
  const [downloading, setDownloading] = React.useState<"pdf" | "docx" | null>(null);

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handlePdf = async () => {
    setDownloading("pdf");
    try {
      await exportResumePdf(data, style);
    } catch (e) {
      console.error("PDF export failed:", e);
    } finally {
      setDownloading(null);
    }
  };

  const handleDocx = async () => {
    setDownloading("docx");
    try {
      await exportResumeDocx(data, style);
    } catch (e) {
      console.error("DOCX export failed:", e);
    } finally {
      setDownloading(null);
    }
  };

  const displayName = data.name || username;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="size-4" />
                Back
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div>
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground">/{username}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handlePdf}
              disabled={downloading !== null}
            >
              {downloading === "pdf" ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Download className="size-3.5" />
              )}
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleDocx}
              disabled={downloading !== null}
            >
              {downloading === "docx" ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <FileText className="size-3.5" />
              )}
              Word
            </Button>
          </div>
        </div>
      </header>

      {/* Resume content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-white">
          <ResumePreview
            data={data}
            style={style}
            sections={{
              personal: true,
              summary: true,
              experience: true,
              skills: true,
              projects: true,
              education: true,
              certifications: true,
              languages: true,
              awards: true,
              publications: true,
              interests: true,
              references: true,
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-4 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-muted-foreground">
          Built with{" "}
          <Link href="/" className="font-medium text-primary hover:underline">
            CareerOS
          </Link>{" "}
          — The Operating System for Your Career
        </div>
      </footer>
    </div>
  );
}
