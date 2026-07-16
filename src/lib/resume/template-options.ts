// Shared, framework-agnostic constants for resume templates.
// Importable from both server and client components.

export const FONT_OPTIONS: { id: string; name: string; stack: string }[] = [
  {
    id: "sans",
    name: "Sans",
    stack:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  {
    id: "serif",
    name: "Serif",
    stack: "ui-serif, Georgia, Cambria, Times New Roman, serif",
  },
  {
    id: "mono",
    name: "Mono",
    stack: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
];

export const ACCENT_OPTIONS: string[] = [
  "#10b981",
  "#0891b2",
  "#7c3aed",
  "#b45309",
  "#dc2626",
  "#0f172a",
  "#db2777",
  "#0d9488",
];

export const TEMPLATE_OPTIONS: {
  id: string;
  name: string;
  description: string;
  accent: string;
}[] = [
  { id: "modern", name: "Modern", description: "Two-column sidebar", accent: "#10b981" },
  { id: "ats", name: "ATS", description: "Single-column, parseable", accent: "#374151" },
  { id: "executive", name: "Executive", description: "Centered serif header", accent: "#b45309" },
  { id: "minimal", name: "Minimal", description: "Ultra-clean, airy", accent: "#0f172a" },
  { id: "software-engineer", name: "Software Engineer", description: "Dark sidebar + photo", accent: "#1e293b" },
  { id: "academic", name: "Academic CV", description: "Scholarly sidebar", accent: "#374151" },
  { id: "creative", name: "Creative Designer", description: "Bold + skill bars", accent: "#ea580c" },
  { id: "web-developer", name: "Web Developer", description: "Diagonal + skill bars", accent: "#f97316" },
  { id: "ux-designer", name: "UX Designer", description: "Timeline + photo", accent: "#1e3a5f" },
  { id: "teacher", name: "Teacher", description: "Diagonal + skill bars", accent: "#eab308" },
  { id: "product-manager", name: "Product Manager", description: "Green bars + photo", accent: "#059669" },
  { id: "finance", name: "Finance Executive", description: "Header band + 2-col", accent: "#1f2937" },
  { id: "business-analyst", name: "Business Analyst", description: "Navy + yellow timeline", accent: "#1e3a5f" },
];

export function fontStackFor(fontId: string): string {
  return FONT_OPTIONS.find((f) => f.id === fontId)?.stack ?? FONT_OPTIONS[0].stack;
}
