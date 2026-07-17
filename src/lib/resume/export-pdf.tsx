"use client";

import type { ResumeData, TemplateStyle } from "@/store/resume-store";

/**
 * Generate a pixel-perfect PDF by calling the server-side Puppeteer API.
 *
 * The server renders the exact same React template component and uses
 * Chrome's native print engine for perfect multi-page breaks, selectable
 * text, and ATS-friendly output.
 *
 * Works on Vercel via @sparticuz/chromium.
 */
export async function exportResumePdf(
  data: ResumeData,
  style: TemplateStyle
): Promise<void> {
  const res = await fetch("/api/resume/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, style }),
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
