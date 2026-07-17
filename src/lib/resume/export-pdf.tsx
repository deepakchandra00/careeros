"use client";

import type { ResumeData, TemplateStyle } from "@/store/resume-store";

/**
 * Generate a pixel-perfect PDF by capturing the actual rendered template
 * (the same React component the user sees in the preview) using html2canvas.
 *
 * Overrides oklch/lab CSS variables with hex equivalents before capture,
 * because html2canvas doesn't support modern CSS color functions.
 */
export async function exportResumePdf(
  data: ResumeData,
  style: TemplateStyle
): Promise<void> {
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

  // 4. Override ALL oklch/lab CSS variables with hex equivalents
  // This prevents html2canvas from crashing on unsupported color functions
  const styleOverride = document.createElement("style");
  styleOverride.textContent = `
    .resume-paper, .resume-paper * {
      --background: #ffffff !important;
      --foreground: #1e293b !important;
      --card: #ffffff !important;
      --card-foreground: #1e293b !important;
      --popover: #ffffff !important;
      --popover-foreground: #1e293b !important;
      --primary: #10b981 !important;
      --primary-foreground: #ffffff !important;
      --secondary: #f1f5f9 !important;
      --secondary-foreground: #1e293b !important;
      --muted: #f1f5f9 !important;
      --muted-foreground: #64748b !important;
      --accent: #f1f5f9 !important;
      --accent-foreground: #1e293b !important;
      --destructive: #ef4444 !important;
      --destructive-foreground: #ffffff !important;
      --border: #e2e8f0 !important;
      --input: #e2e8f0 !important;
      --ring: #10b981 !important;
      --sidebar: #0f172a !important;
      --sidebar-foreground: #f8fafc !important;
      --sidebar-primary: #10b981 !important;
      --sidebar-primary-foreground: #ffffff !important;
      --sidebar-accent: #1e293b !important;
      --sidebar-accent-foreground: #f8fafc !important;
      --sidebar-border: #1e293b !important;
      --sidebar-ring: #10b981 !important;
      color-scheme: light !important;
    }
  `;
  container.appendChild(styleOverride);
  container.appendChild(clone);
  document.body.appendChild(container);

  // 5. Wait for fonts and images to settle
  await new Promise((r) => setTimeout(r, 600));
  try {
    await (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
  } catch {}

  // 6. Capture with html2canvas at 2x resolution for crisp text
  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: 794,
      height: clone.scrollHeight,
      windowWidth: 794,
      // Remove any remaining oklch/lab colors from inline styles
      ignoreElements: (el) => {
        // Don't ignore the actual content
        return false;
      },
    });
  } catch (e) {
    // If html2canvas still fails on some color, try a simplified approach:
    // Convert all computed styles to RGB
    const allElements = clone.querySelectorAll("*");
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computed = window.getComputedStyle(htmlEl);
      const color = computed.color;
      const bgColor = computed.backgroundColor;
      const borderColor = computed.borderColor;

      // If color contains oklch or lab, replace with computed RGB
      if (color && (color.includes("oklch") || color.includes("lab"))) {
        // Force a simple color
        htmlEl.style.color = "#1e293b";
      }
      if (bgColor && (bgColor.includes("oklch") || bgColor.includes("lab"))) {
        htmlEl.style.backgroundColor = "#ffffff";
      }
      if (borderColor && (borderColor.includes("oklch") || borderColor.includes("lab"))) {
        htmlEl.style.borderColor = "#e2e8f0";
      }
    });

    canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: 794,
      height: clone.scrollHeight,
      windowWidth: 794,
    });
  }

  // 7. Clean up the hidden container
  document.body.removeChild(container);

  // 8. Create A4 PDF with the captured image
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
    // Single page
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
  } else {
    // Multi-page: split the canvas across multiple A4 pages
    const pageHeightInPixels = (canvas.width * pdfHeight) / imgWidth;
    let yOffset = 0;

    while (yOffset < canvas.height) {
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(pageHeightInPixels, canvas.height - yOffset);
      const ctx = pageCanvas.getContext("2d");
      if (!ctx) break;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
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

      if (yOffset > 0) pdf.addPage();
      pdf.addImage(pageImgData, "JPEG", 0, 0, imgWidth, pageImgHeight);

      yOffset += pageHeightInPixels;
    }
  }

  // 9. Download
  pdf.save(`${data.name.replace(/\s+/g, "_")}_Resume.pdf`);
}
