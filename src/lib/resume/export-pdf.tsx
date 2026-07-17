"use client";

import type { ResumeData, TemplateStyle } from "@/store/resume-store";

/**
 * Generate a pixel-perfect PDF using server-side Puppeteer.
 *
 * Flow:
 * 1. Client captures the rendered .resume-paper HTML from the DOM
 * 2. Client sends the HTML to /api/resume/pdf
 * 3. Server launches Puppeteer (Chromium), renders the HTML, generates PDF
 * 4. Chrome's native print engine handles page breaks (selectable text, ATS-friendly)
 * 5. Server returns the PDF buffer → client downloads it
 *
 * This avoids react-dom/server in route handlers (blocked by Next.js 16).
 * Works on Vercel via @sparticuz/chromium.
 */
export async function exportResumePdf(
  data: ResumeData,
  style: TemplateStyle
): Promise<void> {
  // 1. Find the rendered resume element in the DOM
  const existingEl = document.querySelector(".resume-paper") as HTMLElement;
  if (!existingEl) {
    throw new Error("Resume preview not found. Make sure the preview is visible.");
  }

  // 2. Clone and clean up (remove zoom/transform from preview)
  const clone = existingEl.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  clone.style.zoom = "1";
  clone.style.margin = "0";
  clone.style.boxShadow = "none";

  // 3. Get the HTML string
  const innerHtml = clone.outerHTML;

  // 4. Send to server for PDF generation
  const res = await fetch("/api/resume/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html: innerHtml, fileName: data.name }),
  });

  if (!res.ok) {
    let msg = `PDF export failed (HTTP ${res.status})`;
    try {
      const txt = await res.text();
      const j = JSON.parse(txt);
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }

  // 5. Download the PDF
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.name.replace(/\s+/g, "_")}_Resume.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
