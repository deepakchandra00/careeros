import type { ResumeData } from "@/store/resume-store";

/**
 * Word export pattern configuration for each resume template.
 *
 * Instead of one builder per template (unmaintainable at 100+ templates),
 * each template declares a structural `pattern` + colors. Four pattern
 * builders handle all templates:
 *   - sidebar-left   (colored sidebar on the left)
 *   - sidebar-right  (colored sidebar on the right)
 *   - header-band    (full-width colored header, single column below)
 *   - single-column  (no sidebar, plain flow)
 *
 * Adding a new template = adding one entry to DOCX_TEMPLATE_CONFIG.
 */

export type DocxPattern = "sidebar-left" | "sidebar-right" | "header-band" | "single-column";

export type SidebarSection =
  | "contact"
  | "skills"
  | "skillBars"
  | "languages"
  | "certifications"
  | "interests"
  | "education"
  | "about";

export interface DocxTemplateConfig {
  pattern: DocxPattern;
  /** Sidebar background color (hex without #) for sidebar patterns. */
  sidebarBg: string;
  /** Sidebar text color (hex without #). */
  sidebarText: string;
  /** Which sections appear in the sidebar (sidebar patterns only). */
  sidebarSections: SidebarSection[];
  /** Main-column text color for section headers (hex without #). */
  headerColor: string;
  /** Font family for the whole doc (e.g. "Helvetica", "Georgia"). */
  fontFamily: string;
  /** Page margin in cm (sidebar templates use 0 for edge-to-edge). */
  marginCm: number;
  /** Sidebar width as percentage of page (matches the HTML template's grid ratio). */
  sidebarWidthPct: number;
  /** Whether to show a photo circle in the sidebar (skipped in DOCX — no image embedding). */
  hasPhoto?: boolean;
}

