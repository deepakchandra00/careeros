"use client";

import type { ResumeData, TemplateStyle } from "@/store/resume-store";

/**
 * Generate a PDF using the browser's native print engine.
 *
 * This approach uses A4 page-based layout:
 * - The resume is rendered as fixed A4 pages (210mm × 297mm)
 * - CSS `page-break-after: always` ensures clean page breaks
 * - `page-break-inside: avoid` prevents splitting items
 * - The browser's print dialog produces perfect multi-page PDFs
 *
 * Works on Vercel (no server-side Chromium needed).
 * Produces selectable text (ATS-friendly).
 */
export async function exportResumePdf(
  data: ResumeData,
  style: TemplateStyle
): Promise<void> {
  // 1. Find the rendered resume element(s) in the DOM
  // Look for .resume-page elements (page-based preview) or fallback to .resume-paper
  const pageElements = document.querySelectorAll(".resume-page");
  const paperElement = document.querySelector(".resume-paper") as HTMLElement;

  let innerHtml = "";

  if (pageElements.length > 0) {
    // Page-based preview — each .resume-page is already an A4 page
    pageElements.forEach((page) => {
      const clone = page.cloneNode(true) as HTMLElement;
      clone.style.transform = "none";
      clone.style.zoom = "1";
      clone.style.margin = "0";
      clone.style.boxShadow = "none";
      // Keep page-break-after for print
      clone.style.pageBreakAfter = "always";
      innerHtml += clone.outerHTML;
    });
  } else if (paperElement) {
    // Fallback: single .resume-paper (old preview)
    const clone = paperElement.cloneNode(true) as HTMLElement;
    clone.style.transform = "none";
    clone.style.zoom = "1";
    clone.style.margin = "0";
    clone.style.boxShadow = "none";
    innerHtml = clone.outerHTML;
  } else {
    throw new Error("Resume preview not found. Make sure the preview is visible.");
  }

  // 2. Build the print HTML with A4 page CSS
  const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${data.name || "Resume"}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    font-family: system-ui, sans-serif;
  }

  /* A4 page container */
  .resume-page {
    width: 210mm;
    min-height: 297mm;
    max-height: 297mm;
    overflow: hidden;
    background: white;
    page-break-after: always;
    break-after: page;
    position: relative;
  }

  /* Last page should not have a page break after */
  .resume-page:last-child {
    page-break-after: auto;
    break-after: auto;
  }

  /* Resume paper (fallback for single-page) */
  .resume-paper {
    width: 794px !important;
    max-width: 100% !important;
    box-shadow: none !important;
    margin: 0 !important;
  }

  /* Smart page breaks — don't cut inside items */
  .resume-paper > div > div,
  .resume-paper > div > section,
  .resume-paper > div > aside {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  img { max-width: 100%; }

  /* Print-specific */
  @media print {
    @page {
      margin: 0;
      size: A4;
    }
    body { margin: 0; padding: 0; }
    .resume-page {
      box-shadow: none;
      margin: 0;
      width: 210mm;
      height: 297mm;
    }
  }

  /* Screen preview styling (for the print window before printing) */
  @media screen {
    body { background: #e5e7eb; padding: 20px; }
    .resume-page {
      margin: 0 auto 20px auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
  }
</style>
</head>
<body>
${innerHtml}
<script>
  // Wait for fonts to load, then trigger print
  (async function() {
    try {
      await document.fonts.ready;
    } catch(e) {}
    // Small delay to ensure all content is rendered
    setTimeout(function() {
      window.print();
    }, 500);
  })();
</script>
</body>
</html>`;

  // 3. Open a new window and write the HTML
  const printWindow = window.open("", "_blank", "width=900,height=1200");
  if (!printWindow) {
    throw new Error("Pop-up blocked. Please allow pop-ups to download the PDF.");
  }

  printWindow.document.open();
  printWindow.document.write(printHtml);
  printWindow.document.close();
}
