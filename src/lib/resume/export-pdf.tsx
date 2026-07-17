"use client";

import type { ResumeData, TemplateStyle } from "@/store/resume-store";

/**
 * Generate a pixel-perfect PDF by capturing the actual rendered template
 * (the same React component the user sees in the preview) using html2canvas.
 *
 * This gives an EXACT visual match for ALL 58 templates because it captures
 * the actual rendered design — no separate PDF components needed.
 * Works entirely client-side (no server needed, works on Vercel).
 */
export async function exportResumePdf(
  data: ResumeData,
  style: TemplateStyle
): Promise<void> {
  // Dynamic import to keep html2canvas/jspdf out of initial bundle
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // 1. Find the existing resume-paper element (already rendered in the preview)
  const existingEl = document.querySelector(".resume-paper") as HTMLElement;
  if (!existingEl) {
    throw new Error("Resume preview not found. Make sure the preview is visible.");
  }

  // 2. Clone the element and reset transforms (preview may be zoomed)
  const clone = existingEl.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  clone.style.zoom = "1";
  clone.style.margin = "0";
  clone.style.boxShadow = "none";

  // 3. Create a hidden container at full size (794px = A4 width at 96dpi)
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;left:-99999px;top:0;width:794px;overflow:hidden;background:#ffffff;z-index:-1;opacity:1;";
  container.appendChild(clone);
  document.body.appendChild(container);

  // 4. Wait for fonts and images to settle
  await new Promise((r) => setTimeout(r, 600));
  try {
    await (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
  } catch {}

  // 5. Capture with html2canvas at 2x resolution for crisp text
  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    width: 794,
    height: clone.scrollHeight,
    windowWidth: 794,
  });

  // 6. Clean up the hidden container
  document.body.removeChild(container);

  // 7. Create A4 PDF with the captured image
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pdfWidth = 210; // A4 width in mm
  const pdfHeight = 297; // A4 height in mm
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  if (imgHeight <= pdfHeight) {
    // Single page — fit the entire resume on one page
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
  } else {
    // Multi-page: split the canvas across multiple A4 pages
    // Create a temporary canvas for each page
    const pageHeightInPixels = (canvas.width * pdfHeight) / imgWidth;
    let yOffset = 0;

    while (yOffset < canvas.height) {
      // Create a page canvas
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(pageHeightInPixels, canvas.height - yOffset);
      const ctx = pageCanvas.getContext("2d");
      if (!ctx) break;

      // Fill white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      // Draw the portion of the original canvas
      ctx.drawImage(
        canvas,
        0,
        yOffset,
        canvas.width,
        pageCanvas.height,
        0,
        0,
        canvas.width,
        pageCanvas.height
      );

      const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.95);
      const pageImgHeight = (pageCanvas.height * imgWidth) / canvas.width;

      if (yOffset > 0) {
        pdf.addPage();
      }
      pdf.addImage(pageImgData, "JPEG", 0, 0, imgWidth, pageImgHeight);

      yOffset += pageHeightInPixels;
    }
  }

  // 8. Download
  pdf.save(`${data.name.replace(/\s+/g, "_")}_Resume.pdf`);
}
