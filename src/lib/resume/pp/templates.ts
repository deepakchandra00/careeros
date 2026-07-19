// Templates define layout only — never data.
// A template is a pure configuration object; adding a new one requires no
// changes to the rendering, measurement, or pagination engines.

export type SectionId =
  | "profile"
  | "summary"
  | "experience"
  | "projects"
  | "education"
  | "skills"
  | "certifications"
  | "languages"
  | "awards"
  | "publications"
  | "references"
  | "interests";

export type LayoutKind =
  | "single"
  | "twoCol"
  | "threeCol"
  | "leftSidebar"
  | "rightSidebar"
  | "headerTwoCol"
  | "headerThreeCol"
  | "footer";

export type Theme = {
  primary: string;
  accent: string;
  text: string;
  muted: string;
  divider: string;
  sidebarBg: string;
  sidebarText: string;
  headingFont: string;
  bodyFont: string;
  baseSize: number; // px
  headingWeight: number;
  sectionTitleTransform: "uppercase" | "none";
  sectionTitleStyle: "underline" | "bar" | "plain" | "chip";
  bulletStyle: "dot" | "dash" | "square";
  radius: number; // px
  accentBar: boolean;
  // CareerOS extension: photo shape for the profile header
  photoShape: "none" | "circle" | "square";
  // ── ATS Pro template extensions ──
  /** Profile header visual style. */
  profileStyle: "plain" | "pro-3col" | "timeline-header";
  /** Section rendering style — "timeline" wraps each section in a 2-col row. */
  sectionStyle: "plain" | "timeline";
  /** When true, the summary is rendered inside the profile header (not as a
   * standalone section). The engine skips the "summary" section. */
  showSummaryInHeader: boolean;
  /** When true and no photo is set, show the person's initial in the avatar. */
  avatarInitial: boolean;
  /** Avatar shape for the initial (when avatarInitial is true). */
  avatarShape: "circle" | "square";
  /** Avatar size in px. */
  avatarSize: number;
  /** Chip style for skills / tech tags. */
  chipStyle: "none" | "rounded" | "pill";
  /** Chip background color. */
  chipBg: string;
  /** Chip text color. */
  chipText: string;
  /** Left column width for the timeline section style. */
  timelineWidth: number; // px
  /** Timeline dot color. */
  timelineDotColor: string;
  /** Timeline vertical line color. */
  timelineLineColor: string;
};

export type Spacing = {
  pageMarginTop: number; // px
  pageMarginRight: number;
  pageMarginBottom: number;
  pageMarginLeft: number;
  sectionGap: number; // gap between section blocks
  entryGap: number; // gap between entries within a section
  bulletGap: number;
  columnGap: number;
  headerHeight: number; // 0 = auto
  footerHeight: number;
  sidebarWidth: number; // px (only for sidebar layouts)
  headerPadding: number;
  sidebarPadding: number;
};

export type Template = {
  id: string;
  name: string;
  description: string;
  layout: LayoutKind;
  theme: Theme;
  spacing: Spacing;
  // Which sections go where. Anything not listed is skipped.
  headerSections: SectionId[];
  mainSections: SectionId[];
  sidebarSections: SectionId[];
  secondSidebarSections: SectionId[]; // for three-column layouts
  footerSections: SectionId[];
};

const baseTheme: Theme = {
  primary: "#0f172a",
  accent: "#2563eb",
  text: "#0f172a",
  muted: "#64748b",
  divider: "#e2e8f0",
  sidebarBg: "#f1f5f9",
  sidebarText: "#0f172a",
  headingFont:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  bodyFont:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  baseSize: 10.5,
  headingWeight: 700,
  sectionTitleTransform: "uppercase",
  sectionTitleStyle: "bar",
  bulletStyle: "dot",
  radius: 4,
  accentBar: true,
  photoShape: "none",
  // ATS Pro defaults (no-op for base templates)
  profileStyle: "plain",
  sectionStyle: "plain",
  showSummaryInHeader: false,
  avatarInitial: false,
  avatarShape: "circle",
  avatarSize: 48,
  chipStyle: "none",
  chipBg: "#f1f5f9",
  chipText: "#0f172a",
  timelineWidth: 170,
  timelineDotColor: "#f4b400",
  timelineLineColor: "#d8d8d8",
};