export const DOCX_TEMPLATE_CONFIG: Record<string, DocxTemplateConfig> = {
  // === Original 4 ===
  modern: {
    pattern: "sidebar-left",
    sidebarBg: "10B981",
    sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skills", "languages", "certifications"],
    headerColor: "10B981",
    fontFamily: "Helvetica",
    marginCm: 0,
    sidebarWidthPct: 34,
  },
  ats: {
    pattern: "single-column",
    sidebarBg: "",
    sidebarText: "",
    sidebarSections: [],
    headerColor: "374151",
    fontFamily: "Times New Roman",
    marginCm: 1.4,
    sidebarWidthPct: 0,
  },
  executive: {
    pattern: "single-column",
    sidebarBg: "",
    sidebarText: "",
    sidebarSections: [],
    headerColor: "B45309",
    fontFamily: "Georgia",
    marginCm: 1.6,
    sidebarWidthPct: 0,
  },
  minimal: {
    pattern: "single-column",
    sidebarBg: "",
    sidebarText: "",
    sidebarSections: [],
    headerColor: "94A3B8",
    fontFamily: "Helvetica",
    marginCm: 1.8,
    sidebarWidthPct: 0,
  },

  // === Profession-named templates ===
  "software-engineer": {
    pattern: "sidebar-left",
    sidebarBg: "1E293B",
    sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skills", "languages", "certifications"],
    headerColor: "1E293B",
    fontFamily: "Helvetica",
    marginCm: 0,
    sidebarWidthPct: 34,
  },
  academic: {
    pattern: "sidebar-left",
    sidebarBg: "374151",
    sidebarText: "FFFFFF",
    sidebarSections: ["contact", "education", "skills", "languages"],
    headerColor: "374151",
    fontFamily: "Georgia",
    marginCm: 0,
    sidebarWidthPct: 34,
  },
  creative: {
    pattern: "sidebar-left",
    sidebarBg: "EA580C",
    sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skillBars", "languages"],
    headerColor: "EA580C",
    fontFamily: "Helvetica",
    marginCm: 0,
    sidebarWidthPct: 34,
  },
  "web-developer": {
    pattern: "sidebar-left",
    sidebarBg: "1F2937",
    sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skillBars", "languages", "interests"],
    headerColor: "F97316",
    fontFamily: "Helvetica",
    marginCm: 0,
    sidebarWidthPct: 34,
  },
  "ux-designer": {
    pattern: "sidebar-left",
    sidebarBg: "1E3A5F",
    sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skills", "languages"],
    headerColor: "1E3A5F",
    fontFamily: "Helvetica",
    marginCm: 0,
    sidebarWidthPct: 34,
  },
  teacher: {
    pattern: "sidebar-left",
    sidebarBg: "374151",
    sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skillBars", "languages"],
    headerColor: "EAB308",
    fontFamily: "Helvetica",
    marginCm: 0,
    sidebarWidthPct: 34,
  },
  "product-manager": {
    pattern: "sidebar-left",
    sidebarBg: "059669",
    sidebarText: "FFFFFF",
    sidebarSections: ["about", "contact", "skillBars", "languages"],
    headerColor: "059669",
    fontFamily: "Helvetica",
    marginCm: 0,
    sidebarWidthPct: 34,
  },
  finance: {
    pattern: "header-band",
    sidebarBg: "E5E7EB",
    sidebarText: "1F2937",
    sidebarSections: ["skills", "certifications", "interests"],
    headerColor: "1F2937",
    fontFamily: "Helvetica",
    marginCm: 1.2,
    sidebarWidthPct: 32,
  },
  "business-analyst": {
    pattern: "sidebar-left",
    sidebarBg: "1E3A5F",
    sidebarText: "FFFFFF",
    sidebarSections: ["contact", "education", "skills"],
    headerColor: "FBBF24",
    fontFamily: "Helvetica",
    marginCm: 0,
    sidebarWidthPct: 34,
  },
  // === Premium templates (14 with real components) ===
  "premium-purple-executive": {
    pattern: "sidebar-left", sidebarBg: "7C3AED", sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skills", "languages", "certifications"],
    headerColor: "7C3AED", fontFamily: "Helvetica", marginCm: 0, sidebarWidthPct: 35,
  },
  "premium-brown-classic": {
    pattern: "sidebar-left", sidebarBg: "92400E", sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skills", "languages"],
    headerColor: "92400E", fontFamily: "Georgia", marginCm: 0, sidebarWidthPct: 33,
  },
  "premium-peach-modern": {
    pattern: "sidebar-left", sidebarBg: "FB923C", sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skillBars", "languages"],
    headerColor: "FB923C", fontFamily: "Helvetica", marginCm: 0, sidebarWidthPct: 35,
  },
  "premium-warm-professional": {
    pattern: "sidebar-left", sidebarBg: "A16207", sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skills", "languages"],
    headerColor: "A16207", fontFamily: "Helvetica", marginCm: 0, sidebarWidthPct: 33,
  },
  "premium-earth-premium": {
    pattern: "sidebar-left", sidebarBg: "854D0E", sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skills", "languages", "certifications"],
    headerColor: "854D0E", fontFamily: "Georgia", marginCm: 0, sidebarWidthPct: 32,
  },
  "premium-pink-geometric": {
    pattern: "sidebar-left", sidebarBg: "EC4899", sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skills", "languages"],
    headerColor: "EC4899", fontFamily: "Helvetica", marginCm: 0, sidebarWidthPct: 35,
  },
  "premium-rose-elegant": {
    pattern: "sidebar-left", sidebarBg: "F43F5E", sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skills", "languages"],
    headerColor: "F43F5E", fontFamily: "Georgia", marginCm: 0, sidebarWidthPct: 34,
  },
  "premium-foundation-purple": {
    pattern: "sidebar-left", sidebarBg: "6D28D9", sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skills", "languages"],
    headerColor: "6D28D9", fontFamily: "Helvetica", marginCm: 0, sidebarWidthPct: 34,
  },
  "premium-blue-sidebar": {
    pattern: "sidebar-left", sidebarBg: "1D4ED8", sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skills", "languages"],
    headerColor: "1D4ED8", fontFamily: "Helvetica", marginCm: 0, sidebarWidthPct: 33,
  },
  "premium-aspire-teal": {
    pattern: "sidebar-right", sidebarBg: "F3F4F6", sidebarText: "0F172A",
    sidebarSections: ["contact", "skills", "languages", "certifications"],
    headerColor: "0D9488", fontFamily: "Helvetica", marginCm: 1.2, sidebarWidthPct: 32,
  },
  "premium-canva-pink-blue": {
    pattern: "sidebar-left", sidebarBg: "E11D48", sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skills", "languages"],
    headerColor: "E11D48", fontFamily: "Helvetica", marginCm: 0, sidebarWidthPct: 35,
  },
  "premium-college-teal": {
    pattern: "header-band", sidebarBg: "E5E7EB", sidebarText: "0F172A",
    sidebarSections: ["skills", "certifications", "interests"],
    headerColor: "0D9488", fontFamily: "Helvetica", marginCm: 1.2, sidebarWidthPct: 32,
  },
  "premium-combined-blue": {
    pattern: "sidebar-left", sidebarBg: "1E40AF", sidebarText: "FFFFFF",
    sidebarSections: ["contact", "skills", "languages"],
    headerColor: "1E40AF", fontFamily: "Helvetica", marginCm: 0, sidebarWidthPct: 33,
  },
  "premium-navy-yellow": {
    pattern: "sidebar-left", sidebarBg: "1E3A5F", sidebarText: "FFFFFF",
    sidebarSections: ["contact", "education", "skills"],
    headerColor: "FBBF24", fontFamily: "Helvetica", marginCm: 0, sidebarWidthPct: 30,
  },
};

