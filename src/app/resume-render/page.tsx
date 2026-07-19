"use client";

import * as React from "react";
import type { ResumeData, TemplateStyle } from "@/store/resume-store";
import { PageBasedPreview } from "@/components/modules/page-based-preview";
import { fontStack } from "@/lib/resume/pp";

/**
 * Client Component page that renders a resume template to standalone HTML.
 * The PDF mini-service and thumbnail service fetch this page and convert it.
 *
 * Uses the PagePerfect engine (src/lib/resume/pp/) — the same DOM is used for
 * preview and print, so what you see here is exactly what gets exported.
 */
export default function ResumeRenderPage({
  searchParams,
}: {
  searchParams: { d?: string; s?: string; data?: string; style?: string };
}) {
  let data: ResumeData | null = null;
  let style: TemplateStyle | null = null;
  let error: string | null = null;

  try {
    const dataRaw = searchParams.d
      ? typeof window !== "undefined"
        ? atob(searchParams.d)
        : Buffer.from(searchParams.d, "base64").toString("utf-8")
      : searchParams.data;
    const styleRaw = searchParams.s
      ? typeof window !== "undefined"
        ? atob(searchParams.s)
        : Buffer.from(searchParams.s, "base64").toString("utf-8")
      : searchParams.style;
    if (!dataRaw || !styleRaw) {
      error = "Missing data/style";
    } else {
      data = JSON.parse(dataRaw);
      style = JSON.parse(styleRaw);
    }
  } catch {
    error = "Invalid data/style params";
  }

  if (error) {
    return React.createElement("div", null, error);
  }
  if (!data || !style) {
    return React.createElement("div", null, "Missing data/style");
  }

  const fontCss = fontStack(style.font);

  const allSections: Record<string, boolean> = {
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
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{data.name || "Resume"}</title>
        {/* Google Fonts — loaded via CDN so Playwright can fetch them when rendering standalone HTML */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Georgia&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: ${fontCss};
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .resume-page {
            box-shadow: none !important;
            margin: 0 !important;
          }
          img { max-width: 100%; }
        `}</style>
      </head>
      <body>
        <div id="root">
          <PageBasedPreview
            data={data}
            style={style}
            sections={allSections}
            zoom={1}
          />
        </div>
      </body>
    </html>
  );
}
