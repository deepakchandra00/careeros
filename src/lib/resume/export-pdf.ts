"use client";

import type { ResumeData, TemplateStyle } from "@/store/resume-store";

/**
 * Generate a PDF by calling the Playwright PDF mini-service (port 3002)
 * through the gateway. The service renders the same HTML template the user
 * sees in the preview, so the PDF is pixel-accurate with selectable text.
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
