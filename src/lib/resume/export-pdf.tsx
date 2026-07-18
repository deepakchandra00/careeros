"use client";

import type { ResumeData, TemplateStyle } from "@/store/resume-store";

/**
 * Generate a PDF by opening the clean print preview route.
 *
 * Flow:
 * 1. Open /resume/preview in a new tab
 * 2. The preview page renders A4 pages from the PageModel
 * 3. User clicks "Print" → window.print() → browser saves as PDF
 *
 * This approach:
 * - Works on Vercel (no server-side Chromium needed)
 * - Produces perfect multi-page PDFs with selectable text
 * - Uses the layout engine's PageModel for pagination
 * - Clean print view (no editor, no toolbar, no drag handles)
 */
export async function exportResumePdf(
  data: ResumeData,
  style: TemplateStyle
): Promise<void> {
  // Open the print preview route in a new tab
  const printWindow = window.open("/resume/preview", "_blank");
  if (!printWindow) {
    throw new Error("Pop-up blocked. Please allow pop-ups to download the PDF.");
  }
  // The print preview page will auto-load the resume from the store
  // and the user can click "Print" to save as PDF
}