// ATS-safe font stacks (CareerOS extension).
const SANS = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", Times, serif';
const MONO = '"Courier New", Courier, monospace';

// Map our CareerOS font shorthand to actual CSS font stacks.
export function fontStack(font: "sans" | "serif" | "mono" | string): string {
  if (font === "serif") return SERIF;
  if (font === "mono") return MONO;
  return SANS;
}

const baseSpacing: Spacing = {
  pageMarginTop: 44,
  pageMarginRight: 48,
  pageMarginBottom: 44,
  pageMarginLeft: 48,
  sectionGap: 14,
  entryGap: 10,
  bulletGap: 4,
  columnGap: 24,
  headerHeight: 0,
  footerHeight: 0,
  sidebarWidth: 210,
  headerPadding: 20,
  sidebarPadding: 22,
};

const allMain: SectionId[] = [
  "summary",
  "experience",
  "projects",
  "education",
  "certifications",
  "awards",
  "publications",
];

const sidebarDefaults: SectionId[] = [
  "skills",
  "languages",
  "certifications",
  "awards",
];

function tpl(overrides: Partial<Template> & { id: string; name: string; description: string; layout: LayoutKind }): Template {
  return {
    theme: { ...baseTheme, ...(overrides.theme ?? {}) },
    spacing: { ...baseSpacing, ...(overrides.spacing ?? {}) },
    headerSections: ["profile"],
    mainSections: allMain,
    sidebarSections: [],
    secondSidebarSections: [],
    footerSections: [],
    ...overrides,
  };
}

