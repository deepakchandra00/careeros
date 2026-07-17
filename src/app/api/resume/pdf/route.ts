import { NextRequest, NextResponse } from "next/server";

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
  img { max-width: 100%; }
`;

/**
 * POST /api/resume/pdf
 *
 * Receives the already-rendered HTML from the client (captured from the DOM)
 * and uses Puppeteer to generate a pixel-perfect, multi-page PDF.
 *
 * This avoids importing react-dom/server in the route handler (which
 * Next.js 16 blocks). The client captures the HTML and sends it here.
 *
 * Works on Vercel via @sparticuz/chromium.
 */
export async function POST(req: NextRequest) {
  try {
    const { html: innerHtml, fileName } = (await req.json()) as {
      html: string;
      fileName?: string;
    };

    if (!innerHtml) {
      return NextResponse.json(
        { error: "Missing HTML content" },
        { status: 400 }
      );
    }

    // Wrap the client-provided HTML in a full document
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Resume</title>${FONT_CDN_LINK}<style>${PRINT_CSS}</style></head><body>${innerHtml}</body></html>`;

    // Launch Puppeteer with @sparticuz/chromium (Vercel-compatible)
    // @sparticuz/chromium uses a default export — must access .default
    const chromiumModule = await import("@sparticuz/chromium");
    const chromium = chromiumModule.default;
    const puppeteerModule = await import("puppeteer-core");
    const puppeteer = puppeteerModule.default;

    const executablePath = await chromium.executablePath();

    const browser = await puppeteer.launch({
      executablePath,
      headless: chromium.headless,
      args: chromium.args,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30000 });
      // Wait for fonts to load
      await page.evaluate(() => document.fonts?.ready);
      await new Promise((r) => setTimeout(r, 1000));

      // Generate PDF with Chrome's native print engine
      // This gives perfect page breaks, selectable text, and ATS-friendly output
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
        preferCSSPageSize: false,
      });

      const name = fileName || "Resume";
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${name.replace(/\s+/g, "_")}_Resume.pdf"`,
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
