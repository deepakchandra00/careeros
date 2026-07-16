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
  return DOCX_TEMPLATE_CONFIG[templateId] ?? DOCX_TEMPLATE_CONFIG.modern;
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