export const templates: Template[] = [
  tpl({
    id: "modern",
    name: "Modern",
    description: "Clean single column with accent bar section titles.",
    layout: "single",
    theme: {
      ...baseTheme,
      accent: "#2563eb",
      sectionTitleStyle: "bar",
      accentBar: true,
    },
  }),
  tpl({
    id: "classic",
    name: "Classic",
    description: "Traditional serif look with underlined section titles.",
    layout: "single",
    theme: {
      ...baseTheme,
      accent: "#0f172a",
      headingFont: 'Georgia, "Times New Roman", Times, serif',
      bodyFont: 'Georgia, "Times New Roman", Times, serif',
      sectionTitleStyle: "underline",
      sectionTitleTransform: "uppercase",
      accentBar: false,
    },
  }),
  tpl({
    id: "ats",
    name: "ATS Safe",
    description: "Maximum parseability. Plain titles, no columns, no color.",
    layout: "single",
    theme: {
      ...baseTheme,
      accent: "#000000",
      primary: "#000000",
      text: "#000000",
      muted: "#333333",
      sectionTitleStyle: "plain",
      sectionTitleTransform: "uppercase",
      accentBar: false,
      divider: "#000000",
    },
    spacing: { ...baseSpacing, sectionGap: 12 },
  }),
  tpl({
    id: "leftSidebar",
    name: "Left Sidebar",
    description: "Contact and skills in a tinted left column.",
    layout: "leftSidebar",
    sidebarSections: ["profile", ...sidebarDefaults],
    mainSections: ["summary", "experience", "projects", "education"],
    headerSections: [],
    theme: { ...baseTheme, accent: "#0ea5e9", sectionTitleStyle: "bar" },
  }),
  tpl({
    id: "rightSidebar",
    name: "Right Sidebar",
    description: "Main content left, at-a-glance sidebar on the right.",
    layout: "rightSidebar",
    sidebarSections: ["profile", ...sidebarDefaults],
    mainSections: ["summary", "experience", "projects", "education"],
    headerSections: [],
    theme: { ...baseTheme, accent: "#7c3aed" },
  }),
  tpl({
    id: "twoColumn",
    name: "Two Column",
    description: "Balanced two column body, no sidebar tint.",
    layout: "twoCol",
    mainSections: ["summary", "experience", "projects"],
    sidebarSections: ["skills", "education", "certifications", "languages", "awards"],
    headerSections: ["profile"],
    theme: {
      ...baseTheme,
      accent: "#059669",
      sidebarBg: "transparent",
      sectionTitleStyle: "bar",
    },
    spacing: { ...baseSpacing, sidebarWidth: 240 },
  }),
  tpl({
    id: "threeColumn",
    name: "Three Column",
    description: "Compact three column dashboard layout.",
    layout: "threeCol",
    headerSections: ["profile"],
    mainSections: ["summary", "experience"],
    sidebarSections: ["projects", "education"],
    secondSidebarSections: ["skills", "certifications", "languages", "awards"],
    theme: { ...baseTheme, accent: "#f97316", sidebarBg: "transparent" },
    spacing: { ...baseSpacing, columnGap: 18, sidebarWidth: 190 },
  }),
  tpl({
    id: "headerTwoCol",
    name: "Header + Two Column",
    description: "Full-width header, then a two column body.",
    layout: "headerTwoCol",
    headerSections: ["profile"],
    mainSections: ["summary", "experience", "projects"],
    sidebarSections: ["skills", "education", "certifications", "languages"],
    theme: { ...baseTheme, accent: "#e11d48" },
    spacing: { ...baseSpacing, sidebarWidth: 220 },
  }),
  tpl({
    id: "headerThreeCol",
    name: "Header + Three Column",
    description: "Header up top with three columns beneath it.",
    layout: "headerThreeCol",
    headerSections: ["profile"],
    mainSections: ["summary", "experience"],
    sidebarSections: ["projects", "education"],
    secondSidebarSections: ["skills", "certifications", "languages", "awards"],
    theme: { ...baseTheme, accent: "#0891b2", sidebarBg: "transparent" },
    spacing: { ...baseSpacing, columnGap: 18, sidebarWidth: 180 },
  }),
  // --- Attached designs -------------------------------------------------

  tpl({
    id: "darkSidebarContact",
    name: "Dark Sidebar Contact",
    description: "Dark navy left card with name & summary, contact stack right.",
    layout: "leftSidebar",
    headerSections: [],
    sidebarSections: ["profile", "summary"],
    mainSections: ["education", "projects", "experience", "skills"],
    theme: {
      ...baseTheme,
      accent: "#14b8a6",
      primary: "#0f172a",
      sidebarBg: "#1e293b",
      sidebarText: "#f1f5f9",
      sectionTitleStyle: "plain",
      sectionTitleTransform: "uppercase",
      accentBar: false,
      bulletStyle: "square",
    },
    spacing: { ...baseSpacing, sidebarWidth: 280, sidebarPadding: 26, sectionGap: 16 },
  }),

  tpl({
    id: "tealCenteredHeader",
    name: "Teal Centered Header",
    description: "Full-width header, teal accents, centered section titles feel.",
    layout: "headerTwoCol",
    headerSections: ["profile"],
    mainSections: ["summary", "experience", "projects"],
    sidebarSections: ["education", "skills", "certifications", "languages"],
    theme: {
      ...baseTheme,
      accent: "#0d9488",
      primary: "#134e4a",
      sectionTitleStyle: "underline",
      sectionTitleTransform: "none",
      headingFont: 'Georgia, "Times New Roman", serif',
      bodyFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      accentBar: false,
      divider: "#5eead4",
    },
    spacing: { ...baseSpacing, sidebarWidth: 230 },
  }),

  tpl({
    id: "roseAccent",
    name: "Rose Accent",
    description: "Warm rose accent with serif display headings.",
    layout: "single",
    mainSections: ["profile", "summary", "experience", "projects", "education", "skills"],
    headerSections: [],
    theme: {
      ...baseTheme,
      accent: "#be123c",
      primary: "#0f172a",
      headingFont: 'Georgia, "Times New Roman", serif',
      sectionTitleStyle: "underline",
      sectionTitleTransform: "uppercase",
      accentBar: false,
      divider: "#fecdd3",
    },
  }),

  tpl({
    id: "slateBadge",
    name: "Slate Badge",
    description: "Chip-style section titles on a compact single column.",
    layout: "single",
    mainSections: ["profile", "summary", "experience", "projects", "education", "skills", "certifications"],
    headerSections: [],
    theme: {
      ...baseTheme,
      accent: "#334155",
      primary: "#0f172a",
      sectionTitleStyle: "chip",
      sectionTitleTransform: "uppercase",
      bulletStyle: "square",
      accentBar: false,
    },
    spacing: { ...baseSpacing, sectionGap: 12 },
  }),

  tpl({
    id: "amberDashed",
    name: "Amber Dashed",
    description: "Amber accent with dashed bullets and left-bar sections.",
    layout: "single",
    mainSections: ["profile", "summary", "experience", "projects", "education", "skills"],
    headerSections: [],
    theme: {
      ...baseTheme,
      accent: "#d97706",
      primary: "#78350f",
      sectionTitleStyle: "bar",
      sectionTitleTransform: "uppercase",
      accentBar: true,
      bulletStyle: "dash",
    },
  }),

  tpl({
    id: "indigoRight",
    name: "Indigo Right",
    description: "Right-side indigo sidebar for contact + skills.",
    layout: "rightSidebar",
    headerSections: [],
    sidebarSections: ["profile", "skills", "languages", "certifications"],
    mainSections: ["summary", "experience", "projects", "education"],
    theme: {
      ...baseTheme,
      accent: "#6366f1",
      primary: "#1e1b4b",
      sidebarBg: "#eef2ff",
      sidebarText: "#1e1b4b",
      sectionTitleStyle: "bar",
      accentBar: true,
    },
    spacing: { ...baseSpacing, sidebarWidth: 240, sidebarPadding: 24 },
  }),

  tpl({
    id: "footer",
    name: "Footer Layout",
    description: "Single column with a persistent references footer.",
    layout: "footer",
    headerSections: ["profile"],
    mainSections: ["summary", "experience", "projects", "education", "skills"],
    footerSections: ["references", "languages"],
    theme: { ...baseTheme, accent: "#334155" },
    spacing: { ...baseSpacing, footerHeight: 90 },
  }),

  // ════════════════════════════════════════════════════════════════════════
  // ATS Pro templates — from dummy/ folder in careeros repo
  // ════════════════════════════════════════════════════════════════════════

  tpl({
    id: "professional-one-column",
    name: "Professional One Column",
    description: "3-column header · avatar · summary in header",
    layout: "single",
    headerSections: ["profile"],
    mainSections: ["experience", "projects", "education", "skills", "certifications", "languages", "interests"],
    theme: {
      ...baseTheme,
      primary: "#24364B",
      accent: "#3C7A89",
      text: "#222222",
      muted: "#6B7280",
      divider: "#D9D9D9",
      bodyFont: SANS,
      headingFont: SANS,
      sectionTitleStyle: "underline",
      sectionTitleTransform: "uppercase",
      accentBar: false,
      photoShape: "none",
      profileStyle: "pro-3col",
      sectionStyle: "plain",
      showSummaryInHeader: true,
      avatarInitial: true,
      avatarShape: "circle",
      avatarSize: 90,
      chipStyle: "rounded",
      chipBg: "#F1F3F5",
      chipText: "#222222",
      baseSize: 14,
    },
    spacing: {
      ...baseSpacing,
      pageMarginTop: 28,
      pageMarginRight: 32,
      pageMarginBottom: 28,
      pageMarginLeft: 32,
      sectionGap: 24,
      entryGap: 20,
      bulletGap: 6,
    },
  }),

  tpl({
    id: "professional-timeline",
    name: "Professional Timeline",
    description: "Centered header · timeline labels · gold dots",
    layout: "single",
    headerSections: ["profile"],
    mainSections: ["experience", "education", "projects", "skills", "certifications", "languages", "interests"],
    theme: {
      ...baseTheme,
      primary: "#222222",
      accent: "#7B2CBF",
      text: "#222222",
      muted: "#666666",
      divider: "#E5E5E5",
      bodyFont: SANS,
      headingFont: SANS,
      sectionTitleStyle: "plain",
      sectionTitleTransform: "uppercase",
      accentBar: false,
      photoShape: "none",
      profileStyle: "timeline-header",
      sectionStyle: "timeline",
      showSummaryInHeader: false,
      avatarInitial: true,
      avatarShape: "square",
      avatarSize: 48,
      chipStyle: "pill",
      chipBg: "#F1F1F3",
      chipText: "#333333",
      timelineWidth: 170,
      timelineDotColor: "#F4B400",
      timelineLineColor: "#D8D8D8",
      baseSize: 14,
    },
    spacing: {
      ...baseSpacing,
      pageMarginTop: 30,
      pageMarginRight: 28,
      pageMarginBottom: 30,
      pageMarginLeft: 28,
      sectionGap: 22,
      entryGap: 22,
      bulletGap: 6,
    },
  }),
];

export const templateById = new Map(templates.map((t) => [t.id, t]));

export function getTemplate(id: string): Template {
  return templateById.get(id) ?? templates[0];
}
