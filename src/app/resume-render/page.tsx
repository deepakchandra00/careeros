import * as React from "react";
import { fontStackFor } from "@/lib/resume/template-options";
import type { ResumeData, TemplateStyle } from "@/store/resume-store";

export const dynamic = "force-dynamic";

/**
 * Server Component page that renders a resume template to standalone HTML.
 * The PDF mini-service and thumbnail service fetch this page and convert it.
 *
 * Uses per-template dynamic imports so only the requested template's code
 * is compiled (avoids OOM when dev server has 55+ templates).
 */

interface TemplateComponentProps {
  data: ResumeData;
  sections: Record<string, boolean>;
  accent: string;
}

async function loadTemplate(template: string): Promise<React.ComponentType<TemplateComponentProps> | null> {
  // Base templates (4 core) — from resume-templates.tsx
  const CORE_BASE = new Set(["modern", "ats", "executive", "minimal"]);
  if (CORE_BASE.has(template)) {
    const mod = await import("@/components/modules/resume-templates");
    const map: Record<string, React.ComponentType<TemplateComponentProps>> = {
      "modern": mod.ModernTemplate,
      "ats": mod.AtsTemplate,
      "executive": mod.ExecutiveTemplate,
      "minimal": mod.MinimalTemplate,
    };
    return map[template] ?? mod.ModernTemplate;
  }

  // Extended base templates (9) — from resume-templates-extended.tsx
  const EXTENDED_BASE = new Set([
    "software-engineer", "academic", "creative", "web-developer",
    "ux-designer", "teacher", "product-manager", "finance", "business-analyst",
  ]);
  if (EXTENDED_BASE.has(template)) {
    const mod = await import("@/components/modules/resume-templates-extended");
    const map: Record<string, React.ComponentType<TemplateComponentProps>> = {
      "software-engineer": mod.SoftwareEngineerTemplate,
      "academic": mod.AcademicTemplate,
      "creative": mod.CreativeTemplate,
      "web-developer": mod.WebDeveloperTemplate,
      "ux-designer": mod.UxDesignerTemplate,
      "teacher": mod.TeacherTemplate,
      "product-manager": mod.ProductManagerTemplate,
      "finance": mod.FinanceTemplate,
      "business-analyst": mod.BusinessAnalystTemplate,
    };
    return map[template] ?? null;
  }

  // Premium templates v2
  const PREMIUM_MAP: Record<string, string> = {
    "premium-purple-executive": "PurpleExecutiveTemplate",
    "premium-brown-classic": "BrownClassicTemplate",
    "premium-peach-modern": "PeachModernTemplate",
    "premium-warm-professional": "WarmProfessionalTemplate",
    "premium-earth-premium": "EarthPremiumTemplate",
    "premium-pink-geometric": "PinkGeometricTemplate",
    "premium-rose-elegant": "RoseElegantTemplate",
    "premium-foundation-purple": "FoundationPurpleTemplate",
    "premium-blue-sidebar": "BlueSidebarProTemplate",
    "premium-aspire-teal": "AspireTealTemplate",
    "premium-canva-pink-blue": "CanvaPinkBlueTemplate",
    "premium-college-teal": "CollegeCVTealTemplate",
    "premium-combined-blue": "CombinedBlueTemplate",
    "premium-navy-yellow": "NavyYellowProTemplate",
  };
  if (PREMIUM_MAP[template]) {
    const mod = await import("@/components/modules/premium-templates-v2");
    const componentName = PREMIUM_MAP[template];
    return (mod as unknown as Record<string, React.ComponentType<TemplateComponentProps>>)[componentName];
  }

  // Pro templates
  const PRO_MAP: Record<string, string> = {
    "stanford": "StanfordTemplate",
    "harvard": "HarvardTemplate",
    "silicon-valley": "SiliconValleyTemplate",
    "manhattan": "ManhattanTemplate",
    "prague": "PragueTemplate",
    "tokyo": "TokyoTemplate",
    "oxford": "OxfordTemplate",
    "berlin": "BerlinTemplate",
    "miami": "MiamiTemplate",
    "seoul": "SeoulTemplate",
    "dubai": "DubaiTemplate",
    "singapore": "SingaporeTemplate",
    "stockholm": "StockholmTemplate",
    "mumbai": "MumbaiTemplate",
    "toronto": "TorontoTemplate",
    "sydney": "SydneyTemplate",
  };
  if (PRO_MAP[template]) {
    const mod = await import("@/components/modules/pro-templates");
    const componentName = PRO_MAP[template];
    return (mod as unknown as Record<string, React.ComponentType<TemplateComponentProps>>)[componentName];
  }

  // Tech templates
  const TECH_MAP: Record<string, string> = {
    "quantum": "QuantumTemplate",
    "nebula": "NebulaTemplate",
    "cyber": "CyberTemplate",
    "voltage": "VoltageTemplate",
    "synthwave": "SynthwaveTemplate",
    "hologram": "HologramTemplate",
  };
  if (TECH_MAP[template]) {
    const mod = await import("@/components/modules/tech-templates");
    const componentName = TECH_MAP[template];
    return (mod as unknown as Record<string, React.ComponentType<TemplateComponentProps>>)[componentName];
  }

  // Luxury templates
  const LUXURY_MAP: Record<string, string> = {
    "vogue": "VogueTemplate",
    "maison": "MaisonTemplate",
    "atelier": "AtelierTemplate",
    "riviera": "RivieraTemplate",
    "noir": "NoirTemplate",
    "heritage": "HeritageTemplate",
  };
  if (LUXURY_MAP[template]) {
    const mod = await import("@/components/modules/luxury-templates");
    const componentName = LUXURY_MAP[template];
    return (mod as unknown as Record<string, React.ComponentType<TemplateComponentProps>>)[componentName];
  }

  return null;
}

export default async function ResumeRenderPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string; s?: string; data?: string; style?: string }>;
}) {
  const params = await searchParams;
  let data: ResumeData;
  let style: TemplateStyle;

  try {
    const dataRaw = params.d ? Buffer.from(params.d, "base64").toString("utf-8") : params.data;
    const styleRaw = params.s ? Buffer.from(params.s, "base64").toString("utf-8") : params.style;
    if (!dataRaw || !styleRaw) return React.createElement("div", null, "Missing data/style");
    data = JSON.parse(dataRaw);
    style = JSON.parse(styleRaw);
  } catch {
    return React.createElement("div", null, "Invalid data/style params");
  }

  const fontStack = fontStackFor(style.font);

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

  const templateId = style.template || "modern";
  const accent = style.accent || "#10b981";
  const TemplateComponent = await loadTemplate(templateId);

  let inner: React.ReactNode;
  if (TemplateComponent) {
    inner = React.createElement(TemplateComponent, { data, sections: allSections, accent });
  } else {
    inner = React.createElement("div", null, `Unknown template: ${templateId}`);
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{data.name || "Resume"}</title>
        {/* Google Fonts — loaded via CDN so Playwright can fetch them when rendering standalone HTML */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style>{`
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: ${fontStack};
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .resume-paper {
            width: 794px !important;
            max-width: 100% !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
          img { max-width: 100%; }
        `}</style>
      </head>
      <body>
        <div id="root">{inner}</div>
      </body>
    </html>
  );
}
