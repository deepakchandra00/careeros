/**
 * PDF Service — renders a resume template to a pixel-perfect PDF using Playwright.
 *
 * Flow:
 *   1. Client POSTs { data, style } to /api/resume/pdf (Next.js route)
 *   2. Next.js route forwards to this service on port 3002
 *   3. This service renders the template HTML directly using React's renderToString
 *      (does NOT depend on the Next.js dev server — works even if dev server is slow/down)
 *   4. Playwright loads the HTML, generates a PDF, returns it as a binary stream
 *
 * Port: 3002 (fixed).
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { chromium } from "playwright-core";
import { renderToString } from "react-dom/server";
import * as React from "react";
import type { ResumeData, TemplateStyle } from "../../src/store/resume-store";

const PORT = 3002;
const CHROME_PATH =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ||
  "/home/z/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome";

// Google Fonts CDN link for premium fonts
const FONT_CDN_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;

const ALL_SECTIONS: Record<string, boolean> = {
  personal: true, summary: true, experience: true, skills: true,
  projects: true, education: true, certifications: true, languages: true,
  awards: true, publications: true, interests: true, references: true,
};

interface PdfRequest {
  data: ResumeData;
  style: TemplateStyle;
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

function send(res: ServerResponse, status: number, body: unknown, contentType = "application/json") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

// Template component loader — same mapping as the thumbnail generator
type TemplateComponent = React.ComponentType<{
  data: ResumeData;
  sections: Record<string, boolean>;
  accent: string;
}>;

async function loadTemplate(templateId: string): Promise<TemplateComponent | null> {
  // Core base templates (4)
  const CORE_BASE = new Set(["modern", "ats", "executive", "minimal"]);
  if (CORE_BASE.has(templateId)) {
    const mod = await import("../../src/components/modules/resume-templates");
    const map: Record<string, TemplateComponent> = {
      modern: mod.ModernTemplate, ats: mod.AtsTemplate,
      executive: mod.ExecutiveTemplate, minimal: mod.MinimalTemplate,
    };
    return map[templateId] ?? mod.ModernTemplate;
  }

  // Extended base templates (9)
  const EXTENDED_BASE = new Set(["software-engineer", "academic", "creative", "web-developer", "ux-designer", "teacher", "product-manager", "finance", "business-analyst"]);
  if (EXTENDED_BASE.has(templateId)) {
    const mod = await import("../../src/components/modules/resume-templates-extended");
    const map: Record<string, TemplateComponent> = {
      "software-engineer": mod.SoftwareEngineerTemplate, "academic": mod.AcademicTemplate,
      "creative": mod.CreativeTemplate, "web-developer": mod.WebDeveloperTemplate,
      "ux-designer": mod.UxDesignerTemplate, "teacher": mod.TeacherTemplate,
      "product-manager": mod.ProductManagerTemplate, "finance": mod.FinanceTemplate,
      "business-analyst": mod.BusinessAnalystTemplate,
    };
    return map[templateId] ?? null;
  }

  // Premium v2 templates (14)
  const premiumMap: Record<string, string> = {
    "premium-purple-executive": "PurpleExecutiveTemplate", "premium-brown-classic": "BrownClassicTemplate",
    "premium-peach-modern": "PeachModernTemplate", "premium-warm-professional": "WarmProfessionalTemplate",
    "premium-earth-premium": "EarthPremiumTemplate", "premium-pink-geometric": "PinkGeometricTemplate",
    "premium-rose-elegant": "RoseElegantTemplate", "premium-foundation-purple": "FoundationPurpleTemplate",
    "premium-blue-sidebar": "BlueSidebarProTemplate", "premium-aspire-teal": "AspireTealTemplate",
    "premium-canva-pink-blue": "CanvaPinkBlueTemplate", "premium-college-teal": "CollegeCVTealTemplate",
    "premium-combined-blue": "CombinedBlueTemplate", "premium-navy-yellow": "NavyYellowProTemplate",
  };
  if (premiumMap[templateId]) {
    const mod = await import("../../src/components/modules/premium-templates-v2");
    return (mod as unknown as Record<string, TemplateComponent>)[premiumMap[templateId]];
  }

  // Pro templates (16)
  const proMap: Record<string, string> = {
    "stanford": "StanfordTemplate", "harvard": "HarvardTemplate",
    "silicon-valley": "SiliconValleyTemplate", "manhattan": "ManhattanTemplate",
    "prague": "PragueTemplate", "tokyo": "TokyoTemplate",
    "oxford": "OxfordTemplate", "berlin": "BerlinTemplate",
    "miami": "MiamiTemplate", "seoul": "SeoulTemplate",
    "dubai": "DubaiTemplate", "singapore": "SingaporeTemplate",
    "stockholm": "StockholmTemplate", "mumbai": "MumbaiTemplate",
    "toronto": "TorontoTemplate", "sydney": "SydneyTemplate",
  };
  if (proMap[templateId]) {
    const mod = await import("../../src/components/modules/pro-templates");
    return (mod as unknown as Record<string, TemplateComponent>)[proMap[templateId]];
  }

  // Tech templates (6)
  const techMap: Record<string, string> = {
    "quantum": "QuantumTemplate", "nebula": "NebulaTemplate",
    "cyber": "CyberTemplate", "voltage": "VoltageTemplate",
    "synthwave": "SynthwaveTemplate", "hologram": "HologramTemplate",
  };
  if (techMap[templateId]) {
    const mod = await import("../../src/components/modules/tech-templates");
    return (mod as unknown as Record<string, TemplateComponent>)[techMap[templateId]];
  }

  // Luxury templates (6)
  const luxuryMap: Record<string, string> = {
    "vogue": "VogueTemplate", "maison": "MaisonTemplate",
    "atelier": "AtelierTemplate", "riviera": "RivieraTemplate",
    "noir": "NoirTemplate", "heritage": "HeritageTemplate",
  };
  if (luxuryMap[templateId]) {
    const mod = await import("../../src/components/modules/luxury-templates");
    return (mod as unknown as Record<string, TemplateComponent>)[luxuryMap[templateId]];
  }

  // Designer templates (8)
  const designerMap: Record<string, string> = {
    "glassmorphism": "GlassmorphismTemplate", "editorial-magazine": "EditorialMagazineTemplate",
    "ai-dashboard": "AIDashboardTemplate", "luxury-executive": "LuxuryExecutiveTemplate",
    "creative-portfolio": "CreativePortfolioTemplate", "neo-brutalism": "NeoBrutalismTemplate",
    "swiss-minimalism": "SwissMinimalismTemplate", "cyber-premium": "CyberPremiumTemplate",
  };
  if (designerMap[templateId]) {
    const mod = await import("../../src/components/modules/premium-designer-templates");
    return (mod as unknown as Record<string, TemplateComponent>)[designerMap[templateId]];
  }

  // SaaS templates (7)
  const saasMap: Record<string, string> = {
    "apple-linear": "AppleLinearTemplate", "premium-2026": "Premium2026Template",
    "ultra-premium-luxury": "UltraPremiumLuxuryTemplate", "silicon-valley-premium": "SiliconValleyPremiumTemplate",
    "executive-elite": "ExecutiveEliteTemplate", "premium-creative": "PremiumCreativeTemplate",
    "premium-2026-glass": "Premium2026GlassTemplate",
  };
  if (saasMap[templateId]) {
    const mod = await import("../../src/components/modules/premium-saas-templates");
    return (mod as unknown as Record<string, TemplateComponent>)[saasMap[templateId]];
  }

  return null;
}

async function generatePdf(payload: PdfRequest): Promise<Buffer> {
  const { data, style } = payload;
  const templateId = style.template || "modern";
  const accent = style.accent || "#10b981";

  console.log(`[pdf-service] rendering template: ${templateId}`);

  // Load the template component
  const TemplateComponent = await loadTemplate(templateId);
  if (!TemplateComponent) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  // Render the template to HTML using React's renderToString
  const element = React.createElement(TemplateComponent, {
    data,
    sections: ALL_SECTIONS,
    accent,
  });
  const innerHtml = renderToString(element);

  // Build the full HTML document with fonts
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${data.name || "Resume"}</title>${FONT_CDN_LINK}<style>
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.resume-paper { width: 794px !important; max-width: 100% !important; box-shadow: none !important; margin: 0 !important; }
img { max-width: 100%; }
</style></head><body><div id="root">${innerHtml}</div></body></html>`;

  console.log(`[pdf-service] HTML rendered, length: ${html.length}`);

  // Launch Playwright and generate the PDF
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle", timeout: 30000 });
    // Wait for fonts to load
    await page.waitForTimeout(1500);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
      preferCSSPageSize: false,
    });
    console.log(`[pdf-service] PDF generated, size: ${pdfBuffer.length} bytes`);
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 204, "");
    return;
  }
  if (req.method !== "POST") {
    send(res, 405, { error: "Method not allowed" });
    return;
  }
  try {
    const bodyText = await readBody(req);
    const payload = JSON.parse(bodyText) as PdfRequest;
    if (!payload.data || !payload.style) {
      send(res, 400, { error: "Missing data or style" });
      return;
    }
    const pdf = await generatePdf(payload);
    send(res, 200, pdf, "application/pdf");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF generation failed";
    console.error("[pdf-service] error:", msg);
    send(res, 500, { error: msg });
  }
});

server.listen(PORT, () => {
  console.log(`[pdf-service] listening on http://localhost:${PORT}`);
});
