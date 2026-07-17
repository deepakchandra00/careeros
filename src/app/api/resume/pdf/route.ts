import { NextRequest, NextResponse } from "next/server";
import { renderToString } from "react-dom/server";
import * as React from "react";
import type { ResumeData, TemplateStyle } from "@/store/resume-store";
import { ResumePreview } from "@/components/modules/resume-templates";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const FONT_CDN_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;

const PRINT_CSS = `
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; background: #ffffff; }
  .resume-paper {
    width: 794px !important;
    max-width: 100% !important;
    box-shadow: none !important;
    margin: 0 !important;
  }
  /* Smart page breaks — don't cut inside experience/project/education items */
  .resume-paper > div > div,
  .resume-paper > div > section,
  .resume-paper > div > aside {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  img { max-width: 100%; }
`;

/**
 * POST /api/resume/pdf
 * Generates a pixel-perfect, multi-page, ATS-friendly PDF using Puppeteer.
 * Works on Vercel via @sparticuz/chromium.
 */
export async function POST(req: NextRequest) {
  try {
    const { data, style } = (await req.json()) as {
      data: ResumeData;
      style: TemplateStyle;
    };

    if (!data || !style) {
      return NextResponse.json(
        { error: "Missing data or style" },
        { status: 400 }
      );
    }

    // 1. Render the resume template to HTML
    const allSections: Record<string, boolean> = {
      personal: true, summary: true, experience: true, skills: true,
      projects: true, education: true, certifications: true, languages: true,
      awards: true, publications: true, interests: true, references: true,
    };

    const element = React.createElement(ResumePreview, {
      data,
      style,
      sections: allSections,
    });

    const innerHtml = renderToString(element);

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${data.name || "Resume"}</title>${FONT_CDN_LINK}<style>${PRINT_CSS}</style></head><body><div id="root">${innerHtml}</div></body></html>`;

    // 2. Launch Puppeteer with @sparticuz/chromium (Vercel-compatible)
    let chromium: { executablePath: () => Promise<string>; headless: boolean; args: string[] };
    let puppeteer: typeof import("puppeteer-core");

    try {
      chromium = await import("@sparticuz/chromium");
      puppeteer = await import("puppeteer-core");
    } catch {
      return NextResponse.json(
        { error: "PDF dependencies not installed. Run: bun add puppeteer-core @sparticuz/chromium" },
        { status: 500 }
      );
    }

    const executablePath = await chromium.executablePath();

    const browser = await puppeteer.launch({
      executablePath,
      headless: chromium.headless,
      args: chromium.args,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle", timeout: 30000 });
      // Wait for fonts to load
      await page.evaluate(() => document.fonts?.ready);
      await new Promise((r) => setTimeout(r, 1000));

      // 3. Generate PDF with Chrome's native print engine
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
        preferCSSPageSize: false,
      });

      // 4. Return the PDF
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${data.name.replace(/\s+/g, "_")}_Resume.pdf"`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF generation failed";
    console.error("[pdf] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