export function getDocxConfig(templateId: string): DocxTemplateConfig {
  const cfg = DOCX_TEMPLATE_CONFIG[templateId];
  if (cfg) return cfg;

  // Universal fallback: detect layout pattern from template ID and use accent color
  // This ensures ALL templates (including pro/tech/luxury/designer) produce clean Word docs
  return getUniversalConfig(templateId);
}

/**
 * Generate a reasonable DOCX config for templates without an explicit config.
 * Detects the layout pattern from the template ID and picks colors that match
 * the template's visual style.
 */
function getUniversalConfig(templateId: string): DocxTemplateConfig {
  // Templates with sidebar layouts (dark/colored sidebar)
  const sidebarTemplates = [
    "stanford", "harvard", "silicon-valley", "manhattan", "prague", "tokyo",
    "oxford", "berlin", "miami", "seoul", "dubai", "singapore", "stockholm",
    "mumbai", "toronto", "sydney",
    "quantum", "nebula", "cyber", "voltage", "synthwave",
    "vogue", "maison", "atelier", "riviera", "noir", "heritage",
    "luxury-executive", "cyber-premium",
    "silicon-valley-premium", "executive-elite",
  ];

  // Templates with header band layouts
  const headerBandTemplates = [
    "ai-dashboard", "creative-portfolio", "neo-brutalism",
    "apple-linear", "premium-2026", "ultra-premium-luxury",
    "premium-creative", "premium-2026-glass", "glassmorphism",
    "editorial-magazine",
  ];

  // Templates with single-column layouts
  const singleColumnTemplates = [
    "swiss-minimalism", "hologram",
  ];

  // Accent colors per template (matches the catalog)
  const accentColors: Record<string, { accent: string; bg: string; pattern: DocxPattern }> = {
    "stanford": { accent: "0F766E", bg: "0F766E", pattern: "sidebar-left" },
    "harvard": { accent: "B8860B", bg: "1A1A2E", pattern: "sidebar-left" },
    "silicon-valley": { accent: "10B981", bg: "0F172A", pattern: "sidebar-left" },
    "manhattan": { accent: "0F172A", bg: "0F172A", pattern: "header-band" },
    "prague": { accent: "7C3AED", bg: "7C3AED", pattern: "sidebar-left" },
    "tokyo": { accent: "E11D48", bg: "E11D48", pattern: "header-band" },
    "oxford": { accent: "1E3A5F", bg: "1E3A5F", pattern: "sidebar-left" },
    "berlin": { accent: "F59E0B", bg: "F59E0B", pattern: "header-band" },
    "miami": { accent: "FB7185", bg: "FB7185", pattern: "sidebar-left" },
    "seoul": { accent: "22C55E", bg: "0F172A", pattern: "header-band" },
    "dubai": { accent: "C5A572", bg: "1A1A2E", pattern: "sidebar-left" },
    "singapore": { accent: "0891B2", bg: "0891B2", pattern: "header-band" },
    "stockholm": { accent: "475569", bg: "F8FAFC", pattern: "single-column" },
    "mumbai": { accent: "EA580C", bg: "EA580C", pattern: "sidebar-left" },
    "toronto": { accent: "1E40AF", bg: "1E40AF", pattern: "sidebar-left" },
    "sydney": { accent: "14B8A6", bg: "14B8A6", pattern: "header-band" },
    "quantum": { accent: "06B6D4", bg: "0A0E27", pattern: "sidebar-left" },
    "nebula": { accent: "10B981", bg: "1A1A1A", pattern: "sidebar-left" },
    "cyber": { accent: "3B82F6", bg: "0A0A0A", pattern: "sidebar-left" },
    "voltage": { accent: "FB7185", bg: "0F172A", pattern: "header-band" },
    "synthwave": { accent: "EC4899", bg: "1E1B4B", pattern: "sidebar-left" },
    "hologram": { accent: "A78BFA", bg: "FAFBFF", pattern: "single-column" },
    "vogue": { accent: "C5A572", bg: "FAF8F3", pattern: "single-column" },
    "maison": { accent: "C5A572", bg: "0A0A0A", pattern: "sidebar-left" },
    "atelier": { accent: "5B1A1A", bg: "5B1A1A", pattern: "sidebar-left" },
    "riviera": { accent: "0F3460", bg: "0F3460", pattern: "sidebar-left" },
    "noir": { accent: "10B981", bg: "000000", pattern: "sidebar-left" },
    "heritage": { accent: "C5A572", bg: "4A0E0E", pattern: "sidebar-left" },
    "glassmorphism": { accent: "6366F1", bg: "6366F1", pattern: "header-band" },
    "editorial-magazine": { accent: "8B4513", bg: "FAF8F3", pattern: "single-column" },
    "ai-dashboard": { accent: "6366F1", bg: "6366F1", pattern: "header-band" },
    "luxury-executive": { accent: "C5A572", bg: "0A0A0A", pattern: "sidebar-left" },
    "creative-portfolio": { accent: "FB7185", bg: "FB7185", pattern: "header-band" },
    "neo-brutalism": { accent: "FACC15", bg: "000000", pattern: "header-band" },
    "swiss-minimalism": { accent: "000000", bg: "FFFFFF", pattern: "single-column" },
    "cyber-premium": { accent: "06B6D4", bg: "0A0A14", pattern: "sidebar-left" },
    "apple-linear": { accent: "10B981", bg: "10B981", pattern: "header-band" },
    "premium-2026": { accent: "8B5CF6", bg: "8B5CF6", pattern: "header-band" },
    "ultra-premium-luxury": { accent: "C5A572", bg: "FAF8F3", pattern: "single-column" },
    "silicon-valley-premium": { accent: "6366F1", bg: "6366F1", pattern: "sidebar-left" },
    "executive-elite": { accent: "1E3A5F", bg: "1E3A5F", pattern: "sidebar-left" },
    "premium-creative": { accent: "FB7185", bg: "FB7185", pattern: "header-band" },
    "premium-2026-glass": { accent: "A78BFA", bg: "A78BFA", pattern: "header-band" },
  };

  const colors = accentColors[templateId] || { accent: "10B981", bg: "10B981", pattern: "sidebar-left" as DocxPattern };

  // Determine if this is a dark sidebar template (white text on dark bg)
  const darkSidebar = [
    "harvard", "silicon-valley", "oxford", "dubai", "noir", "heritage",
    "quantum", "nebula", "cyber", "synthwave", "maison", "atelier",
    "riviera", "luxury-executive", "cyber-premium", "executive-elite",
    "silicon-valley-premium",
  ].includes(templateId);

  return {
    pattern: colors.pattern,
    sidebarBg: colors.bg,
    sidebarText: darkSidebar ? "FFFFFF" : "0F172A",
    sidebarSections: ["contact", "skills", "languages", "certifications"],
    headerColor: colors.accent,
    fontFamily: "Helvetica",
    marginCm: colors.pattern === "single-column" ? 1.4 : 0,
    sidebarWidthPct: colors.pattern === "sidebar-left" || colors.pattern === "sidebar-right" ? 33 : 0,
  };
}

/** Hex without # (for docx fill colors). */
export function hex(hexWithHash: string): string {
  return hexWithHash.replace("#", "").toUpperCase();
}

/** Contact line for header/footer use. */
export function contactLine(data: ResumeData): string {
  return [data.email, data.phone, data.location, data.linkedin, data.github, data.website]
    .filter(Boolean)
    .join("  |  ");
}
