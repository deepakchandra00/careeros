// Template presets for CareerOS — 100+ templates built from 13 base layouts
// × accent colors × fonts × professional names.
//
// Each preset references a `base` template (one of the 13 existing layouts)
// and can override the accent color and font. This gives 100+ visually distinct
// options without 100 separate code implementations.

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  base: string; // one of the 13 existing template IDs
  accent: string;
  font: "sans" | "serif" | "mono";
  category: string;
}

const COLORS = [
  { name: "Emerald", hex: "#10b981" },
  { name: "Teal", hex: "#0891b2" },
  { name: "Amber", hex: "#b45309" },
  { name: "Rose", hex: "#e11d48" },
  { name: "Purple", hex: "#7c3aed" },
  { name: "Navy", hex: "#1e293b" },
  { name: "Slate", hex: "#374151" },
  { name: "Fuchsia", hex: "#c026d3" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Forest", hex: "#059669" },
  { name: "Crimson", hex: "#dc2626" },
  { name: "Indigo Dark", hex: "#312e81" }, // very dark, used sparingly
];

const FONTS: ("sans" | "serif" | "mono")[] = ["sans", "serif", "mono"];

const BASES = [
  { id: "modern", name: "Modern", desc: "Two-column sidebar" },
  { id: "ats", name: "ATS", desc: "Single-column, parseable" },
  { id: "executive", name: "Executive", desc: "Centered serif header" },
  { id: "minimal", name: "Minimal", desc: "Ultra-clean, airy" },
  { id: "software-engineer", name: "Engineer", desc: "Dark sidebar + photo" },
  { id: "academic", name: "Academic", desc: "Scholarly sidebar" },
  { id: "creative", name: "Creative", desc: "Bold + skill bars" },
  { id: "web-developer", name: "Developer", desc: "Diagonal + skill bars" },
  { id: "ux-designer", name: "UX", desc: "Timeline + photo" },
  { id: "teacher", name: "Teacher", desc: "Diagonal + skill bars" },
  { id: "product-manager", name: "PM", desc: "Green bars + photo" },
  { id: "finance", name: "Finance", desc: "Header band + 2-col" },
  { id: "business-analyst", name: "Analyst", desc: "Navy + yellow timeline" },
];

const ROLE_NAMES = [
  "Software Engineer", "Senior Developer", "Tech Lead", "Frontend Engineer",
  "Backend Developer", "Full Stack Developer", "DevOps Engineer", "Data Scientist",
  "Product Manager", "UX Designer", "UI Designer", "QA Engineer",
  "System Architect", "Engineering Manager", "Mobile Developer", "ML Engineer",
  "Cloud Engineer", "Security Engineer", "Database Admin", "IT Consultant",
  "Business Analyst", "Financial Analyst", "Marketing Manager", "Sales Lead",
  "Project Manager", "Scrum Master", "Technical Writer", "Research Scientist",
  "Professor", "Student", "Intern", "Fresher",
  "Government", "Military Veteran", "Career Switch", "Freelancer",
  "Startup Founder", "CTO", "VP Engineering", "Director",
  "HR Manager", "Recruiter", "Operations Manager", "Supply Chain",
  "Healthcare IT", "EdTech", "FinTech", "E-Commerce",
  "SaaS", "Blockchain", "AR/VR", "IoT",
];

function generatePresets(): TemplatePreset[] {
  const presets: TemplatePreset[] = [];

  // First: the 13 original templates (exact match, no override)
  BASES.forEach((b) => {
    const color = COLORS.find((c) => c.hex.toLowerCase() === getBaseAccent(b.id).toLowerCase()) ?? COLORS[0];
    presets.push({
      id: b.id,
      name: b.name,
      description: b.desc,
      base: b.id,
      accent: getBaseAccent(b.id),
      font: "sans",
      category: "Featured",
    });
  });

  // Then: variations — each base × each color × selected fonts
  let count = 13;
  for (const base of BASES) {
    for (const color of COLORS) {
      // Skip if it matches the base's default color (already added above)
      if (color.hex.toLowerCase() === getBaseAccent(base.id).toLowerCase()) continue;
      for (const font of FONTS) {
        if (count >= 120) break;
        const roleIdx = (count - 13) % ROLE_NAMES.length;
        const roleName = ROLE_NAMES[roleIdx];
        const fontLabel = font === "serif" ? " Serif" : font === "mono" ? " Mono" : "";
        presets.push({
          id: `${base.id}-${color.name.toLowerCase()}-${font}-${count}`,
          name: `${roleName} ${base.name}${fontLabel}`,
          description: `${base.desc} · ${color.name}`,
          base: base.id,
          accent: color.hex,
          font,
          category: base.name,
        });
        count++;
      }
      if (count >= 120) break;
    }
    if (count >= 120) break;
  }

  return presets;
}

function getBaseAccent(id: string): string {
  const accents: Record<string, string> = {
    modern: "#10b981",
    ats: "#374151",
    executive: "#b45309",
    minimal: "#0f172a",
    "software-engineer": "#1e293b",
    academic: "#374151",
    creative: "#ea580c",
    "web-developer": "#f97316",
    "ux-designer": "#1e3a5f",
    teacher: "#eab308",
    "product-manager": "#059669",
    finance: "#1f2937",
    "business-analyst": "#1e3a5f",
  };
  return accents[id] ?? "#10b981";
}

export const TEMPLATE_PRESETS: TemplatePreset[] = generatePresets();

export const TEMPLATE_CATEGORIES = [
  "All",
  "Featured",
  ...Array.from(new Set(BASES.map((b) => b.name))),
];
